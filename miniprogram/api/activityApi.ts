import { apiRequest } from './utils/request';

/**
 * 活动列表项
 */
export interface ActivityItem {
  id: number;       // 活动ID
  title: string;    // 活动标题
  imageUrl: string; // 活动图片URL
  startTime: string; // 开始时间
  endTime: string;  // 结束时间
  location: string; // 活动地点
  status: 'pending' | 'ongoing' | 'ended'; // 活动状态：未开始、进行中、已结束
}

/**
 * 活动列表分页结果
 */
export interface ActivityListResult {
  list: ActivityItem[]; // 活动列表
  total: number;       // 总数量
  page: number;        // 当前页码
  pageSize: number;    // 每页数量
}

/**
 * 获取活动列表
 * @param params 查询参数
 * @returns 活动列表及分页信息
 */
export function getActivityList(params: {
  page?: number;
  pageSize?: number;
  category?: string;
} = {}): Promise<ActivityListResult> {
  return apiRequest<ActivityListResult>('/api/activity/list', params);
}

/**
 * 活动详情
 */
export interface ActivityDetail extends ActivityItem {
  description: string; // 活动详细描述
  participants: number; // 参与人数
  isJoined: boolean;   // 当前用户是否已参加
}

/**
 * 获取活动详情
 * @param id 活动ID
 * @returns 活动详情
 */
export function getActivityDetail(id: number): Promise<ActivityDetail> {
  return apiRequest<ActivityDetail>('/api/activity/detail', { id });
}

/**
 * 参加活动
 * @param id 活动ID
 * @returns 操作结果
 */
export function joinActivity(id: number): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/api/activity/join', { id });
} 