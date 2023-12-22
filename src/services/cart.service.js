import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ErrorStatus } from "../models/Errors.js";
import db from "../models/database/index.js";

const Cart = db.cart;
const Product = db.product;
const sequelize = db.sequelize;

class CartService {
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} productId
	 * @returns
	 */
	async checkCartExist(userId, productId) {
		const condition = {};
		if (userId) {
			condition.user_id = userId;
		}
		if (productId) {
			condition.product_id = productId;
		}
		const cart = await Cart.findOne({
			where: condition,
		});
		return cart;
	}
	/**
	 *
	 * @param {Number} userId
	 * @param {Boolean} isIncludeProduct
	 * @returns all cart of userId
	 */
	async getAll(userId, isIncludeProduct = true) {
		const data = await Cart.findAll({
			include: isIncludeProduct ? { model: Product, as: "product" } : null,
			attributes: { exclude: isIncludeProduct ? ["product_id"] : null },
			where: {
				user_id: userId,
			},
		});
		return data;
	}
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} productId
	 * @param {Number} quantity
	 * @returns
	 */
	async addToCart(userId, productId, quantity) {
		const isExisted = await this.checkCartExist(userId, productId);
		let data = null;
		if (isExisted) {
			data = await Cart.update(
				{
					quantity: sequelize.literal(`quantity + ${quantity}`),
				},
				{
					where: {
						product_id: productId,
						user_id: userId,
					},
				},
			);
		} else {
			data = await Cart.create({
				product_id: productId,
				user_id: userId,
				quantity,
			});
		}
		return;
	}
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} productId
	 * @param {Number} quantity
	 * @returns
	 */
	async updateCart(userId, productId, quantity) {
		const isExisted = await this.checkCartExist(userId, productId);
		let data = null;
		if (isExisted) {
			data = await Cart.update(
				{ quantity },
				{
					where: {
						product_id: productId,
						user_id: userId,
					},
				},
			);
		} else {
			// check here or in validator both are good
			throw new ErrorStatus({
				message: "Cart is not found!",
				status: HTTP_STATUS.BAD_REQUEST,
			});
		}
		return;
	}
	/**
	 *
	 * @param {Number} userId
	 * @param {Number} productId
	 * @returns
	 */
	async deleteCart(userId, productId) {
		const isExisted = await this.checkCartExist(userId, productId);
		let data = null;
		if (isExisted) {
			data = await Cart.destroy({
				where: {
					product_id: productId,
					user_id: userId,
				},
			});
		} else {
			// check here or in validator both are good
			throw new ErrorStatus({
				message: "Cart is not found!",
				status: HTTP_STATUS.BAD_REQUEST,
			});
		}
		return;
	}
	/**
	 *
	 * @param {Number} userId
	 * @returns
	 */
	async deleteAllCart(userId) {
		const isExisted = await this.checkCartExist(userId);
		let data = null;
		if (isExisted) {
			data = await Cart.destroy({
				where: {
					user_id: userId,
				},
			});
		} else {
			// check here or in validator both are good
			throw new ErrorStatus({
				message: "User has no any cart!",
				status: HTTP_STATUS.BAD_REQUEST,
			});
		}
		return;
	}
}

const cartService = new CartService();

export default cartService;
