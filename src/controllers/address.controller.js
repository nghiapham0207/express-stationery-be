import addressService from "../services/address.service.js";
import { SuccessStatus } from "../models/Success.js";
import { ErrorStatus } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";
import userService from "../services/user.service.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAll = async (req, res, next) => {
	const data = await addressService.getAll();
	return res.json(
		new SuccessStatus({
			message: "get all address successfully!",
			data: data,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAllWardByDistrictID = async (req, res, next) => {
	const { district_id } = req.query;
	if (!district_id) {
		return next(
			new ErrorStatus({
				message: "district_id" + MESSAGE.IS_REQUIRED,
			}),
		);
	}
	const data = await addressService.getAllWardByDistrictID(parseInt(district_id));
	return res.json(
		new SuccessStatus({
			message: "get all ward by district successfully!",
			data: data,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAllDistrictByProvinceID = async (req, res, next) => {
	const { province_id } = req.query;
	if (!province_id) {
		return next(
			new ErrorStatus({
				message: "province_id" + MESSAGE.IS_REQUIRED,
			}),
		);
	}
	const data = await addressService.getAllDistrictByProvinceID(parseInt(province_id));
	return res.json(
		new SuccessStatus({
			message: "get all district by province successfully!",
			data: data,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAllProvince = async (req, res, next) => {
	const data = await addressService.getAllProvince();
	return res.json(
		new SuccessStatus({
			message: "get all province successfully!",
			data: data,
		}),
	);
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const updateDeliveryAddress = async (req, res, next) => {
	const { userId } = req.decoded;
	const { first_name, last_name, phone, email } = req.body;
	const addressID = await addressService.updateDeliveryAddress(req.body);
	await userService.updateUser({
		user_id: parseInt(userId),
		first_name,
		last_name,
		address_id: parseInt(addressID),
		email,
		phone,
	});
	return res.json(
		new SuccessStatus({
			message: "update address info successfully!",
		}),
	);
};
