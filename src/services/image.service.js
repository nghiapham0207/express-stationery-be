import db from "../models/database/index.js";

const Image = db.image;

class ImageService {
	/**
	 *
	 * @param {String} image
	 * @param {Number} index
	 * @param {Number} product_id
	 * @returns
	 */
	async createImage(image, index, product_id) {
		const data = await Image.create({
			image,
			order_of_appearance: index,
			product_id,
		});
		return data;
	}
	/**
	 *
	 * @param {Number} image_id
	 * @returns
	 */
	async deleteImage(image_id) {
		const data = await Image.destroy({
			where: {
				image_id,
			},
		});
		return data;
	}
}

const imageService = new ImageService();

export default imageService;
