import { Result, validationResult } from "express-validator";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { SchemaError } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
/**
 *
 * @param {import("express-validator").ValidationChain} validations
 * @returns
 */
export const validate = (validations) => {
	/**
	 *
	 * @param {import("express").Request} req
	 * @param {import("express").Response} res
	 * @param {import("express").NextFunction} next
	 * @returns
	 */
	return async (req, res, next) => {
		await validations.run(req);
		const errors = validationResult(req);
		if (errors.isEmpty()) {
			return next();
		} else {
			const schemaError = mapSchemaError(errors, next);
			next(schemaError);
		}
	};
};

/**
 *
 * @param {Result} errors
 * @param {import("express").NextFunction} next
 * @returns
 */
export const mapSchemaError = (errors, next) => {
	if (next === undefined) {
		throw new Error("next is not a function!");
	}
	const errorsMapped = errors.mapped();

	const schemaError = new SchemaError({
		success: false,
		message: MESSAGE.VALIDATION_ERROR,
		status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
		error: {},
	});

	for (const key in errorsMapped) {
		if (Object.hasOwnProperty.call(errorsMapped, key)) {
			const { msg } = errorsMapped[key];
			if (typeof msg === "object" && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
				return next(msg);
			}
			errorsMapped[key].msg = msg?.message || msg;
			schemaError.error[key] = errorsMapped[key];
		}
	}
	return schemaError;
};
