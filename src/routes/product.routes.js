import express from "express";
import {
	adminGetAll,
	createProduct,
	deleteProduct,
	getAll,
	getLatestProducts,
	getProductById,
	getRelated,
	getSaleOff,
	getTopRated,
	updateProduct,
} from "../controllers/product.controller.js";
import { wrapTryCatch } from "../utils/handlers.js";
import {
	getAllValidator,
	getProductByIdValidator,
	relatedProductValidator,
	topProductValidator,
} from "../middlewares/product.middleware.js";
import { paginationValidator } from "../middlewares/common.middleware.js";
import { accessTokenValidator } from "../middlewares/user.middleware.js";
import { verifyAdmin } from "../middlewares/permission.middleware.js";

const productRouter = express.Router();

productRouter.post("/", accessTokenValidator, verifyAdmin, wrapTryCatch(createProduct));
productRouter.get("/all", paginationValidator, getAllValidator, wrapTryCatch(getAll));
productRouter.get(
	"/admin-all",
	accessTokenValidator,
	verifyAdmin,
	paginationValidator,
	wrapTryCatch(adminGetAll),
);
productRouter.get("/latest", topProductValidator, wrapTryCatch(getLatestProducts));
productRouter.get("/sale-off", topProductValidator, wrapTryCatch(getSaleOff));
productRouter.get("/top-rated", topProductValidator, wrapTryCatch(getTopRated));
productRouter.get(
	"/related",
	topProductValidator,
	relatedProductValidator,
	wrapTryCatch(getRelated),
);
productRouter.get("/:product_id", getProductByIdValidator, wrapTryCatch(getProductById));
productRouter.delete(
	"/:product_id",
	accessTokenValidator,
	getProductByIdValidator,
	verifyAdmin,
	wrapTryCatch(deleteProduct),
);
productRouter.put(
	"/:product_id",
	getProductByIdValidator,
	accessTokenValidator,
	verifyAdmin,
	wrapTryCatch(updateProduct),
);

export default productRouter;
