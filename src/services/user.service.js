import bcrypt from "bcrypt";

import db from "../models/database/index.js";
import { signToken } from "../utils/jwt.js";
import { Permission, TokenType } from "../constants/enums.js";
import { sendMail } from "./sendMail.service.js";
import axios from "axios";
import { randomPassword } from "../utils/helpers.js";
import { Op } from "sequelize";
import { envConfig } from "../config/config.js";

const User = db.users;
const sequelize = db.sequelize;

class UserService {
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} permission
	 * @returns
	 */
	signAccessToken(userId, permission) {
		return signToken({
			payload: {
				userId,
				permission,
				tokenType: TokenType.AccessToken,
			},
			privateKey: envConfig.jwtSecretAccessToken,
			options: {
				expiresIn: envConfig.accessTokenExpiresIn,
			},
		});
	}
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} permission
	 * @param {Number} exp is used to refresh token
	 * @returns
	 */
	signRefreshToken(userId, permission, exp) {
		if (exp) {
			return signToken({
				payload: {
					userId,
					permission,
					tokenType: TokenType.RefreshToken,
					exp,
				},
				privateKey: envConfig.jwtSecretRefreshToken,
			});
		} else {
			return signToken({
				payload: {
					userId,
					permission,
					tokenType: TokenType.RefreshToken,
				},
				privateKey: envConfig.jwtSecretRefreshToken,
				options: {
					expiresIn: envConfig.refreshTokenExpiresIn,
				},
			});
		}
	}
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} permission
	 * @returns
	 */
	signForgotPasswordToken(userId, permission) {
		return signToken({
			payload: {
				userId,
				permission,
				tokenType: TokenType.ForgotPasswordToken,
			},
			privateKey: envConfig.jwtSecretForgotPasswordToken,
			options: {
				expiresIn: envConfig.forgotPasswordTokenExpiresIn,
			},
		});
	}
	/**
	 * create [accessToken, refreshToken] from user_id and permission_id
	 * @param {Number} user_id
	 * @param {Number} permission_id
	 * @returns [accessToken, refreshToken]
	 */
	async signJWT(user_id, permission_id) {
		if (!user_id || !permission_id) {
			throw new Error("Payload is used to sign jwt is not valid!");
		}
		const [accessToken, refreshToken] = await Promise.all([
			this.signAccessToken(user_id, permission_id),
			this.signRefreshToken(user_id, permission_id),
		]);
		return [accessToken, refreshToken];
	}
	/**
	 * return true if exist
	 * @param {String} username
	 * @returns true
	 */
	async checkUsernameExist(username) {
		const data = await User.findOne({
			attributes: ["username"],
			where: { username: username },
		});
		return Boolean(data);
	}

	/**
	 *
	 * @param {Number} user_id
	 * @param {Number} permission_id
	 * @returns access_token and refresh_token
	 */
	async signIn(user_id, permission_id) {
		const [accessToken, refreshToken] = await this.signJWT(user_id, permission_id);
		await User.update(
			{
				refresh_token: refreshToken,
			},
			{
				where: {
					user_id: user_id,
				},
			},
		);
		return { accessToken, refreshToken };
	}
	/**
	 *
	 * @param {String} code
	 * @returns id_token
	 */
	async #getOauthGoogleToken(code) {
		const body = {
			code,
			client_id: envConfig.googleClientID,
			client_secret: envConfig.googleClientSecret,
			redirect_uri: envConfig.googleRedirectURI,
			grant_type: "authorization_code",
		};
		const { data } = await axios.post("https://oauth2.googleapis.com/token", body, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
		return data;
	}
	/**
	 *
	 * get user info from access_token and id_token
	 * @param {String} access_token
	 * @param {String} id_token
	 * @returns
	 */
	async #getGoogleUserInfo(access_token, id_token) {
		const { data } = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
			params: {
				access_token,
				alt: "json",
			},
			headers: {
				Authorization: "Bearer " + id_token,
			},
		});
		return data;
	}
	/**
	 *
	 * @param {String} code
	 */
	async oauth(code) {
		const { id_token, access_token } = await this.#getOauthGoogleToken(code);
		const userInfo = await this.#getGoogleUserInfo(access_token, id_token);
		const email = userInfo.email;
		const id = userInfo.id;
		const newUsername = email.substring(0, email.indexOf("@")) + "_" + id.substring(0, 3);
		const user = await this.getUserByEmail(userInfo.email);
		// check permission ?
		if (user) {
			if (user.permission_id === Permission.Admin) {
				// throw new ErrorStatus({ message: "this email has already existed with admin role!" });
				return null;
			} else {
				// if existed, then login
				const [access_token, refresh_token] = await this.signJWT(user.user_id, user.permission_id);
				// update refresh_token
				await User.update(
					{
						refresh_token,
					},
					{
						where: {
							user_id: user.user_id,
						},
					},
				);
				return {
					access_token,
					refresh_token,
					isNewUser: false,
				};
			}
		} else {
			// if not existed, then create new one
			const data = await this.signUp({
				first_name: userInfo.given_name,
				last_name: userInfo.family_name,
				email: userInfo.email,
				image: userInfo.picture,
				username: newUsername,
				password: bcrypt.hashSync(randomPassword(), parseInt(envConfig.passwordSaltRounds)),
				permission: Permission.Customer,
			});
			return {
				...data,
				isNewUser: true,
				// verify: userInfo.verified_email
			};
		}
	}
	/**
	 * permission: 1: customer, 2: admin
	 * @param {Object} payload object, see in sign up middleware
	 * @param {String} payload.first_name
	 * @param {String} payload.last_name
	 * @param {String} payload.username
	 * @param {String} payload.email
	 * @param {String} payload.password
	 * @param {Number} payload.permission
	 * @returns
	 */
	async signUp(payload) {
		// should use transaction and return Promise reject
		const t = await sequelize.transaction();
		try {
			const insertedUser = await User.create(
				{
					...payload,
					password: bcrypt.hashSync(payload.password, parseInt(envConfig.passwordSaltRounds)),
					permission_id: payload.permission,
				},
				{ transaction: t },
			);
			const user_id = insertedUser.dataValues.user_id;
			const permission_id = insertedUser.dataValues.permission_id;
			const [accessToken, refreshToken] = await this.signJWT(user_id, permission_id);
			await t.commit();
			insertedUser.set({
				refresh_token: refreshToken,
			});
			await insertedUser.save();
			// return accessToken, refreshToken
			return {
				access_token: accessToken,
				refresh_token: refreshToken,
			};
		} catch (error) {
			// can not rollback when committed
			await t.rollback();
			return Promise.reject(error);
		}
	}

	/**
	 *
	 * @param {Number} user_id
	 * @returns
	 */
	async logout(user_id) {
		const data = await User.update(
			{
				refresh_token: null,
			},
			{
				where: {
					user_id: user_id,
				},
			},
		);
		return data;
	}
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} permission
	 * @param {Number} exp
	 * @returns
	 */
	async refreshToken(userId, permission, exp) {
		const [accessToken, refreshToken] = await Promise.all([
			this.signAccessToken(userId, permission),
			this.signRefreshToken(userId, permission, exp),
		]);
		await User.update(
			{
				refresh_token: refreshToken,
			},
			{
				where: {
					user_id: userId,
				},
			},
		);
		return { accessToken, refreshToken };
	}

	/**
	 *
	 * @param {String} fe_url
	 * @param {String} email
	 * @param {Number} userId
	 * @param {Number} permission
	 * @returns
	 */
	async forgotPassword(fe_url, email, userId, permission) {
		const forgotPasswordToken = await this.signForgotPasswordToken(userId, permission);
		await User.update(
			{
				forgot_password_token: forgotPasswordToken,
			},
			{
				where: {
					user_id: userId,
				},
			},
		);
		// send to mail 1 link look like this: https://fe-url/forgot-password?token=token
		const title = "Password Reset Request";
		const html = `
		<h4>Hello,</h4>

		<p>
			We received a password reset request for your account. If you requested that we reset your password, click the link below. If you did not submit this request, feel free to ignore this email.
		</p>

		<div>
			<a href="${fe_url + forgotPasswordToken}">${fe_url + forgotPasswordToken}</a>
		</div>

		<p>Have a nice day!</p>
		`;
		await sendMail(email, title, null, html);
		return forgotPasswordToken;
	}

	/**
	 *
	 * @param {Number} userId
	 * @param {Number} password
	 * @returns
	 */
	async resetPassword(userId, password) {
		await User.update(
			{
				forgot_password_token: "",
				password: bcrypt.hashSync(password, parseInt(envConfig.passwordSaltRounds)),
			},
			{
				where: {
					user_id: userId,
				},
			},
		);
		return userId;
	}

	/**
	 * get all users
	 * @param {Number} offset
	 * @param {Number} limit
	 * @param {Object} condition
	 * @returns
	 */
	async adminGetAll(offset, limit, condition) {
		const data = await User.findAndCountAll({
			attributes: {
				exclude: ["forgot_password_token", "refresh_token"],
			},
			offset,
			limit,
		});
		return data;
	}

	/**
	 *
	 * @param {String} email
	 * @returns user if any, else null
	 */
	async getUserByEmail(email) {
		const data = await User.findOne({
			attributes: {
				exclude: ["forgot_password_token", "refresh_token"],
			},
			where: { email },
		});
		return data;
	}
	/**
	 *
	 * @param {String} phone
	 */
	async getUserByPhone(phone) {
		const user = await User.findOne({
			attributes: {
				exclude: ["forgot_password_token", "refresh_token"],
			},
			where: { phone },
		});
		return user;
	}

	/**
	 *
	 * @param {String} username
	 * @returns
	 */
	async getUserByUsername(username) {
		const data = await User.findOne({
			attributes: {
				exclude: ["forgot_password_token", "refresh_token"],
			},
			where: { username },
		});
		return data;
	}

	/**
	 *
	 * @param {Number} userId
	 * @returns
	 */
	async getUser(userId) {
		const data = await User.findOne({
			include: {
				model: db.address,
				as: "address",
				include: {
					model: db.ward,
					as: "ward",
					include: {
						model: db.district,
						as: "district",
						include: { model: db.province, as: "province" },
					},
				},
			},
			attributes: {
				exclude: ["forgot_password_token", "refresh_token", "address_id"],
			},
			where: { user_id: userId },
		});
		return data;
	}

	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.user_id
	 * @param {String} param0.first_name
	 * @param {String} param0.last_name
	 * @param {Number} param0.address_id
	 * @param {String} param0.email
	 * @param {String} param0.phone
	 * @returns
	 */
	async updateUser({ user_id, first_name, last_name, address_id, email, phone, image }) {
		const body = {};
		if (first_name) {
			body.first_name = first_name;
		}
		if (last_name) {
			body.last_name = last_name;
		}
		if (address_id) {
			body.address_id = address_id;
		}
		if (email) {
			body.email = email;
		}
		if (phone) {
			body.phone = phone;
		}
		if (image) {
			body.image = image;
		}
		const data = await User.update(
			{
				...body,
			},
			{
				where: {
					user_id,
				},
			},
		);
		return data;
	}
	/**
	 *
	 * @param {String} phone
	 * @param {Number} user_id
	 * @returns true if exists
	 */
	async checkPhoneExist(phone, user_id) {
		let result = await User.findOne({
			where: {
				phone,
				user_id: {
					[Op.ne]: user_id,
				},
			},
		});
		return Boolean(result);
	}
	/**
	 *
	 * @param {String} email
	 * @param {Number} user_id
	 * @returns
	 */
	async checkEmailExist(email, user_id) {
		let result = await User.findOne({
			where: {
				email,
				user_id: {
					[Op.ne]: user_id,
				},
			},
		});
		return Boolean(result);
	}
}

const userService = new UserService();

export default userService;
