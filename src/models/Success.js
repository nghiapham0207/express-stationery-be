import { HTTP_STATUS } from "../constants/httpStatus.js";

export class SuccessStatus {
	constructor({ success = true, message, status = HTTP_STATUS.OK, data }) {
		this.success = success;
		this.message = message;
		this.status = status;
		this.data = data;
	}
}
