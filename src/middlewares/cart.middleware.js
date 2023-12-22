import { checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import { MESSAGE } from "../constants/messages.js";
import { productIdCheck } from "./product.middleware.js";
import { ErrorStatus } from "../models/Errors.js";

export const updateCartValidator = validate(
	checkSchema(
		{
			productId: {
				...productIdCheck,
			},
			quantity: {
				notEmpty: {
					errorMessage: "quantity" + MESSAGE.IS_REQUIRED,
				},
				isNumeric: {
					errorMessage: "quantity" + MESSAGE.MUST_BE_NUMERIC,
				},
				custom: {
					options: (value, {}) => {
						if (parseInt(value) < 0) {
							throw new ErrorStatus({ message: "quantity" + MESSAGE.IS_INVALID });
						}
						return true;
					},
				},
			},
		},
		["body"],
	),
);
