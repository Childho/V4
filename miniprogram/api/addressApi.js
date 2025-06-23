// 地址管理相关API接口文件
const { api } = require('./utils/request');

/**
 * 获取用户的地址列表
 * @returns {Promise<Array>} 地址列表
 */
const getAddressList = () => {
  return api.get('/api/address/list');
};

/**
 * 新增收货地址
 * @param {Object} addressData - 地址信息
 * @param {string} addressData.region - 所在地区，格式："省,市,区"
 * @param {string} addressData.detail - 详细地址
 * @param {string} addressData.consignee - 收件人姓名
 * @param {string} addressData.mobile - 手机号码
 * @param {boolean} addressData.isDefault - 是否设为默认地址
 * @returns {Promise<Object>} 新增结果
 */
const addAddress = (addressData) => {
  return api.post('/api/address/add', addressData);
};

/**
 * 修改收货地址
 * @param {Object} addressData - 地址信息
 * @param {number} addressData.id - 地址ID
 * @param {string} addressData.region - 所在地区，格式："省,市,区"
 * @param {string} addressData.detail - 详细地址
 * @param {string} addressData.consignee - 收件人姓名
 * @param {string} addressData.mobile - 手机号码
 * @param {boolean} addressData.isDefault - 是否设为默认地址
 * @returns {Promise<Object>} 修改结果
 */
const updateAddress = (addressData) => {
  return api.post('/api/address/update', addressData);
};

/**
 * 删除单个收货地址
 * @param {number} addressId - 地址ID
 * @returns {Promise<Object>} 删除结果
 */
const deleteAddress = (addressId) => {
  return api.post('/api/address/delete', { id: addressId });
};

/**
 * 批量删除收货地址
 * @param {Array<number>} addressIds - 地址ID数组
 * @returns {Promise<Object>} 删除结果
 */
const batchDeleteAddress = (addressIds) => {
  return api.post('/api/address/batchDelete', { ids: addressIds });
};

/**
 * 设置默认地址
 * @param {number} addressId - 地址ID
 * @returns {Promise<Object>} 设置结果
 */
const setDefaultAddress = (addressId) => {
  return api.post('/api/address/setDefault', { id: addressId });
};

module.exports = {
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress,
  batchDeleteAddress,
  setDefaultAddress
}; 