import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"ward",
		{
			ward_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			ward_name: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			ward_type: {
				type: DataTypes.STRING(2),
				allowNull: true,
			},
			district_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "district",
					key: "district_id",
				},
			},
		},
		{
			sequelize,
			tableName: "ward",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_ward",
					unique: true,
					fields: [{ name: "ward_id" }],
				},
			],
		},
	);
}
