import { Op } from "sequelize";
import db from "../models/database/index.js";
import imageService from "./image.service.js";
import { ErrorStatus } from "../models/Errors.js";
import { MESSAGE } from "../constants/messages.js";
import { checkProductUsage } from "./common.service.js";
import { singleDelete } from "./firebase.service.js";

const Product = db.product;
const sequelize = db.sequelize;

class ProductService {
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.product_id
	 * @param {Number} param0.sold_quantity
	 */
	async updateSoldQuantity({ product_id, sold_quantity }) {
		const data = await Product.update(
			{
				sold_quantity: sequelize.literal("sold_quantity +" + sold_quantity),
			},
			{
				where: {
					product_id,
				},
			},
		);
		return data;
	}
	/**
	 * get product by id
	 * @param {Number} productId
	 * @param {Boolean} isIncludeImage
	 * @returns
	 */
	async getProductById(productId, isIncludeImage = false) {
		const data = await Product.findOne({
			// attributes: ["name"],
			include: isIncludeImage ? { model: db.image, as: "images" } : null,
			where: { product_id: productId },
		});
		return data;
	}
	/**
	 *
	 * @param {Number} top
	 * @returns top sale off product
	 */
	async getSaleOff(top) {
		const data = await Product.findAll({
			include: { model: db.category, as: "category" },
			where: {
				status: {
					[Op.eq]: true,
				},
				discount: {
					[Op.ne]: 0,
				},
			},
			order: [["discount", "desc"]],
			limit: top,
		});
		return data;
	}
	/**
	 *
	 * @param {Number} top
	 * @returns db.category
	 */
	async getTopRated(top) {
		const data = await Product.findAll({
			include: { model: db.category, as: "category" },
			where: {
				status: {
					[Op.eq]: true,
				},
				rating: {
					[Op.ne]: 0,
				},
			},
			order: [["rating", "desc"]],
			limit: top,
		});
		return data;
	}
	/**
	 *
	 * @param {Object} param0 product_id is used to exclude product_id
	 * @param {Number} param0.top
	 * @param {Number} param0.category_id
	 * @param {Number} param0.product_id
	 * @returns
	 */
	async getRelated({ top, category_id, product_id }) {
		const data = await Product.findAll({
			include: { model: db.category, as: "category" },
			where: {
				status: {
					[Op.eq]: true,
				},
				category_id,
				product_id: {
					[Op.ne]: product_id,
				},
			},
			limit: top,
		});
		return data;
	}
	/**
	 *
	 * @param {Number} top
	 * @returns
	 */
	async getLatestProducts(top) {
		const data = await Product.findAll({
			// include: { model: db.category, as: "category" },
			where: {
				status: {
					[Op.eq]: true,
				},
			},
			order: [["updated_at", "desc"]],
			limit: top,
		});
		return data;
	}
	/**
	 *
	 * @param {Number} offset
	 * @param {Number} limit
	 * @param {Object} condition
	 * @returns
	 */
	async getAll(offset, limit, condition) {
		let { keyword, rating, categories, brands } = condition;
		if (!keyword) {
			keyword = "";
		}
		if (!brands) {
			brands = "";
		}
		if (!categories) {
			categories = "";
		}
		if (!rating) {
			rating = 0;
		}
		// good string 12%2C11
		categories = categories.replaceAll("%2C", ",");
		brands = brands.replaceAll("%2C", ",");
		// fix replace -> replaceAll
		const categoriesSql = categories ? categories.split(",").map((value) => parseInt(value)) : [];
		const brandsSql = brands ? brands.split(",").map((value) => parseInt(value)) : [];
		const data = await Product.findAndCountAll({
			// attributes: ["product_id"],
			include: [
				{
					model: db.category,
					as: "category",
				},
				{
					model: db.brand,
					as: "brand",
				},
			],
			where: {
				status: {
					[Op.eq]: true,
				},
				quantity: {
					[Op.gt]: sequelize.col("sold_quantity"),
				},
				[Op.and]: [
					{
						[Op.or]: [
							sequelize.where(
								sequelize.fn("dbo.f_remove_accents", sequelize.col("[product].name")),
								Op.substring,
								sequelize.literal(`'%' + dbo.f_remove_accents(N'${keyword}') + '%'`),
							),
							sequelize.where(
								sequelize.fn("dbo.f_remove_accents", sequelize.col("[product].description")),
								Op.substring,
								sequelize.literal(`'%' + dbo.f_remove_accents(N'${keyword}') + '%'`),
							),
							sequelize.where(
								sequelize.fn("dbo.f_remove_accents", sequelize.col("[category].name")),
								Op.substring,
								sequelize.literal(`'%' + dbo.f_remove_accents(N'${keyword}') + '%'`),
							),
							sequelize.where(
								sequelize.fn("dbo.f_remove_accents", sequelize.col("[brand].name")),
								Op.substring,
								sequelize.literal(`'%' + dbo.f_remove_accents(N'${keyword}') + '%'`),
							),
						],
					},
					rating && rating > 0 ? { rating: { [Op.gte]: parseInt(rating) } } : null,
					categoriesSql.length > 0 ? { category_id: { [Op.in]: categoriesSql } } : null,
					brandsSql.length > 0 ? { brand_id: { [Op.in]: brandsSql } } : null,
				],
			},
			offset,
			limit,
		});
		return data;
	}
	/**
	 *
	 * @param {Number} offset
	 * @param {Number} limit
	 * @returns
	 */
	async adminGetAll(offset, limit) {
		const amount = await Product.count();
		const data = await Product.findAll({
			include: [
				{
					model: db.category,
					as: "category",
				},
				{
					model: db.brand,
					as: "brand",
				},
				{ model: db.image, as: "images" },
			],
			offset,
			limit,
		});
		return { count: amount, rows: data };
	}
	/**
	 * @param {Object} body
	 * @param {String} body.name
	 * @param {String} body.description
	 * @param {Number} body.price
	 * @param {String} body.specification
	 * @param {String} body.calculation_unit
	 * @param {Number} body.discount
	 * @param {Number} body.quantity
	 * @param {Number} body.category_id
	 * @param {Number} body.brand_id
	 * @param {String[]} images
	 * @returns
	 */
	async createProduct(body, images) {
		const {
			name,
			description,
			price,
			specification,
			calculation_unit,
			discount,
			quantity,
			category_id,
			brand_id,
		} = body;
		const img = images.length > 0 ? images[0] : "";
		const product = await Product.create({
			name,
			description,
			image: img,
			price,
			specification,
			calculation_unit,
			discount,
			sold_quantity: 0,
			quantity,
			category_id,
			brand_id,
			status: true,
			rating: 0,
			number_of_rating: 0,
		});
		images.forEach(async (img, index) => {
			await imageService.createImage(img, index, product.dataValues.product_id);
		});
		return;
	}
	/**
	 *
	 * @param {Number} productId
	 * @returns
	 */
	async deleteProduct(productId) {
		const isExist = await this.getProductById(productId, true);
		try {
			if (isExist) {
				// check usage
				const isUsed = await checkProductUsage(productId);
				if (isUsed) {
					await Product.update(
						{
							status: false,
						},
						{
							where: {
								product_id: productId,
							},
						},
					);
				} else {
					const images = isExist.dataValues.images;
					for (const img of images) {
						await imageService.deleteImage(img.image_id);
						try {
							await singleDelete(img.image);
						} catch (error) {
							console.log(error);
						}
					}
					await Product.destroy({
						where: { product_id: productId },
					});
				}
			} else {
				throw new ErrorStatus({
					message: "product_id" + MESSAGE.NOT_FOUND,
				});
			}
			return;
		} catch (error) {
			return Promise.reject(error);
		}
	}
	/**
	 *
	 * @param {Number} product_id
	 * @param {Object} body
	 * @param {String} body.name
	 * @param {String} body.description
	 * @param {Number} body.price
	 * @param {String} body.specification
	 * @param {String} body.calculation_unit
	 * @param {Number} body.discount
	 * @param {Number} body.quantity
	 * @param {Number} body.category_id
	 * @param {Number} body.brand_id
	 * @param {String[]} images
	 * @returns
	 */
	async updateProduct(product_id, body, images) {
		const img = images.length > 0 ? images[0] : "";
		const dataSet = img !== "" ? { ...body, image: img } : { ...body };
		const rows = await Product.update(dataSet, {
			where: {
				product_id,
			},
		});
		return rows;
	}
}

const productService = new ProductService();

export default productService;
