/**
 * 地址管理相关接口
 * 包含地址的增删改查等功能
 */
import { apiRequest } from './utils/request.js';

/**
 * 获取用户地址列表
 * @returns {Promise} 返回地址列表数据
 */
export function getAddressList() {
  return apiRequest('/api/address/list', {}, 'POST');
}

/**
 * 添加新地址
 * @param {Object} addressData 地址信息
 * @param {string} addressData.name 收件人姓名
 * @param {string} addressData.phone 收件人电话
 * @param {string} addressData.province 省份
 * @param {string} addressData.city 城市
 * @param {string} addressData.district 区县
 * @param {string} addressData.detail 详细地址
 * @param {boolean} addressData.isDefault 是否为默认地址
 * @returns {Promise} 返回添加结果
 */
export function addAddress(addressData) {
  return apiRequest('/api/address/add', addressData, 'POST');
}

/**
 * 更新地址信息
 * @param {Object} addressData 地址信息（包含id）
 * @returns {Promise} 返回更新结果
 */
export function updateAddress(addressData) {
  return apiRequest('/api/address/update', addressData, 'POST');
}

/**
 * 删除单个地址
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回删除结果
 */
export function deleteAddress(addressId) {
  return apiRequest('/api/address/delete', { id: addressId }, 'POST');
}

/**
 * 批量删除地址
 * @param {Array} addressIds 地址ID数组
 * @returns {Promise} 返回批量删除结果
 */
export function batchDeleteAddress(addressIds) {
  return apiRequest('/api/address/batchDelete', { ids: addressIds }, 'POST');
}

/**
 * 设置默认地址
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回设置结果
 */
export function setDefaultAddress(addressId) {
  return apiRequest('/api/address/setDefault', { id: addressId }, 'POST');
}

/**
 * 根据ID获取地址详情
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回地址详情
 */
export function getAddressDetail(addressId) {
  return apiRequest('/api/address/detail', { id: addressId }, 'POST');
} 