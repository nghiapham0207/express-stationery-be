import db from "../models/database/index.js";
import productService from "./product.service.js";
import cartService from "./cart.service.js";
import { OrderStatus, RevenueMode } from "../constants/enums.js";
import { Op } from "sequelize";

const Order = db.order;
const OrderDetail = db.order_detail;
const sequelize = db.sequelize;

class OrderService {
	/**
	 * get all order
	 * @param {Number} total_price
	 * @param {Number} user_id
	 * @param {Object[]} carts
	 * @returns model
	 */
	async insertOrder(total_price, user_id, carts) {
		const insertedOrder = await Order.create({
			date: new Date(),
			total_price,
			status_id: OrderStatus.Pending,
			user_id,
		});
		const order_id = insertedOrder.dataValues.order_id;
		// -------------------------------------------------------------------------
		carts.forEach(async (cart) => {
			const product = await productService.getProductById(cart.product_id);
			const price = product.dataValues.price;
			const discount = product.dataValues.discount;
			const itemPrice = price - (price * discount) / 100;
			await this.insertOrderDetail(order_id, cart.product_id, cart.quantity, itemPrice);
			await cartService.deleteCart(user_id, cart.product_id);
		});
		return;
	}
	/**
	 *
	 * @param {Number} order_id
	 * @param {Number} product_id
	 * @param {Number} quantity
	 * @param {Number} item_price
	 * @returns
	 */
	async insertOrderDetail(order_id, product_id, quantity, item_price) {
		const insertedOrderDetail = await OrderDetail.create({
			order_id,
			product_id,
			quantity,
			item_price,
		});
		return insertedOrderDetail;
	}
	/**
	 *
	 * @param {Number} order_id
	 * @param {Number} user_id
	 * @returns
	 */
	async findOrderOfUserById(order_id, user_id) {
		const data = await Order.findOne({
			where: {
				order_id,
				user_id,
			},
		});
		// null if not found
		return data;
	}
	/**
	 *
	 * @param {Number} order_id
	 * @param {Number} status
	 * @param {Number} user_id
	 * @param {Boolean} isAdmin
	 * @returns
	 */
	async changeOrderStatus(order_id, status, user_id, isAdmin) {
		const condition = {
			order_id,
		};
		if (!isAdmin) {
			condition.user_id = user_id;
		}
		// data is number of rows
		const data = await Order.update(
			{
				status_id: status,
			},
			{
				where: condition,
			},
		);
		return data;
	}
	/**
	 * admin get
	 * @param {Number} status_id
	 * @param {Number} offset
	 * @param {Number} limit
	 * @returns
	 */
	async adminGetAllByStatus(status_id, offset, limit) {
		const amount = await Order.count({
			where: {
				[Op.and]: [status_id !== 0 ? { status_id } : null],
			},
		});
		// const data = await Order.findAndCountAll({
		const data = await Order.findAll({
			include: [
				{
					model: db.users,
					as: "user",
					attributes: {
						exclude: ["password", "forgot_password_token", "refresh_token"],
					},
					include: {
						model: db.address,
						as: "address",
						include: {
							model: db.ward,
							as: "ward",
							include: {
								model: db.district,
								as: "district",
								include: { model: db.province, as: "province" },
							},
						},
					},
				},
				{
					model: OrderDetail,
					as: "order_details",
					include: {
						model: db.product,
						as: "product",
						// attributes: ["product_id"],
					},
				},
			],
			where: {
				[Op.and]: [status_id !== 0 ? { status_id } : null],
			},
			offset,
			limit,
		});
		return { count: amount, rows: data };
	}
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.user_id
	 * @param {Number} param0.status_id
	 * @param {Number} param0.offset
	 * @param {Number} param0.limit
	 * @returns
	 */
	async getAllOrder({ user_id, status_id, offset, limit }) {
		const amount = await Order.count({
			where: {
				user_id,
				[Op.and]: [status_id !== 0 ? { status_id } : null],
			},
		});
		// const data = await Order.findAndCountAll({
		const data = await Order.findAll({
			include: {
				model: OrderDetail,
				as: "order_details",
				include: {
					model: db.product,
					as: "product",
					// attributes: ["product_id"],
				},
			},
			where: {
				user_id,
				[Op.and]: [status_id !== 0 ? { status_id } : null],
			},
			offset,
			limit,
		});
		// return data;
		return { count: amount, rows: data };
	}
	/**
	 *
	 * @param {Number} order_id
	 * @returns
	 */
	async getOrderDetailByOrderId(order_id) {
		const data = await OrderDetail.findAll({
			where: { order_id },
		});
		return data;
	}
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.order_id
	 */
	async updateSoldQuantityByOrderId({ order_id }) {
		const listOrderDetail = await this.getOrderDetailByOrderId(order_id);
		for (const orderDetail of listOrderDetail) {
			const { product_id, quantity } = orderDetail.dataValues;
			await productService.updateSoldQuantity({ product_id, sold_quantity: quantity });
		}
	}
	/**
	 * @param {Object} param0
	 * @param {Number} param0.revenue_mode
	 * @param {String} param0.fromDate
	 * @param {String} param0.toDate
	 * @param {Number} param0.offset
	 * @param {Number} param0.limit
	 * @returns
	 */
	async getRevenue({ revenue_mode, fromDate, toDate, offset = 0, limit = 10 }) {
		let condition = { status_id: 4 };
		switch (revenue_mode) {
			case RevenueMode.THIS_DATE:
				condition.date = {
					[Op.eq]: new Date().toISOString(),
				};
				break;
			case RevenueMode.THIS_MONTH:
				condition = {
					[Op.and]: [
						{
							status_id: 4,
						},
						sequelize.where(
							sequelize.fn(
								"datediff",
								sequelize.literal("Month"),
								sequelize.col("date"),
								new Date().toISOString(),
							),
							{
								[Op.eq]: 0,
							},
						),
					],
				};
				break;
			case RevenueMode.SELECT_DATE:
				condition = {
					status_id: 4,
					[Op.and]: [
						{
							date: {
								[Op.gte]: fromDate,
							},
						},
						{
							date: {
								[Op.lte]: toDate,
							},
						},
					],
				};
				break;
			default:
				throw new Error("revenue_mode not found!");
		}
		const revenue = await Order.sum("total_price", { where: condition });
		const amount = await Order.count({ where: condition });
		const data = await Order.findAll({
			include: {
				model: OrderDetail,
				as: "order_details",
				include: {
					model: db.product,
					as: "product",
				},
			},
			where: condition,
			offset,
			limit,
		});
		return { count: amount, rows: data, revenue: revenue ? revenue : 0 };
	}
}

const orderService = new OrderService();

export default orderService;
