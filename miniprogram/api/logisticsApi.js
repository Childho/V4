// 物流相关API - 基于接口文档logistics.md实现
// 遵循微信小程序开发规范，按模块划分API文件

const { apiRequest } = require('./request');

/**
 * 查询物流信息 - 对应接口文档
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 物流信息数据
 */
function queryLogistics(orderId) {
  return apiRequest('/api/logistics/query', {
    orderId: orderId
  }, 'POST');
}

/**
 * 获取物流公司列表（扩展功能）
 * @returns {Promise<Object>} 物流公司列表
 */
function getLogisticsCompanies() {
  return apiRequest('/api/logistics/companies', {}, 'GET');
}

/**
 * 根据物流单号查询轨迹（扩展功能）
 * @param {string} trackingNo - 物流单号
 * @param {string} companyCode - 物流公司代码
 * @returns {Promise<Object>} 物流轨迹信息
 */
function trackByNumber(trackingNo, companyCode) {
  return apiRequest('/api/logistics/track', {
    trackingNo: trackingNo,
    companyCode: companyCode
  }, 'POST');
}

/**
 * 获取物流时效预估（扩展功能）
 * @param {string} fromCity - 发货城市
 * @param {string} toCity - 目标城市
 * @param {string} companyCode - 物流公司代码
 * @returns {Promise<Object>} 时效预估信息
 */
function getDeliveryTime(fromCity, toCity, companyCode) {
  return apiRequest('/api/logistics/delivery-time', {
    fromCity: fromCity,
    toCity: toCity,
    companyCode: companyCode
  }, 'POST');
}

// 导出所有函数 - 使用CommonJS语法
module.exports = {
  queryLogistics,
  getLogisticsCompanies,
  trackByNumber,
  getDeliveryTime
}; 