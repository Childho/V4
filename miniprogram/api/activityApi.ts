import { apiRequest } from './utils/request';

/**
 * 活动数据项 - 严格按照接口文档定义
 */
export interface ActivityItem {
  id: number;           // 活动唯一ID
  title: string;        // 活动标题
  description: string;  // 活动描述
  coverUrl: string;     // 活动封面图URL
  startTime: string;    // 活动开始时间（简化格式，如"12月18日"）
  endTime: string;      // 活动结束时间（简化格式，如"12月24日"）
  location: string;     // 活动地点
  status: 'ongoing' | 'coming' | 'finished'; // 活动状态：进行中、即将开始、已结束
  isFull: boolean;      // 是否已满员
}

/**
 * 分页信息 - 按照接口文档定义
 */
export interface PaginationInfo {
  page: number;         // 当前页码
  pageSize: number;     // 每页数量
  hasMore: boolean;     // 是否有更多数据
  loading: boolean;     // 加载状态
}

/**
 * 获取活动列表接口响应数据
 */
export interface ActivityListResponse {
  activities: ActivityItem[];     // 活动列表
  pagination: PaginationInfo;     // 分页信息
}

/**
 * 搜索汇总信息
 */
export interface SearchSummary {
  searchKeyword: string;  // 搜索关键词
  totalMatched: number;   // 匹配到的活动总数
  searchTime: number;     // 搜索耗时（毫秒）
}

/**
 * 搜索活动接口响应数据
 */
export interface ActivitySearchResponse {
  activities: ActivityItem[];     // 搜索结果活动列表
  pagination: PaginationInfo;     // 分页信息
  searchSummary: SearchSummary;   // 搜索汇总信息
}

/**
 * 活动状态统计
 */
export interface ActivityStats {
  all: number;       // 全部活动数量
  ongoing: number;   // 进行中活动数量
  coming: number;    // 即将开始活动数量
  finished: number;  // 已结束活动数量
}

/**
 * 活动统计接口响应数据
 */
export interface ActivityStatsResponse {
  stats: ActivityStats;       // 统计数据
  lastUpdated: string;        // 最后更新时间
}

/**
 * 获取活动列表
 * @param params 查询参数
 * @returns 活动列表及分页信息
 */
export function getActivityList(params: {
  page?: number;        // 页码（默认1）
  pageSize?: number;    // 每页数量（默认10）
  status?: 'all' | 'ongoing' | 'coming' | 'finished'; // 活动状态筛选（默认all）
  searchKeyword?: string; // 搜索关键词
} = {}): Promise<ActivityListResponse> {
  // 设置默认值
  const requestParams = {
    page: 1,
    pageSize: 10,
    status: 'all',
    searchKeyword: '',
    ...params
  };
  
  return apiRequest<ActivityListResponse>('/api/activities/list', requestParams, 'GET');
}

/**
 * 搜索活动
 * @param params 搜索参数
 * @returns 搜索结果
 */
export function searchActivities(params: {
  searchKeyword: string;  // 搜索关键词（必填）
  page?: number;          // 页码（默认1，搜索时重置为1）
  pageSize?: number;      // 每页数量（默认10）
  status?: 'all' | 'ongoing' | 'coming' | 'finished'; // 活动状态筛选（默认all）
}): Promise<ActivitySearchResponse> {
  // 设置默认值
  const requestParams = {
    page: 1,
    pageSize: 10,
    status: 'all',
    ...params
  };
  
  return apiRequest<ActivitySearchResponse>('/api/activities/search', requestParams, 'GET');
}

/**
 * 获取活动状态统计
 * @returns 活动状态统计数据
 */
export function getActivityStats(): Promise<ActivityStatsResponse> {
  return apiRequest<ActivityStatsResponse>('/api/activities/stats', {}, 'GET');
}

/**
 * 活动报名
 * @param activityId 活动ID
 * @returns 报名结果
 */
export function signupActivity(activityId: number): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/api/activities/signup', { activityId });
} 