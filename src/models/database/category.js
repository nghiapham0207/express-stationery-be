import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"category",
		{
			category_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			image: {
				type: DataTypes.STRING(300),
				allowNull: true,
			},
			note: {
				type: DataTypes.STRING(300),
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "category",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_category",
					unique: true,
					fields: [{ name: "category_id" }],
				},
			],
		},
	);
}
