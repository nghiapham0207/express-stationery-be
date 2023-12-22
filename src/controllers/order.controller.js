import orderService from "../services/order.service.js";
import { SuccessStatus } from "../models/Success.js";
import { ErrorStatus } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";
import { OrderStatus, Permission } from "../constants/enums.js";
import { getPagination, getPagingData } from "../utils/helpers.js";
import cartService from "../services/cart.service.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
export const insertOrder = async (req, res, next) => {
	const { userId } = req.decoded;
	const { total_price } = req.body;
	const carts = await cartService.getAll(userId, false);
	if (!carts || (Array.isArray(carts) && carts.length <= 0)) {
		return next(
			new ErrorStatus({
				message: "you have no carts!",
			}),
		);
	}
	const data = await orderService.insertOrder(total_price, userId, carts);
	return res.json(
		new SuccessStatus({
			message: "insert order successfully!",
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
export const changeOrderStatus = async (req, res, next) => {
	const { userId, permission } = req.decoded;
	const { status } = req.body;
	const { order_id } = req.params;
	// customer can only change status to 4 (delivered order) or from 1 to 5
	if (permission === Permission.Customer && !(parseInt(status) === 4 || parseInt(status) === 5)) {
		return next(
			new ErrorStatus({
				message: "bad status or you are not allowed!",
			}),
		);
	}
	if (permission === Permission.Customer) {
		const isExist = await orderService.findOrderOfUserById(order_id, userId);
		if (!isExist) {
			return next(
				new ErrorStatus({
					message: "order_id " + order_id + " of " + "userId " + userId + MESSAGE.NOT_FOUND,
				}),
			);
		}
	}
	const isAdmin = permission === Permission.Admin;
	await orderService.changeOrderStatus(
		parseInt(order_id),
		parseInt(status),
		parseInt(userId),
		isAdmin,
	);
	if (parseInt(status) === OrderStatus.Delivering) {
		await orderService.updateSoldQuantityByOrderId({ order_id: parseInt(order_id) });
	}
	return res.json(
		new SuccessStatus({
			message: "update order status successfully!",
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
export const getAllOrder = async (req, res, next) => {
	const { userId } = req.decoded;
	const { page, size, status_id } = req.query;
	const { offset, limit } = getPagination(page, size);
	const result = await orderService.getAllOrder({
		user_id: userId,
		status_id: parseInt(status_id),
		offset,
		limit,
	});
	const data = getPagingData(result, page, size);
	return res.json(
		new SuccessStatus({
			message: "get all order successfully!",
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
export const adminGetAllByStatus = async (req, res, next) => {
	const { page, size, status_id } = req.query;
	const { offset, limit } = getPagination(page, size);
	const result = await orderService.adminGetAllByStatus(parseInt(status_id), offset, limit);
	const data = getPagingData(result, page, size);
	return res.status(200).json(
		new SuccessStatus({
			message: "get orders successfully!",
			data,
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
export const getRevenue = async (req, res, next) => {
	const { page, size, fromDate, toDate, revenue_mode } = req.query;
	const { offset, limit } = getPagination(page, size);
	const result = await orderService.getRevenue({
		revenue_mode: parseInt(revenue_mode),
		fromDate,
		toDate,
		offset,
		limit,
	});
	console.log(result);
	const data = getPagingData(result, page, size);
	return res.json(
		new SuccessStatus({
			message: "get revenue successfully!",
			data: { ...data, revenue: result.revenue },
		}),
	);
};
