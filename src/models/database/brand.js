import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"brand",
		{
			brand_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING(200),
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "brand",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_brand",
					unique: true,
					fields: [{ name: "brand_id" }],
				},
			],
		},
	);
}
