import { checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import { MESSAGE } from "../constants/messages.js";
import { ErrorStatus } from "../models/Errors.js";
import { categoryIDCheck } from "../middlewares/category.middleware.js";

export const productIdCheck = {
	notEmpty: {
		errorMessage: "productId" + MESSAGE.IS_REQUIRED,
	},
	isNumeric: {
		errorMessage: "productId" + MESSAGE.MUST_BE_NUMERIC,
	},
};

export const getAllValidator = validate(
	checkSchema(
		{
			rating: {
				isIn: {
					options: [[0, 1, 2, 3, 4, 5]],
					errorMessage: "rating" + " in 0, 1, 2, 3, 4, 5", // 0: all
				},
			},
		},
		["query"],
	),
);

export const topProductValidator = validate(
	checkSchema(
		{
			top: {
				notEmpty: {
					errorMessage: '"Top"' + MESSAGE.NOT_EMPTY,
				},
				isNumeric: {
					errorMessage: '"Top"' + MESSAGE.MUST_BE_NUMERIC,
				},
				custom: {
					options: (value, { req }) => {
						if (parseInt(value) < 0) {
							throw new ErrorStatus({
								message: '"Top"' + MESSAGE.MUST_BE_POSITIVE_NUMER,
							});
						}
						return true;
					},
				},
			},
		},
		["query"],
	),
);

export const relatedProductValidator = validate(
	checkSchema(
		{
			category_id: { ...categoryIDCheck },
			product_id: productIdCheck,
		},
		["query"],
	),
);

export const productIdValidator = validate(
	checkSchema(
		{
			productId: productIdCheck,
		},
		["body"],
	),
);

export const getProductByIdValidator = validate(
	checkSchema(
		{
			product_id: productIdCheck,
		},
		["params"],
	),
);

export const createProductCheckSchema = checkSchema(
	{
		name: {
			notEmpty: {
				errorMessage: "Name" + MESSAGE.NOT_EMPTY,
			},
		},
		price: {
			notEmpty: {
				errorMessage: "Price" + MESSAGE.IS_REQUIRED,
			},
			isNumeric: {
				errorMessage: "Price" + MESSAGE.MUST_BE_NUMERIC,
			},
		},
		specification: {
			notEmpty: {
				errorMessage: "Specification" + MESSAGE.IS_REQUIRED,
			},
			isString: {
				errorMessage: "Specification" + MESSAGE.IS_STRING,
			},
		},
		calculation_unit: {
			notEmpty: {
				errorMessage: "calculation_unit" + MESSAGE.NOT_EMPTY,
			},
		},
		discount: {
			isNumeric: {
				errorMessage: "discount" + MESSAGE.MUST_BE_NUMERIC,
			},
		},
		quantity: {
			isNumeric: {
				errorMessage: "quantity" + MESSAGE.MUST_BE_NUMERIC,
			},
		},
		category_id: {
			isNumeric: {
				errorMessage: "category_id" + MESSAGE.MUST_BE_NUMERIC,
			},
		},
		brand_id: {
			isNumeric: {
				errorMessage: "brand_id" + MESSAGE.MUST_BE_NUMERIC,
			},
		},
	},
	["body"],
);
