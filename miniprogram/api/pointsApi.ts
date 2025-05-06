import { apiRequest } from './utils/request';

/**
 * 积分信息
 */
export interface PointsInfo {
  balance: number;     // 积分余额
  total: number;       // 累计积分
  isSigned: boolean;   // 今日是否已签到
}

/**
 * 获取积分信息
 * @returns 积分信息
 */
export function getPointsInfo(): Promise<PointsInfo> {
  return apiRequest<PointsInfo>('/api/points/info', {});
}

/**
 * 签到结果
 */
export interface SignInResult {
  success: boolean;    // 签到是否成功
  points: number;      // 获得的积分
}

/**
 * 用户签到
 * @returns 签到结果
 */
export function signIn(): Promise<SignInResult> {
  return apiRequest<SignInResult>('/api/points/signIn', {});
}

/**
 * 签到记录
 */
export interface SignInRecord {
  days: number[];      // 本月已签到的天数
  continuousDays: number; // 连续签到天数
}

/**
 * 获取签到记录
 * @returns 签到记录
 */
export function getSignInRecord(): Promise<SignInRecord> {
  return apiRequest<SignInRecord>('/api/points/signInRecord', {});
}

/**
 * 积分记录项
 */
export interface PointsRecord {
  id: number;          // 记录ID
  amount: number;      // 积分数量（正为收入，负为支出）
  description: string; // 描述
  createTime: string;  // 创建时间
  type: 'sign' | 'exchange' | 'task' | 'other'; // 类型：签到、兑换、任务、其他
}

/**
 * 积分记录列表分页结果
 */
export interface PointsRecordListResult {
  list: PointsRecord[]; // 记录列表
  total: number;       // 总数量
  page: number;        // 当前页码
  pageSize: number;    // 每页数量
}

/**
 * 获取积分记录
 * @param params 查询参数
 * @returns 积分记录及分页信息
 */
export function getPointsRecords(params: {
  page?: number;
  pageSize?: number;
  type?: 'sign' | 'exchange' | 'task' | 'other';
} = {}): Promise<PointsRecordListResult> {
  return apiRequest<PointsRecordListResult>('/api/points/records', params);
}

/**
 * 积分兑换
 * @param params 兑换参数
 * @returns 兑换结果
 */
export function exchangePoints(params: {
  goodsId: number;     // 兑换商品ID
  count?: number;      // 兑换数量，默认1
}): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/api/points/exchange', params);
} 