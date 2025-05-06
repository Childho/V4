import { request } from '../utils/request'

// 获取活动列表
export const getActivityList = (data: {
  status?: 'all' | 'ongoing' | 'finished'
  page?: number
  pageSize?: number
}) => {
  return request('/api/activity/list', data)
}

// 获取活动详情
export const getActivityDetail = (data: {
  activityId: string
}) => {
  return request('/api/activity/detail', data)
}

// 报名活动
export const joinActivity = (data: {
  activityId: string
}) => {
  return request('/api/activity/join', data)
} 