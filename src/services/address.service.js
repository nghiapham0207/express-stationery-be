import db from "../models/database/index.js";

const Address = db.address;
const Ward = db.ward;
const District = db.district;
const Province = db.province;

class AddressService {
	/**
	 * get all address
	 * @returns Array of model || null
	 */
	async getAll() {
		const data = await Address.findAll({
			attributes: ["throw-error"],
		});
		return data;
	}
	/**
	 *
	 * @param {Number} district_id
	 * @returns Array or null
	 */
	async getAllWardByDistrictID(district_id) {
		const data = await Ward.findAll({
			where: {
				district_id,
			},
		});
		return data;
	}
	/**
	 *
	 * @param {Number} province_id
	 * @returns
	 */
	async getAllDistrictByProvinceID(province_id) {
		const data = await District.findAll({
			where: { province_id },
		});
		return data;
	}
	/**
	 *
	 * @returns
	 */
	async getAllProvince() {
		const data = await Province.findAll();
		return data;
	}
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.ward_id
	 * @param {String} param0.specific_address
	 * @returns
	 */
	async insertAddress({ ward_id, specific_address }) {
		const data = await Address.create({ ward_id, specific_address });
		return data;
	}
	/**
	 *
	 * @param {Object} param0
	 * @param {Number} param0.address_id
	 * @param {Number} param0.ward_id
	 * @param {String} param0.specific_address
	 * @returns
	 */
	async updateAddress({ address_id, ward_id, specific_address }) {
		const data = await Address.update(
			{
				ward_id,
				specific_address,
			},
			{
				where: {
					address_id,
				},
			},
		);
		return data; // row affected
	}
	/**
	 *
	 * @param {Object} body
	 * @param {Number} body.address_id
	 * @param {String} body.address_desc
	 * @param {Number} body.ward_id
	 * @returns updated address id
	 */
	async updateDeliveryAddress(body) {
		const { address_id, address_desc, ward_id } = body;
		let updatedAddress = null;
		let updatedAddressId = null;
		if (address_id) {
			updatedAddressId = address_id;
			updatedAddress = await this.updateAddress({
				address_id: parseInt(address_id),
				ward_id: parseInt(ward_id),
				specific_address: address_desc,
			});
		} else {
			updatedAddress = await this.insertAddress({
				ward_id: parseInt(ward_id),
				specific_address: address_desc,
			});
			updatedAddressId = updatedAddress.dataValues.address_id;
		}
		return updatedAddressId;
	}
}

const addressService = new AddressService();

export default addressService;
