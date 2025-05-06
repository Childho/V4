import { api } from './utils/request'

/**
 * 用户登录接口
 * @param {Object} data - 登录参数
 * @param {string} data.code - 微信登录code
 * @returns {Promise<Object>} 登录结果，包含token和userId
 */
export const login = (data) => {
  return api.post('/api/user/login', data)
}

/**
 * 获取用户信息接口
 * @returns {Promise<Object>} 用户信息对象
 */
export const getUserInfo = () => {
  return api.post('/api/user/info', {})
}

/**
 * 更新用户信息接口
 * @param {Object} data - 用户信息参数
 * @param {string} [data.nickname] - 用户昵称
 * @param {string} [data.avatar] - 用户头像
 * @returns {Promise<Object>} 更新结果
 */
export const updateUserInfo = (data) => {
  return api.post('/api/user/update', data)
} 