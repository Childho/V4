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
  },
  // 搜索商品接口 - 始终返回商品列表
  '/api/search/products': {
    total: 126, // 总商品数量
    hasMore: true, // 是否还有更多
    list: [
      {
        id: 1,
        title: 'YONEX尤尼克斯羽毛球拍单拍超轻碳纤维进攻型球拍',
        image: 'https://img.alicdn.com/imgextra/i1/2206743762847/O1CN01Zk5XOI1zKjzn9DQPq_!!2206743762847.jpg',
        price: 299,
        originalPrice: 399,
        sales: 1200,
        brand: '尤尼克斯',
        brandId: 8,
        categoryId: 1,
        tags: ['专业', '进攻型'],
        rating: 4.9
      },
      {
        id: 2,
        title: '李宁羽毛球拍碳纤维超轻5U单拍攻守兼备型球拍',
        image: 'https://img.alicdn.com/imgextra/i2/2206743762847/O1CN01rVzFGf1zKjzpqQiNX_!!2206743762847.jpg',
        price: 188,
        originalPrice: 268,
        sales: 850,
        brand: '李宁',
        brandId: 1,
        categoryId: 1,
        tags: ['攻守兼备', '轻便'],
        rating: 4.8
      },
      {
        id: 3,
        title: '威克多VICTOR羽毛球拍专业训练拍',
        image: 'https://img.alicdn.com/imgextra/i3/2206743762847/O1CN01YGzQzZ1zKjzn9DkuE_!!2206743762847.jpg',
        price: 158,
        originalPrice: 228,
        sales: 650,
        brand: '威克多',
        brandId: 2,
        categoryId: 1,
        tags: ['训练专用', '耐用'],
        rating: 4.7
      },
      {
        id: 4,
        title: '李宁羽毛球鞋男女透气防滑专业运动鞋',
        image: 'https://img.alicdn.com/imgextra/i4/2206743762847/O1CN01CdTZGJ1zKjzqJQKXf_!!2206743762847.jpg',
        price: 268,
        originalPrice: 358,
        sales: 920,
        brand: '李宁',
        brandId: 1,
        categoryId: 2,
        tags: ['透气', '防滑'],
        rating: 4.6
      },
      {
        id: 5,
        title: '尤尼克斯YONEX羽毛球服套装吸汗透气',
        image: 'https://img.alicdn.com/imgextra/i1/2206743762847/O1CN01Mnh8qQ1zKjzn9DMkT_!!2206743762847.jpg',
        price: 128,
        originalPrice: 198,
        sales: 760,
        brand: '尤尼克斯',
        brandId: 8,
        categoryId: 3,
        tags: ['吸汗', '透气'],
        rating: 4.5
      },
      {
        id: 6,
        title: '威克多VICTOR羽毛球包单肩背包大容量',
        image: 'https://img.alicdn.com/imgextra/i2/2206743762847/O1CN01nKzP3k1zKjzqJQKXg_!!2206743762847.jpg',
        price: 89,
        originalPrice: 138,
        sales: 450,
        brand: '威克多',
        brandId: 2,
        categoryId: 4,
        tags: ['大容量', '便携'],
        rating: 4.4
      },
      {
        id: 7,
        title: '李宁专业羽毛球比赛用球耐打王',
        image: 'https://img.alicdn.com/imgextra/i3/2206743762847/O1CN01abc123_!!2206743762847.jpg',
        price: 45,
        originalPrice: 68,
        sales: 2100,
        brand: '李宁',
        brandId: 1,
        categoryId: 5,
        tags: ['比赛用球', '耐打'],
        rating: 4.3
      },
      {
        id: 8,
        title: '尤尼克斯护腕护膝运动防护套装',
        image: 'https://img.alicdn.com/imgextra/i4/2206743762847/O1CN01def456_!!2206743762847.jpg',
        price: 78,
        originalPrice: 118,
        sales: 680,
        brand: '尤尼克斯',
        brandId: 8,
        categoryId: 6,
        tags: ['防护', '透气'],
        rating: 4.2
      }
    ]
  },
  // 商品分类接口
  '/api/search/categories': {
    list: [
      { id: 1, name: '羽毛球拍', icon: '🏸' },
      { id: 2, name: '球鞋', icon: '👟' },
      { id: 3, name: '球服', icon: '👕' },
      { id: 4, name: '球包', icon: '🎒' },
      { id: 5, name: '羽毛球', icon: '🏸' },
      { id: 6, name: '运动必备', icon: '⚡' }
    ]
  },
  // 品牌列表接口
  '/api/search/brands': {
    list: [
      { id: 1, name: '李宁' },
      { id: 2, name: '威克多' },
      { id: 3, name: '倍特爱' },
      { id: 4, name: '威肯' },
      { id: 5, name: '超牌' },
      { id: 6, name: '泰昂' },
      { id: 7, name: '翎美' },
      { id: 8, name: '尤尼克斯' },
      { id: 9, name: '亚狮龙' },
      { id: 10, name: 'GOSEN' }
    ]
  },
  // 搜索建议接口
  '/api/search/suggestions': {
    list: [
      '羽毛球拍',
      '李宁球拍',
      '尤尼克斯',
      '威克多',
      '羽毛球鞋',
      '球服套装',
      '羽毛球包',
      '专业球拍'
    ]
  }
}; 