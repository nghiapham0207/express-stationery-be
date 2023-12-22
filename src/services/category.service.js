import db from "../models/database/index.js";

const Category = db.category;

class CategoryService {
	/**
	 * get all category
	 * @returns model
	 */
	async getAll() {
		const data = await Category.findAll();
		return data;
	}
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.category_id
	 * @returns
	 */
	async getCategoryByID({ category_id }) {
		const data = await Category.findOne({
			// include: isIncludeImage ? { model: db.image, as: "images" } : null,
			where: { category_id },
		});
		return data;
	}
	/**
	 *
	 * @param {Object} bodyData
	 * @param {String} bodyData.name
	 * @param {String} bodyData.image
	 * @param {String} bodyData.note
	 * @returns
	 */
	async createCategory(bodyData) {
		const data = await Category.create(bodyData);
		return data;
	}
	/**
	 *
	 * @param {Object} body
	 * @param {String} body.name
	 * @param {String} body.image
	 * @param {String} body.note
	 * @param {Number} category_id
	 */
	async updateCategory(body, category_id) {
		await Category.update(
			{
				...body,
			},
			{
				where: { category_id },
			},
		);
	}
	/**
	 * number of rows affected
	 * @param {Number} category_id
	 */
	async deleteCategory(category_id) {
		const data = await Category.destroy({ where: { category_id } });
		return data;
	}
}

const categoryService = new CategoryService();

export default categoryService;
