import express from "express";
import { getAll } from "../controllers/poster.controller.js";
import { wrapTryCatch } from "../utils/handlers.js";

const posterRouter = express.Router();

posterRouter.get("/all", wrapTryCatch(getAll));

export default posterRouter;
