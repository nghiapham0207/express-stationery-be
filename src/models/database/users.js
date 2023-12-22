import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"users",
		{
			user_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			username: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			first_name: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			last_name: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			image: {
				type: DataTypes.STRING(300),
				allowNull: true,
			},
			address_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "address",
					key: "address_id",
				},
			},
			email: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
			},
			phone: {
				type: DataTypes.STRING(20),
				allowNull: true,
			},
			created_at: {
				type: DataTypes.DATEONLY,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATEONLY,
				defaultValue: DataTypes.NOW,
			},
			permission_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "permission",
					key: "permission_id",
				},
			},
			status: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			forgot_password_token: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			refresh_token: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "users",
			schema: "dbo",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			indexes: [
				{
					name: "PK_user",
					unique: true,
					fields: [{ name: "user_id" }],
				},
			],
		},
	);
}
