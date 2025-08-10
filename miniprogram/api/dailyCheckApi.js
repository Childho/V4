// 每日签到相关API接口 - 基于接口文档dailyCheck.md实现
const { apiRequest } = require('./request');

/**
 * 获取积分信息接口 - 对应接口文档
 * @returns {Promise<Object>} 积分信息数据
 */
function getPointsInfo() {
  return apiRequest('/api/points/info', {}, 'POST');
}

/**
 * 用户每日签到接口 - 对应接口文档
 * @returns {Promise<Object>} 签到结果
 */
function signIn() {
  return apiRequest('/api/points/signIn', {}, 'POST');
}

/**
 * 获取签到记录接口 - 对应接口文档
 * @returns {Promise<Object>} 签到记录数据
 */
function getSignInRecord() {
  return apiRequest('/api/points/signInRecord', {}, 'POST');
}

// 导出所有函数 - 使用CommonJS语法
module.exports = {
  getPointsInfo,
  signIn,
  getSignInRecord
}; 