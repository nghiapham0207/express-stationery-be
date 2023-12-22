import { Op } from "sequelize";
import db from "../models/database/index.js";

const Conversation = db.conversation;

class ConversationService {
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.sender_id
	 * @param {Number} param0.receiver_id
	 * @param {String} param0.message
	 * @returns
	 */
	async create({ sender_id, receiver_id, message = "" }) {
		const data = await Conversation.create({ sender_id, receiver_id, message });
		return data;
	}
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.sender_id
	 * @param {Number} param0.receiver_id
	 * @param {Number} param0.offset
	 * @param {Number} param0.limit
	 * @returns
	 */
	async getConversations({ sender_id, receiver_id, offset = 0, limit = 10 }) {
		const data = await Conversation.findAndCountAll({
			where: {
				[Op.or]: [
					{ sender_id, receiver_id },
					{ sender_id: receiver_id, receiver_id: sender_id },
				],
			},
			order: [
				["conversation_id", "desc"],
				["updated_at", "desc"],
			],
			offset,
			limit,
			// logging: (...msg) => console.log(msg),
		});
		return data;
	}
}

const conversationService = new ConversationService();

export default conversationService;
