const { request } = require('./utils/request');

/**
 * 用户登录接口
 * @param {object} params 登录参数
 * @param {string} params.code 微信code
 * @returns {Promise} 登录结果，包含token和userId
 */
function login(params) {
  return request({ url: '/api/user/login', data: params });
}

/**
 * 获取用户信息接口
 * @returns {Promise} 用户信息对象
 */
function getUserInfo() {
  return request({ url: '/api/user/info', data: {} });
}

/**
 * 更新用户信息接口
 * @param {object} data 用户信息参数
 * @param {string} data.nickname 昵称
 * @param {string} data.avatar 头像
 * @returns {Promise} 更新结果
 */
function updateUserInfo(data) {
  return request({ url: '/api/user/update', data });
}

module.exports = {
  login,
  getUserInfo,
  updateUserInfo
}; 