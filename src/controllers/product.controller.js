import { validationResult } from "express-validator";
import multer from "multer";
import productService from "../services/product.service.js";
import { checkKeys, getPagination, getPagingData } from "../utils/helpers.js";
import { SuccessStatus } from "../models/Success.js";
import { ErrorStatus } from "../models/Errors.js";
import { catchMulterErr, upload } from "../services/uploadFiles.service.js";
import { createProductCheckSchema } from "../middlewares/product.middleware.js";
import { mapSchemaError } from "../utils/validation.js";
import { MESSAGE } from "../constants/messages.js";
import { firebaseDelete, firebaseUpload } from "../services/firebase.service.js";
import { MAX_PRODUCT_IMAGES } from "../constants/enums.js";

/**
 * if admin, use prefix admin, get all product include status = false
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const adminGetAll = async (req, res, next) => {
	const { page, size } = req.query;
	const { offset, limit } = getPagination(page, size);
	const result = await productService.adminGetAll(offset, limit);
	const data = getPagingData(result, page, size);
	return res.json({
		success: true,
		message: "get all product successfully!",
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
export const getAll = async (req, res, next) => {
	const condition = req.query;
	const { page, size } = req.query;
	const { offset, limit } = getPagination(page, size);
	const result = await productService.getAll(offset, limit, condition);
	const data = getPagingData(result, page, size);
	return res.json({
		success: true,
		message: "get all product successfully!",
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
export const getLatestProducts = async (req, res, next) => {
	const { top } = req.query;
	const data = await productService.getLatestProducts(parseInt(top));
	return res.json({
		success: true,
		message: "get all latest product successfully!",
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
export const getSaleOff = async (req, res, next) => {
	const { top } = req.query;
	const data = await productService.getSaleOff(parseInt(top));
	return res.json({
		success: true,
		message: "get all sale off product successfully!",
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
export const getTopRated = async (req, res, next) => {
	const { top } = req.query;
	const data = await productService.getTopRated(parseInt(top));
	return res.json({
		success: true,
		message: "get all top rated product successfully!",
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
export const getRelated = async (req, res, next) => {
	const { top, category_id, product_id } = req.query;
	const data = await productService.getRelated({
		top: parseInt(top),
		category_id: parseInt(category_id),
		product_id: parseInt(product_id),
	});
	return res.json({
		success: true,
		message: "get all related product successfully!",
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
export const getProductById = async (req, res, next) => {
	const { product_id } = req.params;
	// no need
	if (!product_id) {
		throw new ErrorStatus("product_id is required!");
	}
	const data = await productService.getProductById(parseInt(product_id), true);
	if (data === null) {
		return res.status(200).json(
			new ErrorStatus({
				success: false,
				message: "product not found!",
			}),
		);
	}
	return res.status(200).json(new SuccessStatus({ message: "get product successfully!", data }));
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const createProduct = async (req, res, next) => {
	upload.memoryStorage.array("product_images", MAX_PRODUCT_IMAGES)(req, res, async (err) => {
		if (req.isImage) {
			await createProductCheckSchema.run(req);
			const errors = validationResult(req);
			if (errors.isEmpty()) {
				try {
					const imagesURL = await firebaseUpload(req, res, next);
					await productService.createProduct(req.body, imagesURL);
				} catch (error) {
					return next(error);
				} finally {
					delete req.files;
				}
				if (err instanceof multer.MulterError) {
					console.log("multer.MulterError", err);
					return next(err);
				} else if (err) {
					console.log("other", err);
					return next(err);
				}
				return res.status(200).json(
					new SuccessStatus({
						message: "create product successfully!",
					}),
				);
			} else {
				delete req.files;
				const schemaError = mapSchemaError(errors, next);
				next(schemaError);
			}
		} else {
			next(
				new ErrorStatus({
					message: "images" + MESSAGE.IS_INVALID,
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
export const updateProduct = async (req, res, next) => {
	upload.updateStorage.array("product_images", MAX_PRODUCT_IMAGES)(req, res, async (err) => {
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
			await createProductCheckSchema.run(req);
			const errors = validationResult(req);
			if (errors.isEmpty()) {
				const body = req.body;
				const { product_id } = req.params;
				const product = await productService.getProductById(product_id, true);
				if (!product) {
					throw new ErrorStatus({
						message: "product_id" + MESSAGE.NOT_FOUND,
					});
				}
				let images = req.files.length > 0 ? req.files : [];
				let newImageURLs = [];
				if (images.length > 0) {
					// del older images
					const downloadURLs = [];
					const prevImages = product.images;
					for (let index = 0; index < prevImages.length; index++) {
						const image = prevImages[index];
						downloadURLs.push(image.dataValues.image);
					}
					await firebaseDelete(downloadURLs);
					// upload new images
					newImageURLs = await firebaseUpload(req, res);
				}
				const newData = {
					...body,
					price: parseInt(body.price),
					discount: parseInt(body.discount),
					quantity: parseInt(body.quantity),
					category_id: parseInt(body.category_id),
					brand_id: parseInt(body.brand_id),
					status: Boolean(body.status),
				};
				// remove file field
				delete newData.product_images;
				await productService.updateProduct(product_id, newData, newImageURLs);
				// result
				return res.status(200).json(
					new SuccessStatus({
						message: "updated product successfully!",
					}),
				);
			} else {
				delete req.files;
				const schemaError = mapSchemaError(errors, next);
				next(schemaError);
			}
		} catch (error) {
			next(error);
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
export const deleteProduct = async (req, res, next) => {
	const { product_id } = req.params;
	if (!product_id) {
		throw new ErrorStatus("product_id is required!");
	}
	await productService.deleteProduct(parseInt(product_id));
	return res.status(200).json(new SuccessStatus({ message: "delete product successfully!" }));
};
