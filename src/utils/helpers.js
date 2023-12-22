import { MESSAGE } from "../constants/messages.js";

/**
 * get limit and offset from page and size
 * @param {String} page index of page
 * @param {String} size limit
 * @returns offset, limit
 */
export const getPagination = (page = "0", size = "10") => {
	const limit = parseInt(size);
	const offset = parseInt(page) * limit;
	return { offset, limit };
};

/**
 * get response from data which retrieved from model
 * @param {Object} data data has rows, count
 * @param {Number} data.count
 * @param {Object[]} data.rows
 * @param {Number} page index of page
 * @param {Number} limit limit
 * @returns response
 */
export const getPagingData = (data, page, limit) => {
	const { count: totalItems, rows: items } = data;
	const currentPage = +page ? +page : 0;
	const totalPages = Math.ceil(totalItems / parseInt(limit));
	if (currentPage < 0 || currentPage >= totalPages) {
		throw new Error("Page" + MESSAGE.IS_INVALID);
	}
	return { totalPages, totalItems, currentPage, items };
};

/**
 *
 * @param {Object} obj
 * @param {String[]} keysCheck
 * @param {Number} length number of keys in object
 * @returns true if Object has valid keys
 */
export const checkKeys = (obj, keysCheck) => {
	if (!Array.isArray(keysCheck)) {
		throw new Error("keysCheck must be an array of key!");
	}
	for (const key of keysCheck) {
		if (!obj[key]) {
			return false;
		}
	}
	return true;
};

/**
 * random password
 * @returns  String - password
 */
export const randomPassword = () => {
	return Math.random().toString(36).substring(2, 15);
};
