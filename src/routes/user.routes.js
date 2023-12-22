import express from "express";
import * as userController from "../controllers/user.controller.js";
import * as userMiddleware from "../middlewares/user.middleware.js";
import { paginationValidator } from "../middlewares/common.middleware.js";
import { wrapTryCatch } from "../utils/handlers.js";
import { verifyAdmin } from "../middlewares/permission.middleware.js";

const userRouter = express.Router();

userRouter.post("/sign-up", userMiddleware.signUpValidator, wrapTryCatch(userController.signUp));
/**
 * @swagger
 * /user/sign-in:
 *  post:
 *   description: Welcome to swagger-jsdoc!
 *   responses:
 *    200:
 *	   description: Returns a mysterious string.
 */
userRouter.post("/sign-in", userMiddleware.signInValidator, wrapTryCatch(userController.signIn));
userRouter.get("/oauth/google", wrapTryCatch(userController.oauth));
/**
 * refreshTokenValidator is not neccessary
 * unless user has many refresh token
 */
userRouter.patch(
	"/logout",
	userMiddleware.accessTokenValidator,
	wrapTryCatch(userController.logout),
);
/**
 * Body: refresh_token
 */
userRouter.post(
	"/refresh-token",
	userMiddleware.refreshTokenValidator,
	wrapTryCatch(userController.refreshToken),
);
/**
 * submit email to get reset password token
 */
userRouter.post(
	"/forgot-password",
	userMiddleware.forgotPasswordValidator,
	wrapTryCatch(userController.forgotPassword),
);
/**
 * when user click link sent to mail, if invalid, will not allow to access reset pw page
 */
userRouter.post(
	"/verify-forgot-password",
	userMiddleware.forgotPasswordTokenValidator,
	wrapTryCatch(userController.forgotPasswordToken),
);
userRouter.patch(
	"/reset-password",
	userMiddleware.resetPasswordValidator,
	wrapTryCatch(userController.resetPassword),
);
userRouter.put("/", userMiddleware.accessTokenValidator, wrapTryCatch(userController.updateUser));
userRouter.get("/", userMiddleware.accessTokenValidator, wrapTryCatch(userController.getUser));
userRouter.get(
	"/:username",
	userMiddleware.usernameParamValidator,
	wrapTryCatch(userController.getUserByUsername),
);
/**
 * example for pagination
 */
userRouter.get(
	"/all",
	paginationValidator,
	userMiddleware.accessTokenValidator,
	verifyAdmin,
	wrapTryCatch(userController.adminGetAll),
);

export default userRouter;
