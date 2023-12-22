import userRouter from "./user.routes.js";
import addressRouter from "./address.routes.js";
import categoryRouter from "./category.routes.js";
import brandRouter from "./brand.routes.js";
import posterRouter from "./poster.routes.js";
import productRouter from "./product.routes.js";
import cartRouter from "./cart.routes.js";
import orderRouter from "./order.routes.js";
import conversationRouter from "./conversation.routes.js";

/**
 *
 * @param {import("express").Express} app
 */
export default function route(app) {
	app.use("/user", userRouter);
	app.use("/address", addressRouter);
	app.use("/category", categoryRouter);
	app.use("/brand", brandRouter);
	app.use("/poster", posterRouter);
	app.use("/product", productRouter);
	app.use("/cart", cartRouter);
	app.use("/order", orderRouter);
	app.use("/conversation", conversationRouter);
}
