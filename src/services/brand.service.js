import db from "../models/database/index.js";

const Brand = db.brand;

class BrandService {
	/**
	 * get all brand
	 * @returns model
	 */
	async getAll() {
		const data = await Brand.findAll();
		return data;
	}
	/**
	 *
	 * @param {Number} brand_id
	 * @returns
	 */
	async getById(brand_id) {
		const data = await Brand.findOne({
			where: {
				brand_id,
			},
		});
		return data;
	}
	/**
	 *
	 * @param {Object} dataBody
	 * @param {String} dataBody.name
	 * @param {String} dataBody.description
	 * @returns
	 */
	async createBrand(dataBody) {
		const data = await Brand.create(dataBody);
		return data;
	}
	/**
	 *
	 * @param {Number} brand_id
	 * @param {Object} dataBody
	 * @param {String} dataBody.name
	 * @param {String} dataBody.description
	 * @returns
	 */
	async updateBrand(brand_id, dataBody) {
		const rows = await Brand.update(dataBody, {
			where: {
				brand_id,
			},
		});
		return rows;
	}
	/**
	 *
	 * @param {Number} brand_id
	 */
	async deleteBrand(brand_id) {
		const rows = await Brand.destroy({
			where: {
				brand_id,
			},
		});
		return rows;
	}
}

const brandService = new BrandService();

export default brandService;
