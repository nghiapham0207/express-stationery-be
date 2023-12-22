import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"conversation",
		{
			conversation_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			sender_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			receiver_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			message_type: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			tableName: "conversation",
			schema: "dbo",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	);
}
