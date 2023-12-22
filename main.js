import { createServer } from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config.js";
import { readFileSync } from "fs";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import rateLimit from "express-rate-limit";

import route from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";
import { checkKeys } from "./src/utils/helpers.js";
import initSocketIO from "./src/socket/socket.js";
import { envConfig } from "./src/config/config.js";

const app = express();
const httpServer = createServer(app);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// store: ... , // Use an external store for more precise rate limiting
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// const file = readFileSync(path.resolve("stationery-swagger.yml"), "utf8");
const file = readFileSync("./stationery-swagger.yaml", "utf8");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Stationery API",
			version: "1.0.0",
		},
	},
	apis: ["./src/routes/*.routes.js"], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

const swaggerDocument = YAML.parse(file);

var corsOptions = {
	origin: [envConfig.feURL, envConfig.feAdminURL],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// simple route
app.get(
	"/",
	(req, res, next) => {
		if (checkKeys(req.body, ["a", "b"], 2)) {
			next();
		} else {
			res.json({ message: "teetetete" });
		}
		// code sau next vẫn chạy rầm rầm
		// res.json({ message: "TEST next" });
	},
	(req, res) => {
		res.json({ message: "Welcome to application." });
	},
);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// set port, listen for requests
const PORT = envConfig.port;
route(app);

// handle error
app.use(errorHandler);

// io
initSocketIO(httpServer);

httpServer.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
