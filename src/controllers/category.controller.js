import { validationResult } from "express-validator";
import multer from "multer";
import categoryService from "../services/category.service.js";
import { catchMulterErr, upload } from "../services/uploadFiles.service.js";
import { SuccessStatus } from "../models/Success.js";
import { ErrorStatus } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";
import { singleDelete, singleUpload } from "../services/firebase.service.js";
import { mapSchemaError } from "../utils/validation.js";
import { createCategorySchema } from "../middlewares/category.middleware.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAll = async (req, res, next) => {
	const data = await categoryService.getAll();
	return res.json({
		success: true,
		message: "get all category successfully!",
		data: data,
	});
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const createCategory = async (req, res, next) => {
	upload.memoryStorage.single("category_image")(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
			return catchMulterErr(err, next);
		} else if (err) {
			// An unknown error occurred when uploading.
			return next(
				new ErrorStatus({
					message: err,
				}),
			);
		}
		if (req.isImage) {
			await createCategorySchema.run(req);
			const validationError = validationResult(req);
			if (validationError.isEmpty()) {
				// asumed that no validationError
				const file = req.file;
				const imageURL = await singleUpload(file);
				const data = { ...req.body };
				data.image = imageURL;
				await categoryService.createCategory(data);
				delete req.file;
				return res.status(200).json(
					new SuccessStatus({
						message: "create category successfully!",
					}),
				);
			} else {
				delete req.file;
				const schemaError = mapSchemaError(validationError, next);
				next(schemaError);
			}
		} else {
			next(
				new ErrorStatus({
					message: "category_image" + MESSAGE.IS_INVALID,
				}),
			);
		}
	});
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const updateCategory = async (req, res, next) => {
	// standard
	upload.memoryStorage.single("category_image")(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
			return catchMulterErr(err, next);
		} else if (err) {
			// An unknown error occurred when uploading.
			return next(
				new ErrorStatus({
					message: err,
				}),
			);
		}
		try {
			await createCategorySchema.run(req);
			const validationError = validationResult(req);
			if (validationError.isEmpty()) {
				const { category_id } = req.params;
				const category = req.category;
				const image = req.file || null;
				let imageURL = null;
				if (image !== null) {
					if (category.dataValues.image) {
						try {
							await singleDelete(category.dataValues.image);
						} catch (error) {
							console.log("singleDelete updateCategory ", error);
						}
					}
					imageURL = await singleUpload(image);
				}
				const { name, note } = req.body;
				const data = {};
				data.name = name;
				data.note = note;
				if (typeof imageURL === "string" && imageURL !== "") {
					data.image = imageURL;
				}
				delete req.file;
				await categoryService.updateCategory(data, category_id);
				return res.status(200).json(
					new SuccessStatus({
						message: "update category successfully!",
					}),
				);
			} else {
				delete req.file;
				const schemaError = mapSchemaError(validationError, next);
				next(schemaError);
			}
		} catch (error) {
			console.log(error);
			return next(error);
		}
	});
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const deleteCategory = async (req, res, next) => {
	const { category_id } = req.params;
	const rows = await categoryService.deleteCategory(parseInt(category_id));
	if (rows !== 0) {
		const category = req.category;
		await singleDelete(category.image);
	}
	return res.status(200).json(new SuccessStatus({ message: "deleted category successfully!" }));
};
