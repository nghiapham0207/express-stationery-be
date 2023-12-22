import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ErrorStatus } from "../models/Errors.js";

/**
 *
 * @param {Error | ErrorStatus | any} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const errorHandler = (err, req, res, next) => {
	if (err instanceof ErrorStatus) {
		const message = { ...err };
		delete message.status;
		res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(message);
	} else {
		if (err instanceof Object) {
			// enumerable: true help parse to json
			Object.getOwnPropertyNames(err).forEach((key) => {
				Object.defineProperty(err, key, { enumerable: true });
			});
			delete err.stack;
		}
		res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: err.message,
			error: err,
		});
	}
};
