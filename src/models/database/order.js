import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"order",
		{
			order_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			total_price: {
				type: DataTypes.DECIMAL(18, 2),
				allowNull: false,
			},
			status_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
				references: {
					model: "order_status",
					key: "status_id",
				},
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "user_id",
				},
			},
		},
		{
			sequelize,
			tableName: "order",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_order",
					unique: true,
					fields: [{ name: "order_id" }],
				},
			],
		},
	);
}
