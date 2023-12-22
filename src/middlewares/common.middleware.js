import { checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import { MESSAGE } from "../constants/messages.js";

export const paginationValidator = validate(
	checkSchema(
		{
			page: {
				notEmpty: {
					errorMessage: "Page" + MESSAGE.IS_REQUIRED,
				},
				isNumeric: {
					errorMessage: "page" + MESSAGE.MUST_BE_NUMERIC,
				},
			},
			size: {
				notEmpty: {
					errorMessage: "Size" + MESSAGE.IS_REQUIRED,
				},
				isNumeric: {
					errorMessage: "page" + MESSAGE.MUST_BE_NUMERIC,
				},
			},
		},
		["query"],
	),
);

// check param
// export
