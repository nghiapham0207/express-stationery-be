import jwt from "jsonwebtoken";

/**
 *
 * @param {Object} param0
 * @param {Object} param0.payload
 * @param {Number} param0.payload.userId
 * @param {Number} param0.payload.permission
 * @param {Number} param0.payload.tokenType
 * @param {import("jsonwebtoken").Secret} param0.privateKey
 * @param {import("jsonwebtoken").SignOptions} param0.options
 * @returns
 */
export const signToken = ({
	payload,
	privateKey,
	options = {
		algorithm: "HS256",
	},
}) => {
	options.algorithm = "HS256";
	return new Promise((resolve, reject) => {
		jwt.sign(payload, privateKey, options, (error, accessToken) => {
			if (error) {
				throw reject(error);
			} else {
				resolve(accessToken);
			}
		});
	});
};

/**
 *
 * @param {Object} param0
 * @param {String} param0.token
 * @param {import("jsonwebtoken").Secret} param0.secretOrPublicKey
 * @returns
 */
export const verifyToken = ({ token, secretOrPublicKey }) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secretOrPublicKey, (error, decoded) => {
			if (error) {
				throw reject(error);
			} else {
				resolve(decoded);
			}
		});
	});
};
