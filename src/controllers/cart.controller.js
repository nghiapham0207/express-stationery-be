import cartService from "../services/cart.service.js";
import { SuccessStatus } from "../models/Success.js";
import { ErrorStatus } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const getAll = async (req, res, next) => {
	const { userId } = req.decoded;
	const data = await cartService.getAll(parseInt(userId));
	return res.json(
		new SuccessStatus({
			message: "get all cart successfully!",
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
export const addToCart = async (req, res, next) => {
	const { userId } = req.decoded;
	let { productId, quantity } = req.body;
	if (!quantity) {
		quantity = "1";
	}
	// check quantity cart
	if (isNaN(quantity) || parseInt(quantity) < 0) {
		return next(
			new ErrorStatus({
				message: "quantity" + MESSAGE.IS_INVALID,
			}),
		);
	}
	const data = await cartService.addToCart(
		parseInt(userId),
		parseInt(productId),
		parseInt(quantity),
	);
	return res.json(
		new SuccessStatus({
			message: "add to cart successfully!",
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
export const updateCart = async (req, res, next) => {
	const { userId } = req.decoded;
	const { productId, quantity } = req.body;
	const data = await cartService.updateCart(
		parseInt(userId),
		parseInt(productId),
		parseInt(quantity),
	);
	return res.json(
		new SuccessStatus({
			message: "update cart successfully!",
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
export const deleteCart = async (req, res, next) => {
	const { userId } = req.decoded;
	const { product_id } = req.params;
	const data = await cartService.deleteCart(parseInt(userId), parseInt(product_id));
	return res.json(
		new SuccessStatus({
			message: "delete cart successfully!",
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
export const deleteAllCart = async (req, res, next) => {
	const { userId } = req.decoded;
	const data = await cartService.deleteAllCart(parseInt(userId));
	return res.json(
		new SuccessStatus({
			message: "delete all cart successfully!",
			data,
		}),
	);
};
