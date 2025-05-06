import { api } from './utils/request'

/**
 * 获取活动列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @param {string} [params.category] - 活动分类
 * @returns {Promise<Object>} 活动列表及分页信息
 */
export const getActivityList = (params = {}) => {
  return api.post('/api/activity/list', params)
}

/**
 * 获取活动详情
 * @param {Object} params - 查询参数
 * @param {string} params.id - 活动ID
 * @returns {Promise<Object>} 活动详情信息
 */
export const getActivityDetail = (params) => {
  return api.post('/api/activity/detail', params)
}

/**
 * 活动报名
 * @param {Object} params - 报名参数
 * @param {string} params.activityId - 活动ID
 * @param {Object} [params.userInfo] - 用户信息
 * @returns {Promise<Object>} 报名结果
 */
export const joinActivity = (params) => {
  return api.post('/api/activity/join', params)
} 