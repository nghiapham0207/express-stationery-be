import express from "express";
import {
	addToCart,
	deleteAllCart,
	deleteCart,
	getAll,
	updateCart,
} from "../controllers/cart.controller.js";
import { wrapTryCatch } from "../utils/handlers.js";
import { productIdValidator } from "../middlewares/product.middleware.js";
import { accessTokenValidator } from "../middlewares/user.middleware.js";
import { updateCartValidator } from "../middlewares/cart.middleware.js";
import { verifyCustomer } from "../middlewares/permission.middleware.js";

const cartRouter = express.Router();

cartRouter.get("/all", accessTokenValidator, verifyCustomer, wrapTryCatch(getAll));
cartRouter.post(
	"/",
	productIdValidator,
	accessTokenValidator,
	verifyCustomer,
	wrapTryCatch(addToCart),
);
cartRouter.patch(
	"/",
	updateCartValidator,
	accessTokenValidator,
	verifyCustomer,
	wrapTryCatch(updateCart),
);
cartRouter.delete("/all", accessTokenValidator, verifyCustomer, wrapTryCatch(deleteAllCart));
cartRouter.delete("/:product_id", accessTokenValidator, verifyCustomer, wrapTryCatch(deleteCart));

export default cartRouter;
