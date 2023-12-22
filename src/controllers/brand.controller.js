import brandService from "../services/brand.service.js";
import { SuccessStatus } from "../models/Success.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAll = async (req, res, next) => {
	const data = await brandService.getAll();
	return res.json(
		new SuccessStatus({
			message: "get all brand successfully!",
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
export const createBrand = async (req, res, next) => {
	const dataBody = req.body;
	await brandService.createBrand(dataBody);
	return res.json(
		new SuccessStatus({
			message: "created brand successfully!",
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
export const updateBrand = async (req, res, next) => {
	const { brand_id } = req.params;
	const dataBody = req.body;
	const rows = await brandService.updateBrand(parseInt(brand_id), dataBody);
	if (rows > 0) {
		return res.json(
			new SuccessStatus({
				message: "updated brand successfully!",
			}),
		);
	} else {
		next(new Error("Can not update!"));
	}
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const deleteBrand = async (req, res, next) => {
	const { brand_id } = req.params;
	const rows = await brandService.deleteBrand(parseInt(brand_id));
	if (rows > 0) {
		return res.json(
			new SuccessStatus({
				message: "deleted brand successfully!",
			}),
		);
	} else {
		next(new Error("Can not delete!"));
	}
};
