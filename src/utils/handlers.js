/**
 * wrapping request handler in try catch
 * @param {Function} fn async fn
 * @returns handler fn
 */
export const wrapTryCatch = (fn) => {
	/**
	 *
	 * @param {import("express").Request} req
	 * @param {import("express").Response} res
	 * @param {import("express").NextFunction} next
	 * @returns
	 */
	const returnValue = async (req, res, next) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			next(error);
		}
	};
	return returnValue;
};
