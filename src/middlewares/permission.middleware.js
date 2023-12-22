import { envConfig } from "../config/config.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGE } from "../constants/messages.js";
import { ErrorStatus } from "../models/Errors.js";
import { verifyToken } from "../utils/jwt.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const verifyAdmin = (req, res, next) => {
	const isAdmin = req.decoded.permission === 2;
	if (isAdmin) {
		next();
	} else {
		res.status(HTTP_STATUS.FORBIDDEN).json({
			message: "You are not allowed!",
		});
	}
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const verifyCustomer = (req, res, next) => {
	const isCustomer = req.decoded.permission === 1;
	if (isCustomer) {
		next();
	} else {
		res.status(HTTP_STATUS.FORBIDDEN).json({
			message: "You are not allowed!",
		});
	}
};

/**
 *
 * @param {String} accessToken
 * @param {import("express").Request} req
 */
export const verifyAccessToken = async (accessToken, req) => {
	if (!accessToken) {
		throw new ErrorStatus({
			status: HTTP_STATUS.UNAUTHORIZED,
			message: "accessToken " + MESSAGE.IS_REQUIRED,
			success: false,
		});
	}
	try {
		const decoded = await verifyToken({
			token: accessToken,
			secretOrPublicKey: envConfig.jwtSecretAccessToken,
		});
		if (req) {
			req.decoded = decoded;
			return true;
		}
		return decoded;
	} catch (error) {
		throw new ErrorStatus({
			message: error.message || MESSAGE.IS_INVALID,
			status: HTTP_STATUS.UNAUTHORIZED,
		});
	}
};
