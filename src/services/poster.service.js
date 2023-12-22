import db from "../models/database/index.js";

const Poster = db.poster;

class PosterService {
	/**
	 * get all poster
	 * @returns model
	 */
	async getAll() {
		const data = await Poster.findAll();
		return data;
	}
}

const posterService = new PosterService();

export default posterService;
