import { HTTP_STATUS } from "../constants/httpStatus.js";
import { MESSAGE } from "../constants/messages.js";

export class ErrorStatus {
	constructor({ success = false, message, status = HTTP_STATUS.BAD_REQUEST }) {
		this.success = success;
		this.message = message;
		this.status = status;
	}
}

export class SchemaError extends ErrorStatus {
	constructor({
		success = false,
		message = MESSAGE.VALIDATION_ERROR,
		status = HTTP_STATUS.UNPROCESSABLE_ENTITY,
		error,
	}) {
		super({ success, message, status });
		this.error = error;
	}
}
