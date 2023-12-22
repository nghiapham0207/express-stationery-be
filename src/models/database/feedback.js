import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"feedback",
		{
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: "users",
					key: "user_id",
				},
			},
			product_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: "product",
					key: "product_id",
				},
			},
			date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			comment: {
				type: DataTypes.STRING(2000),
				allowNull: true,
			},
			vote: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "feedback",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_feedback",
					unique: true,
					fields: [{ name: "user_id" }, { name: "product_id" }],
				},
			],
		},
	);
}
