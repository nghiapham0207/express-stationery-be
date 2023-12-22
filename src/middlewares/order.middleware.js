import { checkSchema } from "express-validator";
import { validate } from "../utils/validation.js";
import { MESSAGE } from "../constants/messages.js";
import { RevenueMode } from "../constants/enums.js";
import { ErrorStatus } from "../models/Errors.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

// const cartCheck = ["product_id", "quantity"];
const statusIdCheck = {
	notEmpty: {
		errorMessage: "status_id" + MESSAGE.IS_REQUIRED,
	},
	isNumeric: {
		errorMessage: "status_id" + MESSAGE.MUST_BE_NUMERIC,
	},
	isIn: {
		options: [[0, 1, 2, 3, 4, 5]],
		errorMessage: "status_id" + "in 0, 1, 2, 3, 4, 5", // 0: all
	},
};

/**
 * should check delivery address
 */
export const insertOrderValidator = validate(
	checkSchema(
		{
			total_price: {
				isNumeric: {
					errorMessage: "total_price" + MESSAGE.MUST_BE_NUMERIC,
				},
				custom: {
					options: (value) => {
						if (parseInt(value) < 0) {
							throw new ErrorStatus({
								message: "total_price" + MESSAGE.IS_INVALID,
								status: HTTP_STATUS.BAD_REQUEST,
							});
						}
						return true;
					},
				},
			},
		},
		["body"],
	),
);

export const changeOrderStatusValidator = validate(
	checkSchema(
		{
			status: {
				notEmpty: {
					errorMessage: "status" + MESSAGE.NOT_EMPTY,
				},
				isNumeric: {
					errorMessage: "status" + MESSAGE.MUST_BE_NUMERIC,
				},
			},
		},
		["body"],
	),
);

export const getAllByStatusValidator = validate(
	checkSchema(
		{
			status_id: statusIdCheck,
		},
		["query"],
	),
);

export const adminGetAllByStatusValidator = validate(
	checkSchema(
		{
			status_id: statusIdCheck,
		},
		["query"],
	),
);

export const getRevenueValidator = validate(
	checkSchema(
		{
			revenue_mode: {
				isIn: {
					options: [[1, 2, 3]],
					errorMessage: "revenue_mode" + " in 1, 2, 3",
				},
				custom: {
					options: (value, { req }) => {
						const { fromDate, toDate } = req.query;
						if (parseInt(value) === RevenueMode.SELECT_DATE) {
							if (!fromDate || !toDate) {
								throw new ErrorStatus({
									message: "fromDate, toDate" + MESSAGE.IS_REQUIRED,
									status: HTTP_STATUS.BAD_REQUEST,
								});
							}
						}
						return true;
					},
				},
			},
		},
		["query"],
	),
);
