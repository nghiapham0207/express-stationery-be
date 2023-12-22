import nodeMailer from "nodemailer";
import { envConfig } from "../config/config.js";

const transporter = nodeMailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: envConfig.systemEmail,
		pass: envConfig.systemEmailKey,
	},
});

/**
 * Send mail
 * @param {String} to list of receiver
 * @param {String} subject title of mail
 * @param {String} text plain text content
 * @param {String} html html format
 * @returns Promise
 */
export const sendMail = (to, subject, text = "", html = "") => {
	return transporter.sendMail({
		from: envConfig.systemEmail,
		to: to,
		subject: subject,
		text: text,
		html: html,
	});
};
