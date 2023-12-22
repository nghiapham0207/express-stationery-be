import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"address",
		{
			address_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			ward_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "ward",
					key: "ward_id",
				},
			},
			specific_address: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "address",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_address",
					unique: true,
					fields: [{ name: "address_id" }],
				},
			],
		},
	);
}
