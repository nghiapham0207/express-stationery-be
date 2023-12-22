import { checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import { userIDCheck } from "../validation/users.validation.js";

export const getConversationValidator = validate(
	checkSchema(
		{
			receiver_id: {
				...userIDCheck,
			},
		},
		["params"],
	),
);
