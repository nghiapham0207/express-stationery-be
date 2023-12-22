export const envConfig = {
	port: process.env.PORT || 8080,
	feURL: process.env.FE_URL,
	feAdminURL: process.env.FE_ADMIN_URL,
	// database
	database: process.env.DB_DATABASE,
	dbUsername: process.env.DB_USERNAME,
	dbPassword: process.env.DB_PASSWORD,
	dbHost: process.env.DB_HOST,
	// google
	clientRedirect: process.env.CLIENT_REDIRECT,
	googleClientID: process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
	googleRedirectURI: process.env.GOOLE_REDIRECT_URI,
	// JWT
	jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
	jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
	jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
	// JWT life time
	accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
	refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
	forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
	// Firebase storage
	firebaseImageStorage: process.env.IMAGE_STORAGE,
	// Email
	systemEmail: process.env.EMAIL,
	systemEmailKey: process.env.EMAIL_KEY,
	// hash password
	passwordSaltRounds: process.env.SALT_ROUNDS,
};
