import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"image",
		{
			image_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			image: {
				// type: DataTypes.BLOB,
				type: DataTypes.STRING(512),
				allowNull: true,
			},
			order_of_appearance: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			product_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "product",
					key: "product_id",
				},
			},
		},
		{
			sequelize,
			tableName: "image",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "IX_image",
					fields: [{ name: "image_id" }],
				},
				{
					name: "PK_image",
					unique: true,
					fields: [{ name: "image_id" }],
				},
			],
		},
	);
}
