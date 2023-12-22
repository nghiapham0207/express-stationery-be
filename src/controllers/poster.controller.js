import posterService from "../services/poster.service.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAll = async (req, res, next) => {
	const data = await posterService.getAll();
	return res.json({
		success: true,
		message: "get all brand successfully!",
		data: data,
	});
};
