import { MESSAGE } from "../constants/messages.js";
import { ErrorStatus } from "../models/Errors.js";

export const addressIDCheck = {
	custom: {
		options: (value) => {
			if (value && isNaN(value)) {
				throw new ErrorStatus({
					message: "address_id" + MESSAGE.MUST_BE_NUMERIC,
				});
			}
			return true;
		},
	},
};

export const specificAddressCheck = {
	isString: true,
};

export const wardIDCheck = {
	notEmpty: {
		errorMessage: "ward_id" + MESSAGE.NOT_EMPTY,
	},
	isNumeric: {
		errorMessage: "ward_id" + MESSAGE.MUST_BE_NUMERIC,
	},
};
