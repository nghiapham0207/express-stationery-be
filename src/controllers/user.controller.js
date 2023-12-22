import { validationResult } from "express-validator";
import { updateUserSchema } from "../middlewares/user.middleware.js";
import { ErrorStatus } from "../models/Errors.js";
import { SuccessStatus } from "../models/Success.js";
import { catchMulterErr, upload } from "../services/uploadFiles.service.js";
import userService from "../services/user.service.js";
import { getPagination, getPagingData } from "../utils/helpers.js";
import { mapSchemaError } from "../utils/validation.js";
import multer from "multer";
import { singleDelete, singleUpload } from "../services/firebase.service.js";
import addressService from "../services/address.service.js";
import { envConfig } from "../config/config.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getUser = async (req, res) => {
	const { userId } = req.decoded;
	const data = await userService.getUser(userId);
	return res.status(200).json(
		new SuccessStatus({
			message: "get user successfully!",
			data,
		}),
	);
};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getUserByUsername = async (req, res) => {
	// const { username } = req.params;
	const user = req.user;
	return res.status(200).json(
		new SuccessStatus({
			message: "get user by username successfully!",
			data: user,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const signUp = async (req, res) => {
	const dataBody = req.body;
	const data = await userService.signUp(dataBody);
	return res.status(200).json(
		new SuccessStatus({
			message: "sign up successfully!",
			data,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const signIn = async (req, res) => {
	const { user } = req;
	const userId = user.dataValues.user_id;
	const permissionId = user.dataValues.permission_id;
	const data = await userService.signIn(userId, permissionId);
	return res.json(
		new SuccessStatus({
			message: "sign in successfully!",
			data: data,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const oauth = async (req, res, next) => {
	const { code } = req.query;
	const result = await userService.oauth(code);
	if (!result) {
		return next(new ErrorStatus({ message: "this email has already existed with admin role!" }));
	}
	const urlRedirect = `${envConfig.clientRedirect}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&is_new_user=${result.isNewUser}`;
	return res.redirect(urlRedirect);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const logout = async (req, res) => {
	const decoded = req.decoded;
	await userService.logout(decoded.userId);
	return res.status(200).json(
		new SuccessStatus({
			message: "logout successfully!",
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const refreshToken = async (req, res, next) => {
	const { userId, permission, exp } = req.decoded_refresh_token;
	const result = await userService.refreshToken(userId, permission, exp);
	return res.status(200).json(
		new SuccessStatus({
			message: "refreshed token successfully!",
			data: result,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const forgotPassword = async (req, res, next) => {
	const { email, user_id, permission } = req.user;
	const { fe_url } = req.body;
	const result = await userService.forgotPassword(fe_url, email, user_id, permission);
	return res.status(200).json(
		new SuccessStatus({
			message: "Sended mail successfully!",
			data: result,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const forgotPasswordToken = async (req, res, next) => {
	return res.status(200).json(
		new SuccessStatus({
			message: "forgot password is verified successfully!",
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const resetPassword = async (req, res, next) => {
	const { userId } = req.decoded_forgot_password_token;
	const { password } = req.body;
	const result = await userService.resetPassword(userId, password);
	return res.status(200).json(
		new SuccessStatus({
			message: "reset password successfully!",
			data: result,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const adminGetAll = async (req, res) => {
	const { page, size } = req.query;
	const { offset, limit } = getPagination(page, size);
	const result = await userService.adminGetAll(offset, limit);
	const data = getPagingData(result, page, size);
	return res.json(
		new SuccessStatus({
			message: "get all user successfully!",
			data: data,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const updateUser = async (req, res, next) => {
	upload.memoryStorage.single("user_image")(req, res, async (err) => {
		if (err instanceof multer.MulterError) {
			return catchMulterErr(err, next);
		} else if (err) {
			// An unknown error occurred when uploading.
			return next(
				new ErrorStatus({
					message: err,
				}),
			);
		}
		await updateUserSchema.run(req);
		const validationError = validationResult(req);
		if (validationError.isEmpty()) {
			const body = req.body;
			const userId = req.decoded.userId;
			const user = await userService.getUser(userId);
			const image = req.file || null;
			let imageURL = "";
			if (image !== null) {
				if (user.dataValues.image) {
					try {
						await singleDelete(user.dataValues.image);
					} catch (error) {
						console.log("updateUser delete image", error);
					}
				}
				imageURL = await singleUpload(image);
			}
			const data = {
				...body,
			};
			delete data.user_image;
			if (imageURL) {
				data.image = imageURL;
			}
			// const addressID = await addressService.updateDeliveryAddress(data);
			// data.address_id = addressID;
			data.user_id = userId;
			await userService.updateUser(data);
			return res.json(
				new SuccessStatus({
					message: "updated user successfully!",
				}),
			);
		} else {
			delete req.file;
			const schemaError = mapSchemaError(validationError, next);
			next(schemaError);
		}
	});
};
