import { Model } from "sequelize";
import db from "../models/database/index.js";

/**
 * this function require foreign key must be the same name as primary key
 * else check one model step by step
 * @param {Object} param0 has colName and value
 * @param {String} param0.colName
 * @param {*} param0.value
 * @param {Model} model is instance of Model database
 * @returns true if used
 */
export const isModelUsed = async ({ colName, value }, model) => {
	try {
		const result = await model.findOne({
			where: { [colName]: value },
		});
		return result !== null;
	} catch (error) {
		console.error("'Error while checking model usage:'", error);
		return false;
	}
};

/**
 * check a product row has used
 * @param {Number} productId
 * @returns
 */
export const checkProductUsage = async (productId) => {
	const relatedModels = [db.feedback, db.order_detail, db.cart];
	if (!Array.isArray(relatedModels)) {
		throw new Error("relatedModels must be an array!");
	}
	for (const model of relatedModels) {
		const isUsed = await isModelUsed({ colName: "product_id", value: productId }, model);
		if (isUsed) {
			return true;
		}
	}
	return false;
};
/**
 *
 * @param {Number} category_id
 * @returns
 */
export const checkCategoryUsage = async (category_id) => {
	const relatedModels = [db.product];
	if (!Array.isArray(relatedModels)) {
		throw new Error("relatedModels must be an array!");
	}
	for (const model of relatedModels) {
		const isUsed = await isModelUsed({ colName: "category_id", value: category_id }, model);
		if (isUsed) {
			return true;
		}
	}
	return false;
};

/**
 *
 * @param {Number} brand_id
 * @returns
 */
export const checkBrandUsage = async (brand_id) => {
	const relatedModels = [db.product];
	// no need check array
	if (!Array.isArray(relatedModels)) {
		throw new Error("relatedModels must be an array!");
	}
	for (const model of relatedModels) {
		const isUsed = await isModelUsed({ colName: "brand_id", value: brand_id }, model);
		if (isUsed) {
			return true;
		}
	}
	return false;
};
