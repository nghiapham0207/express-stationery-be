import express from "express";
import {
	adminGetAllByStatus,
	changeOrderStatus,
	getAllOrder,
	getRevenue,
	insertOrder,
} from "../controllers/order.controller.js";
import { wrapTryCatch } from "../utils/handlers.js";
import { accessTokenValidator } from "../middlewares/user.middleware.js";
import { paginationValidator } from "../middlewares/common.middleware.js";
import { verifyAdmin, verifyCustomer } from "../middlewares/permission.middleware.js";
import {
	adminGetAllByStatusValidator,
	changeOrderStatusValidator,
	getAllByStatusValidator,
	getRevenueValidator,
	insertOrderValidator,
} from "../middlewares/order.middleware.js";

const orderRouter = express.Router();

orderRouter.get(
	"/all",
	paginationValidator,
	getAllByStatusValidator,
	accessTokenValidator,
	verifyCustomer,
	wrapTryCatch(getAllOrder),
);
/**
 * Admin
 */
orderRouter.get(
	"/all-by-status",
	paginationValidator,
	adminGetAllByStatusValidator,
	accessTokenValidator,
	verifyAdmin,
	wrapTryCatch(adminGetAllByStatus),
);
orderRouter.post("/", accessTokenValidator, insertOrderValidator, wrapTryCatch(insertOrder));
orderRouter.patch(
	"/:order_id",
	accessTokenValidator,
	changeOrderStatusValidator,
	wrapTryCatch(changeOrderStatus),
);
orderRouter.get(
	"/revenue",
	accessTokenValidator,
	verifyAdmin,
	paginationValidator,
	getRevenueValidator,
	wrapTryCatch(getRevenue),
);

export default orderRouter;
