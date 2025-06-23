// 物流相关API - 符合@api.mdc规范
// 遵循微信小程序开发规范，按模块划分API文件

import { apiRequest } from './request';

/**
 * 查询物流信息
 * @param {string} orderId - 订单ID
 * @returns {Promise} 物流信息
 */
export function queryLogistics(orderId) {
  return apiRequest('/api/logistics/query', {
    orderId: orderId
  }, 'POST');
}

/**
 * 获取物流公司列表
 * @returns {Promise} 物流公司列表
 */
export function getLogisticsCompanies() {
  return apiRequest('/api/logistics/companies', {}, 'GET');
}

/**
 * 根据物流单号查询轨迹
 * @param {string} trackingNo - 物流单号
 * @param {string} companyCode - 物流公司代码
 * @returns {Promise} 物流轨迹信息
 */
export function trackByNumber(trackingNo, companyCode) {
  return apiRequest('/api/logistics/track', {
    trackingNo: trackingNo,
    companyCode: companyCode
  }, 'POST');
}

/**
 * 获取物流时效预估
 * @param {string} fromCity - 发货城市
 * @param {string} toCity - 目标城市
 * @param {string} companyCode - 物流公司代码
 * @returns {Promise} 时效预估信息
 */
export function getDeliveryTime(fromCity, toCity, companyCode) {
  return apiRequest('/api/logistics/delivery-time', {
    fromCity: fromCity,
    toCity: toCity,
    companyCode: companyCode
  }, 'POST');
} 