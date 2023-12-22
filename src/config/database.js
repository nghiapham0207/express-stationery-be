import { Sequelize } from "sequelize";

import { envConfig } from "../config/config.js";

const sequelize = new Sequelize(envConfig.database, envConfig.dbUsername, envConfig.dbPassword, {
	host: envConfig.dbHost,
	dialect: "mssql",
	dialectOptions: {
		options: {
			encrypt: true,
			trustServerCertificate: true,
		},
	},
	ssl: true,
	logging: false,
});

// const sequelize = new Sequelize(envConfig.database, "nghia", "123123123", {
// 	host: envConfig.dbHost,
// 	dialect: "mssql",
// 	dialectOptions: {
// 		options: {
// 			// instanceName: "SQLEXPRESS",
// 			encrypt: false,
// 			trustServerCertificate: false,
// 			// server: envConfig.dbHost,
// 			// authentication: {
// 			// 	type: "default",
// 			// 	encrypt: false,
// 			// 	options: {
// 			// 		domain: envConfig.dbHost,
// 			// 		userName: "nghia",
// 			// 		password: "123123123",
// 			// 		encrypt: false,
// 			// 	},
// 			// },
// 		},
// 	},
// 	// ssl: true,
// 	logging: false,
// });

/**
 * Test Connection
 */
(async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
})();

export default sequelize;
