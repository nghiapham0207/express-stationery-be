import { checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import { MESSAGE } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ErrorStatus } from "../models/Errors.js";
import brandService from "../services/brand.service.js";
import { checkBrandUsage } from "../services/common.service.js";
// standard
const brandIDCheck = {
	notEmpty: {
		errorMessage: MESSAGE.NOT_EMPTY,
	},
	isInt: {
		errorMessage: MESSAGE.MUST_BE_NUMERIC,
	},
};

export const createBrandValidator = validate(
	checkSchema(
		{
			name: {
				notEmpty: { errorMessage: MESSAGE.NOT_EMPTY },
				isString: { errorMessage: MESSAGE.IS_STRING },
			},
			description: {
				isString: { errorMessage: MESSAGE.IS_STRING },
			},
		},
		["body"],
	),
);

export const brandParamValidator = validate(
	checkSchema(
		{
			brand_id: {
				...brandIDCheck,
				custom: {
					options: async (value, { req }) => {
						const brand = await brandService.getById(parseInt(value));
						if (!brand) {
							throw new ErrorStatus({
								message: "brand_id" + MESSAGE.NOT_FOUND,
								status: HTTP_STATUS.FORBIDDEN,
							});
						}
						return true;
					},
				},
			},
		},
		["params"],
	),
);

export const deleteBrandValidator = validate(
	checkSchema(
		{
			brand_id: {
				...brandIDCheck,
				custom: {
					options: async (value, { req }) => {
						const isUsed = await checkBrandUsage(value);
						if (isUsed) {
							// throw ErrorStatus to catch message
							throw new ErrorStatus({
								message: "brand_id" + MESSAGE.IS_USED,
								status: HTTP_STATUS.FORBIDDEN,
							});
						} else {
							return true;
						}
					},
				},
			},
		},
		["params"],
	),
);
