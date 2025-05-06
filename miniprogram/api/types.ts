/**
 * 后端返回的通用接口格式
 */
export interface ApiResponse<T> {
  error: number;   // 0=成功，500=系统异常，401=未登录，其他=业务异常
  body: T;         // 业务数据对象
  message: string; // 错误或提示信息
}

/**
 * 常见错误码枚举
 */
export enum ApiErrorCode {
  SUCCESS = 0,     // 成功
  SYSTEM = 500,    // 系统异常
  UNAUTHORIZED = 401 // 未登录
}

/**
 * 用户登录结果
 */
export interface LoginResult {
  token: string;   // 登录令牌
  userId: number;  // 用户ID
} 