import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"cart",
		{
			product_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: "product",
					key: "product_id",
				},
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: "users",
					key: "user_id",
				},
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "cart",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_cart",
					unique: true,
					fields: [{ name: "product_id" }, { name: "user_id" }],
				},
			],
		},
	);
}
