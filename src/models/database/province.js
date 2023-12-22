import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"province",
		{
			province_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			province_name: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			province_type: {
				type: DataTypes.STRING(2),
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "province",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_province",
					unique: true,
					fields: [{ name: "province_id" }],
				},
			],
		},
	);
}
