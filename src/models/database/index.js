import { DataTypes, Sequelize } from "sequelize";

import sequelize from "../../config/database.js";
import address from "./address.js";
import brand from "./brand.js";
import cart from "./cart.js";
import category from "./category.js";
import district from "./district.js";
import feedback from "./feedback.js";
import image from "./image.js";
import order from "./order.js";
import order_detail from "./order_detail.js";
import order_status from "./order_status.js";
import permission from "./permission.js";
import poster from "./poster.js";
import product from "./product.js";
import province from "./province.js";
import users from "./users.js";
import ward from "./ward.js";
import conversation from "./conversation.js";

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.address = address(sequelize, DataTypes);
db.brand = brand(sequelize, DataTypes);
db.cart = cart(sequelize, DataTypes);
db.category = category(sequelize, DataTypes);
db.district = district(sequelize, DataTypes);
db.feedback = feedback(sequelize, DataTypes);
db.image = image(sequelize, DataTypes);
db.order = order(sequelize, DataTypes);
db.order_detail = order_detail(sequelize, DataTypes);
db.order_status = order_status(sequelize, DataTypes);
db.permission = permission(sequelize, DataTypes);
db.poster = poster(sequelize, DataTypes);
db.product = product(sequelize, DataTypes);
db.province = province(sequelize, DataTypes);
db.users = users(sequelize, DataTypes);
db.ward = ward(sequelize, DataTypes);
db.conversation = conversation(sequelize, DataTypes);

db.order.belongsToMany(db.product, {
	// as: "product_id_product_order_details",
	as: "order_product",
	through: db.order_detail,
	foreignKey: "order_id",
	otherKey: "product_id",
});
db.product.belongsToMany(db.order, {
	as: "order_id_orders",
	through: db.order_detail,
	foreignKey: "product_id",
	otherKey: "order_id",
});
db.product.belongsToMany(db.users, {
	as: "user_id_users",
	through: db.cart,
	foreignKey: "product_id",
	otherKey: "user_id",
});
db.product.belongsToMany(db.users, {
	as: "user_id_users_feedbacks",
	through: db.feedback,
	foreignKey: "product_id",
	otherKey: "user_id",
});
db.users.belongsToMany(db.product, {
	as: "product_id_products",
	through: db.cart,
	foreignKey: "user_id",
	otherKey: "product_id",
});
db.users.belongsToMany(db.product, {
	as: "product_id_product_feedbacks",
	through: db.feedback,
	foreignKey: "user_id",
	otherKey: "product_id",
});
db.users.belongsTo(db.address, { as: "address", foreignKey: "address_id" });
db.address.hasMany(db.users, { as: "users", foreignKey: "address_id" });
db.product.belongsTo(db.brand, { as: "brand", foreignKey: "brand_id" });
db.brand.hasMany(db.product, { as: "products", foreignKey: "brand_id" });
db.product.belongsTo(db.category, {
	as: "category",
	foreignKey: "category_id",
});
db.category.hasMany(db.product, { as: "products", foreignKey: "category_id" });
db.ward.belongsTo(db.district, { as: "district", foreignKey: "district_id" });
db.district.hasMany(db.ward, { as: "wards", foreignKey: "district_id" });
db.order_detail.belongsTo(db.order, { as: "order", foreignKey: "order_id" });
db.order.hasMany(db.order_detail, {
	as: "order_details",
	foreignKey: "order_id",
});
db.order.belongsTo(db.order_status, { as: "status", foreignKey: "status_id" });
db.order_status.hasMany(db.order, { as: "orders", foreignKey: "status_id" });
db.users.belongsTo(db.permission, {
	as: "permission",
	foreignKey: "permission_id",
});
db.permission.hasMany(db.users, { as: "users", foreignKey: "permission_id" });
db.cart.belongsTo(db.product, { as: "product", foreignKey: "product_id" });
db.product.hasMany(db.cart, { as: "carts", foreignKey: "product_id" });
db.feedback.belongsTo(db.product, { as: "product", foreignKey: "product_id" });
db.product.hasMany(db.feedback, { as: "feedbacks", foreignKey: "product_id" });
db.image.belongsTo(db.product, { as: "product", foreignKey: "product_id" });
db.product.hasMany(db.image, { as: "images", foreignKey: "product_id" });
db.order_detail.belongsTo(db.product, {
	as: "product",
	foreignKey: "product_id",
});
db.product.hasMany(db.order_detail, {
	as: "order_details",
	foreignKey: "product_id",
});
db.district.belongsTo(db.province, {
	as: "province",
	foreignKey: "province_id",
});
db.province.hasMany(db.district, {
	as: "districts",
	foreignKey: "province_id",
});
db.cart.belongsTo(db.users, { as: "user", foreignKey: "user_id" });
db.users.hasMany(db.cart, { as: "carts", foreignKey: "user_id" });
db.feedback.belongsTo(db.users, { as: "user", foreignKey: "user_id" });
db.users.hasMany(db.feedback, { as: "feedbacks", foreignKey: "user_id" });
db.order.belongsTo(db.users, { as: "user", foreignKey: "user_id" });
db.users.hasMany(db.order, { as: "orders", foreignKey: "user_id" });
db.address.belongsTo(db.ward, { as: "ward", foreignKey: "ward_id" });
db.ward.hasMany(db.address, { as: "addresses", foreignKey: "ward_id" });

export default db;
