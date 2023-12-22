export const TokenType = {
	AccessToken: 0,
	RefreshToken: 1,
	ForgotPasswordToken: 2,
};

export const Permission = {
	Customer: 1,
	Admin: 2,
};

export const OrderStatus = {
	All: 0, // to get all order
	Pending: 1,
	RequestCancel: 2,
	Delivering: 3,
	Delivered: 4,
	Canceled: 5,
};

export const RevenueMode = {
	THIS_DATE: 1,
	THIS_MONTH: 2,
	SELECT_DATE: 3,
};

export const MAX_PRODUCT_IMAGES = 5;
