import { ApiResponse, ApiErrorCode } from '../types';
import { config } from '../../config/index';

const BASE_URL = config.apiBaseUrl;

/**
 * 通用请求函数，符合api.mdc规范
 * @param url 接口地址
 * @param data 请求参数，默认为空对象
 * @param method 请求方法，默认为POST
 * @returns 返回业务数据
 */
export async function apiRequest<T>(
  url: string,
  data: object = {},
  method: 'GET' | 'POST' = 'POST'
): Promise<T> {
  const token = (wx.getStorageSync('token') as string) || '';
  
  // 开发环境模拟数据处理
  if (config.env === 'development' && mockData[url]) {
    console.log('[使用模拟数据]', url);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockData[url] as T;
  }
  
  // 发起请求
  const res = await new Promise<WechatMiniprogram.RequestSuccessCallbackResult<ApiResponse<T>>>((resolve, reject) => {
    wx.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: { auth: token },
      success: (res) => {
        if (!res.data || typeof res.data.error === 'undefined') {
          wx.showToast({
            title: '接口返回格式错误',
            icon: 'none'
          });
          reject(new Error('接口返回格式错误'));
          return;
        }
        resolve(res);
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败，请检查网络连接',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
  
  const { error, body, message } = res.data;
  
  // 错误处理
  switch (error) {
    case ApiErrorCode.SUCCESS:
      return body;
    case ApiErrorCode.SYSTEM:
      wx.showToast({ title: '系统异常', icon: 'none' });
      throw new Error('系统异常');
    case ApiErrorCode.UNAUTHORIZED:
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateTo({ url: '/pages/login/login' });
      throw new Error('未登录');
    default:
      wx.showToast({ title: message, icon: 'none' });
      throw new Error(message);
  }
}

// 导出API对象，提供get和post方法
export const api = {
  get: <T>(url: string, data: object = {}) => apiRequest<T>(url, data, 'GET'),
  post: <T>(url: string, data: object = {}) => apiRequest<T>(url, data, 'POST')
};

// 模拟数据，用于开发测试
const mockData: Record<string, any> = {
  '/api/user/login': {
    token: 'mock-token-12345',
    userId: 10086
  },
  '/api/user/info': {
    avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqUQGIsAY8m4IrSLOXuHnOdWP3Z2FGCkHwcBV4tGGjIpVaPRrv11wZ7iaewxl5P4JCm91hqIHU2ejA/132',
    nickName: '张小燕',
    userId: 10086,
    pointsTotal: 280,
    pointsBalance: 280,
    coupons: 3,
    services: 1
  },
  '/api/points/info': {
    balance: 280,
    isSigned: true,
    total: 280
  },
  '/api/points/signIn': {
    success: true,
    points: 5
  },
  '/api/points/signInRecord': {
    days: [1, 2, 3, 4, 5, 6, 7],
    continuousDays: 7
  }
}; 