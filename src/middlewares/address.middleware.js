import { checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import { firstnameCheck, lastnameCheck, phoneCheck } from "../validation/users.validation.js";
import { wardIDCheck } from "../validation/address.validation.js";
import { ErrorStatus } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";
import userService from "../services/user.service.js";

/**
 * the field name should be the same as column name in database
 */
export const updateDeliveryAddressValidator = validate(
	checkSchema(
		{
			first_name: {
				...firstnameCheck,
			},
			last_name: {
				...lastnameCheck,
			},
			phone: {
				...phoneCheck,
				custom: {
					options: async (value, { req }) => {
						const userInfo = req.decoded;
						const isExistPhone = await userService.checkPhoneExist(value, userInfo.userId);
						if (isExistPhone) {
							throw new ErrorStatus({ message: "phone" + MESSAGE.ALREADY_EXIST });
						}
						return true;
					},
				},
			},
			ward_id: {
				...wardIDCheck,
			},
		},
		["body"],
	),
);
