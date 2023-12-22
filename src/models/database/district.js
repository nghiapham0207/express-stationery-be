import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"district",
		{
			district_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			district_name: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			district_type: {
				type: DataTypes.STRING(2),
				allowNull: true,
			},
			province_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "province",
					key: "province_id",
				},
			},
		},
		{
			sequelize,
			tableName: "district",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_district",
					unique: true,
					fields: [{ name: "district_id" }],
				},
			],
		},
	);
}
