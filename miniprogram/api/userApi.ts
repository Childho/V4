// 用户相关API接口 - 基于接口文档personal.md实现
import { apiRequest } from './request';

/**
 * 用户登录接口
 * @param params 登录参数
 * @returns 登录结果，包含token和userId
 */
export interface LoginResult {
  token: string;
  userId: number;
}

export function login(params: {
  code: string;
}): Promise<LoginResult> {
  return apiRequest('/api/user/login', params);
}

/**
 * 获取用户基本信息接口 - 对应接口文档
 * @returns 用户信息对象
 */
export interface UserInfo {
  userInfo: {
    avatarUrl: string;    // 用户头像URL
    nickName: string;     // 用户昵称
    level: string;        // 会员等级
    id: string;           // 用户编号
    pointsBalance: number; // 当前积分余额
  };
  coupons: number;        // 优惠券数量
  services: number;       // 服务数量
}

export function getUserInfo(): Promise<UserInfo> {
  return apiRequest('/api/user/info', {}, 'GET');
}

/**
 * 获取积分信息接口 - 对应接口文档
 * @returns 积分信息对象
 */
export interface PointsInfo {
  balance: number;        // 积分余额
  isSigned: boolean;      // 今日是否已签到
}

export function getPointsInfo(): Promise<PointsInfo> {
  return apiRequest('/api/points/info', {}, 'POST');
}

/**
 * 获取订单统计数据接口 - 对应接口文档
 * @returns 订单统计对象
 */
export interface OrderCounts {
  unpaid: number;         // 待付款订单数
  unshipped: number;      // 待发货订单数
  shipped: number;        // 待收货订单数
  uncommented: number;    // 待评价订单数
  refunding: number;      // 退款/售后订单数
}

export function getOrderCounts(): Promise<OrderCounts> {
  return apiRequest('/api/order/counts', {}, 'POST');
}

/**
 * 用户签到接口 - 对应接口文档
 * @returns 签到结果
 */
export interface SignInResult {
  success: boolean;       // 签到是否成功
  points: number;         // 本次获得积分
}

export function signIn(): Promise<SignInResult> {
  return apiRequest('/api/points/signIn', {}, 'POST');
}

/**
 * 获取每日任务列表接口 - 对应接口文档
 * @returns 每日任务列表
 */
export interface DailyTask {
  id: number;             // 任务ID
  name: string;           // 任务名称
  description: string;    // 任务描述
  icon: string;           // 任务图标标识
  pointsReward: number;   // 奖励积分
  status: number;         // 完成状态（0未完成/1已完成）
  buttonText: string;     // 按钮文字
  completed: boolean;     // 是否已完成
}

export interface DailyTasksResponse {
  dailyTasks: DailyTask[];
}

export function getDailyTasks(): Promise<DailyTasksResponse> {
  return apiRequest('/api/tasks/daily', {}, 'GET');
}

/**
 * 完成分享任务接口 - 对应接口文档
 * @param shareType 分享类型
 * @returns 任务完成结果
 */
export interface ShareTaskResult {
  taskResult: {
    completed: boolean;     // 是否完成
    points: number;         // 获得积分
    totalPoints: number;    // 完成后总积分
    message: string;        // 完成消息
  };
}

export function completeShareTask(shareType: 'friend' | 'timeline'): Promise<ShareTaskResult> {
  return apiRequest('/api/tasks/share/complete', {
    shareType
  }, 'POST');
}

/**
 * 完成邀请任务接口 - 对应接口文档
 * @param invitedUserId 被邀请用户ID
 * @param inviteType 邀请类型
 * @returns 邀请完成结果
 */
export interface InviteTaskResult {
  inviteResult: {
    success: boolean;       // 邀请是否成功
    points: number;         // 获得积分
    totalPoints: number;    // 完成后总积分
    invitedUserName: string; // 被邀请用户昵称
    message: string;        // 邀请结果消息
  };
}

export function completeInviteTask(invitedUserId: number, inviteType: 'register' | 'order'): Promise<InviteTaskResult> {
  return apiRequest('/api/tasks/invite/complete', {
    invitedUserId,
    inviteType
  }, 'POST');
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
  return apiRequest('/api/user/update', data);
} 