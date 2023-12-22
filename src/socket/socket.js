import { Server } from "socket.io";
import conversationService from "../services/conversation.service.js";
import { verifyAccessToken } from "../middlewares/permission.middleware.js";
import { envConfig } from "../config/config.js";

/**
 *
 * @param {import("http").Server} httpServer
 */
const initSocketIO = (httpServer) => {
	const io = new Server(httpServer, {
		cors: {
			origin: [envConfig.feURL, envConfig.feAdminURL],
		},
	});

	const users = {}; // also use map, array
	io.use(async (socket, next) => {
		const { Authorization } = socket.handshake.auth;
		const accessToken = Authorization?.split(" ")[1];
		try {
			const decoded = await verifyAccessToken(accessToken);
			// check permission or verify
			socket.handshake.auth.decoded = decoded;
			socket.handshake.auth.accessToken = accessToken;
			next(); // ok
		} catch (error) {
			console.log(error);
			next({
				message: "Unauthorized!",
				name: "Middleware Server",
				data: error,
			});
		}
	});
	io.on("connection", (socket) => {
		console.log(`${socket.id} is connected`);
		const { userId } = socket.handshake.auth.decoded;
		users[userId] = {
			socket_id: socket.id,
		};
		// should get token from query
		// executed for each event emitted
		socket.use(async (packet, next) => {
			// packet looks like [event, ...args] => [event, accessToken, ...args]
			console.log("socket middleware", packet);
			console.log("test jwt", socket.handshake.auth);
			const { accessToken } = socket.handshake.auth;
			try {
				await verifyAccessToken(accessToken);
				next();
			} catch (error) {
				next(new Error("Unauthorized!"));
			}
		});
		socket.on("error", (err) => {
			console.log("On error", err);
			if (err.message === "Unauthorized!") {
				socket.disconnect();
			}
		});
		socket.on("send_message", async (data) => {
			const { receiver_id, sender_id, message } = data.payload;
			const receiver_socket_id = users[receiver_id]?.socket_id;
			const createdConversation = await conversationService.create({
				sender_id,
				receiver_id,
				message,
			});
			if (receiver_socket_id) {
				socket.to(receiver_socket_id).emit("receive_message", {
					payload: createdConversation.dataValues,
				});
			}
		});
		socket.on("disconnect", () => {
			delete users[userId];
			console.log(`${socket.id} is disconnected`);
		});
	});
};

export default initSocketIO;
