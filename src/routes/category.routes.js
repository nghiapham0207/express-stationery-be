import express from "express";
import {
	createCategory,
	deleteCategory,
	getAll,
	updateCategory,
} from "../controllers/category.controller.js";
import { wrapTryCatch } from "../utils/handlers.js";
import { accessTokenValidator } from "../middlewares/user.middleware.js";
import { verifyAdmin } from "../middlewares/permission.middleware.js";
import {
	categoryParamValidator,
	deleteCategoryValidator,
} from "../middlewares/category.middleware.js";

const categoryRouter = express.Router();

categoryRouter.get("/all", wrapTryCatch(getAll));
categoryRouter.post("/", accessTokenValidator, verifyAdmin, wrapTryCatch(createCategory));
/**
 * it has image so validate in handler
 */
categoryRouter.put(
	"/:category_id",
	categoryParamValidator,
	accessTokenValidator,
	verifyAdmin,
	wrapTryCatch(updateCategory),
);
categoryRouter.delete(
	"/:category_id",
	categoryParamValidator,
	deleteCategoryValidator,
	accessTokenValidator,
	verifyAdmin,
	wrapTryCatch(deleteCategory),
);

export default categoryRouter;
