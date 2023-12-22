import pkg from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ExpressValidator, checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import userService from "../services/user.service.js";
import { ErrorStatus } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";
import { verifyToken } from "../utils/jwt.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import {
	emailCheck,
	firstnameCheck,
	lastnameCheck,
	phoneCheck,
} from "../validation/users.validation.js";
import { envConfig } from "../config/config.js";

const { JsonWebTokenError } = pkg;

const { checkSchema: checkSchema2 } = new ExpressValidator({
	customValidator: (value) => {
		console.log("customValidator", value);
		// throw new Error("customValidator has errors");
		return true;
	},
});

const usernameCheck = {
	// customValidator: true,
	notEmpty: {
		errorMessage: MESSAGE.IS_REQUIRED,
	},
	isString: true,
	isLength: {
		options: {
			min: 1,
			max: 50,
		},
	},
	trim: true,
};
const passwordCheck = {
	notEmpty: {
		errorMessage: "Password" + MESSAGE.IS_REQUIRED,
	},
	isString: true,
	isLength: {
		options: {
			min: 6,
			max: 50,
		},
	},
	isStrongPassword: {
		options: {
			minLength: 6,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
	},
};

const forgotPasswordTokenCheck = {
	trim: true,
	custom: {
		options: async (value, { req }) => {
			if (!value) {
				throw new ErrorStatus({
					message: "Forgot password token " + MESSAGE.IS_REQUIRED,
					status: HTTP_STATUS.UNAUTHORIZED,
				});
			}
			try {
				const decoded_forgot_password_token = await verifyToken({
					token: value,
					secretOrPublicKey: envConfig.jwtSecretForgotPasswordToken,
				});
				const { userId } = decoded_forgot_password_token;
				const user = await userService.getUser(userId);
				if (!user) {
					throw new ErrorStatus({
						status: HTTP_STATUS.UNAUTHORIZED,
						message: "user_id " + MESSAGE.NOT_EXIST,
					});
				}
				if (user.forgot_password_token !== value) {
					throw new ErrorStatus({
						status: HTTP_STATUS.UNAUTHORIZED,
						message: "forgot_password_token " + MESSAGE.NOT_EXIST,
					});
				}
				req.decoded_forgot_password_token = decoded_forgot_password_token;
				return true;
			} catch (error) {
				if (error instanceof JsonWebTokenError) {
					throw new ErrorStatus({
						message: error.message || "Refresh token " + MESSAGE.IS_INVALID,
						status: HTTP_STATUS.UNAUTHORIZED,
					});
				} else {
					throw error;
				}
			}
		},
	},
};

export const signInValidator = validate(
	checkSchema2(
		{
			username: {
				...usernameCheck,
				customValidator: {
					errorMessage: "customValidator has errors",
				},
				custom: {
					options: async (value, { req }) => {
						const user = await userService.getUserByUsername(value);
						if (user === null) {
							throw new ErrorStatus({
								success: false,
								message: "USERNAME" + ` [${value}] ` + MESSAGE.NOT_EXIST,
								status: HTTP_STATUS.BAD_REQUEST,
							});
						}
						const passwordMatched = bcrypt.compareSync(req.body.password, user.dataValues.password);
						if (!passwordMatched) {
							throw new ErrorStatus({
								success: false,
								message: "USERNAME or PASSWORD " + MESSAGE.NOT_MATCHED,
								status: HTTP_STATUS.UNAUTHORIZED,
							});
						}
						req.user = user;
						return true;
					},
				},
			},
			password: passwordCheck,
		},
		["body"],
	),
);

export const signUpValidator = validate(
	checkSchema(
		{
			first_name: {
				...firstnameCheck,
			},
			last_name: {
				...lastnameCheck,
			},
			username: {
				...usernameCheck,
				custom: {
					options: async (value, { req }) => {
						// check exist username
						const user = await userService.getUserByUsername(value);
						if (user) {
							throw new ErrorStatus({
								message: "username" + MESSAGE.ALREADY_EXIST,
							});
						}
						return true;
					},
				},
			},
			email: {
				...emailCheck,
				custom: {
					options: async (value, { req }) => {
						const user = await userService.getUserByEmail(value);
						if (user) {
							throw new ErrorStatus({ message: "Email " + MESSAGE.ALREADY_EXIST });
						}
						req.user = user;
						return true;
					},
				},
			},
			password: passwordCheck,
			permission: {
				isIn: {
					options: [[1, 2]],
					errorMessage: "permission" + "in 1, 2",
				},
			},
		},
		["body"],
	),
);
/**
 * if verify successfully, then set decode to req, and then get permission from decode
 */
export const accessTokenValidator = validate(
	checkSchema(
		{
			Authorization: {
				notEmpty: {
					errorMessage: "access_token is " + MESSAGE.NOT_EMPTY,
				},
				custom: {
					options: async (value, { req }) => {
						const access_token = (value || "").split(" ")[1];
						if (!access_token) {
							throw new ErrorStatus({
								status: HTTP_STATUS.UNAUTHORIZED,
								message: "access_token " + MESSAGE.IS_REQUIRED,
								success: false,
							});
						}
						try {
							const decoded = await verifyToken({
								token: access_token,
								secretOrPublicKey: envConfig.jwtSecretAccessToken,
							});
							req.decoded = decoded;
							return true;
						} catch (error) {
							throw new ErrorStatus({
								message: error.message || MESSAGE.IS_INVALID,
								status: HTTP_STATUS.UNAUTHORIZED,
							});
						}
					},
				},
			},
		},
		["headers"],
	),
);

export const refreshTokenValidator = validate(
	checkSchema(
		{
			refresh_token: {
				notEmpty: {
					errorMessage: MESSAGE.IS_REQUIRED,
				},
				isString: { errorMessage: MESSAGE.IS_STRING },
				custom: {
					options: async (value, { req }) => {
						try {
							const decoded_refresh_token = await verifyToken({
								token: value,
								secretOrPublicKey: envConfig.jwtSecretRefreshToken,
							});
							const user = await userService.getUser(decoded_refresh_token.userId);
							if (!user) {
								throw new ErrorStatus({
									status: HTTP_STATUS.UNAUTHORIZED,
									message: "refresh_token " + MESSAGE.NOT_EXIST,
								});
							}
							req.decoded_refresh_token = decoded_refresh_token;
							return true;
						} catch (error) {
							if (error instanceof JsonWebTokenError) {
								throw new ErrorStatus({
									message: "Refresh token " + (error.message || MESSAGE.IS_INVALID),
									status: HTTP_STATUS.UNAUTHORIZED,
								});
							} else {
								throw error;
							}
						}
					},
				},
			},
		},
		["body"],
	),
);
// forgot password validator
export const forgotPasswordValidator = validate(
	checkSchema(
		{
			fe_url: {
				notEmpty: {
					errorMessage: "fe_url " + MESSAGE.NOT_EMPTY,
				},
				isString: true,
				trim: true,
			},
			email: {
				...emailCheck,
				custom: {
					options: async (value, { req }) => {
						const user = await userService.getUserByEmail(value);
						if (user === null) {
							throw new ErrorStatus({ message: "Email " + MESSAGE.NOT_FOUND });
						}
						req.user = user;
						return true;
					},
				},
			},
		},
		["body"],
	),
);

export const forgotPasswordTokenValidator = validate(
	checkSchema(
		{
			forgot_password_token: forgotPasswordTokenCheck,
		},
		["body"],
	),
);

export const resetPasswordValidator = validate(
	checkSchema(
		{
			password: passwordCheck,
			forgot_password_token: forgotPasswordTokenCheck,
		},
		["body"],
	),
);

export const updateUserSchema = checkSchema(
	{
		first_name: {
			...firstnameCheck,
		},
		last_name: {
			...lastnameCheck,
		},
		// address_id: {
		// 	...addressIDCheck,
		// },
		// specific_address: { ...specificAddressCheck },
		// ward_id: {
		// 	...wardIDCheck,
		// },
		email: {
			...emailCheck,
			custom: {
				options: async (value, { req }) => {
					const userInfo = req.decoded;
					const isExistMail = await userService.checkEmailExist(value, userInfo.userId);
					if (isExistMail) {
						throw new ErrorStatus({ message: "email" + MESSAGE.ALREADY_EXIST });
					}
					return true;
				},
			},
		},
		phone: {
			...phoneCheck,
			custom: {
				options: async (value, { req }) => {
					const userInfo = req.decoded;
					const isExistPhone = await userService.checkPhoneExist(value, userInfo.userId);
					if (isExistPhone) {
						throw new ErrorStatus({ message: "phone" + MESSAGE.ALREADY_EXIST });
					}
					return true;
				},
			},
		},
	},
	["body"],
);

export const usernameParamValidator = validate(
	checkSchema(
		{
			username: {
				notEmpty: {
					errorMessage: "username" + MESSAGE.NOT_EMPTY,
				},
				isString: {
					errorMessage: "username" + MESSAGE.IS_STRING,
				},
				custom: {
					options: async (value, { req }) => {
						const user = await userService.getUserByUsername(value);
						if (!user) {
							throw new ErrorStatus({ message: value + MESSAGE.NOT_FOUND });
						}
						req.user = user;
						return true;
					},
				},
			},
		},
		["params"],
	),
);
