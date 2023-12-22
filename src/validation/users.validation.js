import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGE } from "../constants/messages.js";
import { ErrorStatus } from "../models/Errors.js";
import userService from "../services/user.service.js";

export const userIDCheck = {
	isInt: {
		errorMessage: "receiver_id" + MESSAGE.MUST_BE_NUMERIC,
	},
	custom: {
		options: async (value) => {
			const user = await userService.getUser(parseInt(value));
			if (!user) {
				throw new ErrorStatus({
					message: "User" + MESSAGE.NOT_FOUND,
					status: HTTP_STATUS.FORBIDDEN,
				});
			}
			return true;
		},
	},
};

export const firstnameCheck = {
	notEmpty: {
		errorMessage: "firstname" + MESSAGE.IS_REQUIRED,
	},
	isString: {
		errorMessage: MESSAGE.IS_STRING,
	},
};

export const lastnameCheck = {
	notEmpty: {
		errorMessage: "firstname" + MESSAGE.IS_REQUIRED,
	},
	isString: {
		errorMessage: MESSAGE.IS_STRING,
	},
};

export const phoneCheck = {
	notEmpty: {
		errorMessage: MESSAGE.NOT_EMPTY,
	},
	isLength: {
		options: {
			min: 10,
			max: 11,
		},
	},
};

export const emailCheck = {
	notEmpty: {
		errorMessage: "Email " + MESSAGE.IS_REQUIRED,
	},
	isEmail: {
		errorMessage: "Email " + MESSAGE.IS_INVALID,
	},
	trim: true,
};
