import { apiRequest } from './utils/request';
import { LoginResult } from './types';

/**
 * 用户登录接口
 * @param params 登录参数
 * @returns 登录结果，包含token和userId
 */
export function login(params: {
  code: string;
}): Promise<LoginResult> {
  return apiRequest<LoginResult>('/api/user/login', params);
}

/**
 * 获取用户信息接口
 * @returns 用户信息对象
 */
export interface UserInfo {
  avatarUrl: string; // 头像URL
  nickName: string;  // 昵称
  userId: number;    // 用户ID
  pointsTotal: number; // 积分总数
  pointsBalance: number; // 积分余额
  coupons: number;   // 优惠券数量
  services: number;  // 服务数量
}

export function getUserInfo(): Promise<UserInfo> {
  return apiRequest<UserInfo>('/api/user/info', {});
}

/**
 * 更新用户信息接口
 * @param data 用户信息参数
 * @returns 更新结果
 */
export function updateUserInfo(data: {
  nickname?: string;
  avatar?: string;
}): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/api/user/update', data);
} 