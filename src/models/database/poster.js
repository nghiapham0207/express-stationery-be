import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"poster",
		{
			id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(300),
				allowNull: true,
			},
			type: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
		},
		{
			sequelize,
			tableName: "poster",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_poster",
					unique: true,
					fields: [{ name: "id" }],
				},
			],
		},
	);
}
