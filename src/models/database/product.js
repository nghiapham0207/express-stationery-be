import { DataTypes, Sequelize } from "sequelize";

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 * @returns
 */
export default function (sequelize, DataTypes) {
	return sequelize.define(
		"product",
		{
			product_id: {
				autoIncrement: true,
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(200),
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING(1000),
				allowNull: true,
			},
			image: {
				type: DataTypes.STRING(512),
				allowNull: true,
			},
			price: {
				type: DataTypes.DECIMAL(18, 2),
				allowNull: false,
			},
			specification: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			calculation_unit: {
				type: DataTypes.STRING(15),
				allowNull: false,
			},
			discount: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			sold_quantity: {
				type: DataTypes.INTEGER,
				allowNull: true,
				// defaultValue: 0,
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			category_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "category",
					key: "category_id",
				},
			},
			brand_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "brand",
					key: "brand_id",
				},
			},
			status: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			created_at: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			updated_at: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			rating: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			number_of_rating: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "product",
			schema: "dbo",
			timestamps: false,
			indexes: [
				{
					name: "PK_product",
					unique: true,
					fields: [{ name: "product_id" }],
				},
			],
		},
	);
}
