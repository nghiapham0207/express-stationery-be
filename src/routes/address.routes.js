import express from "express";
import {
	getAll,
	getAllDistrictByProvinceID,
	getAllProvince,
	getAllWardByDistrictID,
	updateDeliveryAddress,
} from "../controllers/address.controller.js";
import { wrapTryCatch } from "../utils/handlers.js";
import { accessTokenValidator } from "../middlewares/user.middleware.js";
import { updateDeliveryAddressValidator } from "../middlewares/address.middleware.js";

const addressRouter = express.Router();

addressRouter.get("/all", wrapTryCatch(getAll));
addressRouter.get("/ward", wrapTryCatch(getAllWardByDistrictID));
addressRouter.get("/district", wrapTryCatch(getAllDistrictByProvinceID));
addressRouter.get("/province/all", wrapTryCatch(getAllProvince));
addressRouter.put(
	"/order",
	accessTokenValidator,
	updateDeliveryAddressValidator,
	wrapTryCatch(updateDeliveryAddress),
);

export default addressRouter;
