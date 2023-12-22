import { Router } from "express";
import { accessTokenValidator } from "../middlewares/user.middleware.js";
import { verifyCustomer } from "../middlewares/permission.middleware.js";
import { wrapTryCatch } from "../utils/handlers.js";
import * as conversationController from "../controllers/conversation.controller.js";
import { paginationValidator } from "../middlewares/common.middleware.js";
import { getConversationValidator } from "../middlewares/conversation.middleware.js";

const conversationRouter = Router();

conversationRouter.get(
	"/receiver/:receiver_id",
	accessTokenValidator,
	verifyCustomer,
	paginationValidator,
	getConversationValidator,
	wrapTryCatch(conversationController.getConversation),
);

export default conversationRouter;
