import express from "express";
import { createBrand, deleteBrand, getAll, updateBrand } from "../controllers/brand.controller.js";
import { wrapTryCatch } from "../utils/handlers.js";
import {
	brandParamValidator,
	createBrandValidator,
	deleteBrandValidator,
} from "../middlewares/brand.middleware.js";
import { accessTokenValidator } from "../middlewares/user.middleware.js";
import { verifyAdmin } from "../middlewares/permission.middleware.js";

const brandRouter = express.Router();

brandRouter.get("/all", wrapTryCatch(getAll));
brandRouter.post(
	"/",
	accessTokenValidator,
	verifyAdmin,
	createBrandValidator,
	wrapTryCatch(createBrand),
);
brandRouter.put(
	"/:brand_id",
	accessTokenValidator,
	verifyAdmin,
	brandParamValidator,
	createBrandValidator,
	wrapTryCatch(updateBrand),
);
brandRouter.delete(
	"/:brand_id",
	accessTokenValidator,
	verifyAdmin,
	brandParamValidator,
	deleteBrandValidator,
	wrapTryCatch(deleteBrand),
);

export default brandRouter;
