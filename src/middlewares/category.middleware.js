import { checkSchema, validationResult } from "express-validator";
import { MESSAGE } from "../constants/messages.js";
import { validate } from "../utils/validation.js";
import categoryService from "../services/category.service.js";
import { checkCategoryUsage } from "../services/common.service.js";
import { ErrorStatus } from "../models/Errors.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const categoryIDCheck = {
	notEmpty: {
		errorMessage: MESSAGE.NOT_EMPTY,
	},
	isNumeric: {
		errorMessage: "category_id" + MESSAGE.MUST_BE_NUMERIC,
	},
};

export const createCategorySchema = checkSchema(
	{
		name: {
			notEmpty: true,
			isString: true,
		},
		note: {
			isString: true,
		},
	},
	["body"],
);

/**
 *
 * @param {import("express").Request} req
 * @returns
 */
export const createCategoryValidator = async (req) => {
	await createCategorySchema.run(req);
	const validationError = validationResult(req);
	return validationError.isEmpty();
};

export const categoryParamValidator = validate(
	checkSchema(
		{
			category_id: {
				...categoryIDCheck,
				custom: {
					options: async (value, { req }) => {
						const category = await categoryService.getCategoryByID({ category_id: value });
						if (!category) {
							throw new ErrorStatus({
								message: "category_id" + MESSAGE.NOT_FOUND,
								status: HTTP_STATUS.FORBIDDEN,
							});
						}
						req.category = category;
						return true;
					},
				},
			},
		},
		["params"],
	),
);

export const deleteCategoryValidator = validate(
	checkSchema(
		{
			category_id: {
				...categoryIDCheck,
				custom: {
					options: async (value, { req }) => {
						const isUsed = await checkCategoryUsage(value);
						if (isUsed) {
							// throw ErrorStatus to catch message
							throw new ErrorStatus({
								message: "category_id" + MESSAGE.IS_USED,
								status: HTTP_STATUS.FORBIDDEN,
							});
						} else {
							req.category = category;
							return true;
						}
					},
				},
			},
		},
		["params"],
	),
);
