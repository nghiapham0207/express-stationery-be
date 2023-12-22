import { HTTP_STATUS } from "../constants/httpStatus.js";
import { SuccessStatus } from "../models/Success.js";
import conversationService from "../services/conversation.service.js";
import { getPagination, getPagingData } from "../utils/helpers.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export const getConversation = async (req, res, next) => {
	const { userId } = req.decoded;
	const receiver_id = parseInt(req.params.receiver_id);
	const page = parseInt(req.query.page);
	const size = parseInt(req.query.size);
	const { offset, limit } = getPagination(page, size);
	const result = await conversationService.getConversations({
		sender_id: userId,
		receiver_id: receiver_id,
		offset,
		limit,
	});
	const data = getPagingData(result, page, size);
	return res
		.status(HTTP_STATUS.OK)
		.json(new SuccessStatus({ message: "get conversation successfully!", data }));
};
