import multer, { MulterError } from "multer";
import { ErrorStatus } from "../models/Errors.js";

const imageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./storage/images");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
	},
});

const memoryStorage = multer.memoryStorage();

/**
 * only check when having file
 * @param {import("express").Request} req
 * @param {*} file
 * @param {*} cb
 * @returns req.isImage Boolean
 */
const imageFilter = function (req, file, cb) {
	if (file.mimetype.startsWith("image/")) {
		req.isImage = true;
		cb(null, true); // accept file
	} else {
		req.isImage = false;
		cb(null, false); // decline file
	}
};

export const upload = {
	imageStorage: multer({ storage: imageStorage }),
	memoryStorage: multer({ storage: memoryStorage, fileFilter: imageFilter }),
	updateStorage: multer({ storage: memoryStorage }),
};

/**
 *
 * @param {String} originalname
 * @param {Boolean} slash
 * @returns
 */
export const createUniqueName = (originalname, slash = false) => {
	const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
	let fileName = "";
	if (slash) {
		fileName += "\\";
	}
	fileName += originalname + "-" + uniqueSuffix;
	return fileName;
};

/**
 *
 * @param {MulterError} err
 * @param {import("express").NextFunction} next
 * @returns
 */
export const catchMulterErr = (err, next) => {
	// A Multer error occurred when uploading.
	if (err.code === "LIMIT_UNEXPECTED_FILE") {
		return next(
			new ErrorStatus({
				message: err.message + " " + err.field,
			}),
		);
	} else {
		return next(
			new ErrorStatus({
				message: err.field + " " + err.code,
			}),
		);
	}
};
