// 通用API请求处理函数

// API配置从配置文件获取 - 现在使用正确的JavaScript配置文件
const config = require('../../config/index').config;
const BASE_URL = config.apiBaseUrl;

/**
 * 处理API响应
 * @param {Object} response - 服务器返回的响应体
 * @returns {Object} 处理后的响应数据
 */
const handleResponse = (response) => {
  const { error, body, message } = response;
  
  if (error === 401) {
    // 需要登录
    wx.navigateTo({
      url: '/pages/login/index'
    });
    throw new Error('请先登录');
  }
  
  if (error === 500) {
    // 系统异常
    wx.showToast({
      title: '系统异常，请稍后重试',
      icon: 'none',
      duration: 2000
    });
    throw new Error('系统异常');
  }
  
  if (error !== 0) {
    // 业务异常，直接弹出message内容
    wx.showToast({
      title: message || '操作失败',
      icon: 'none',
      duration: 2000
    });
    throw new Error(message || '操作失败');
  }
  
  // 正常返回
  return body;
};

/**
 * 请求拦截器
 * @param {Object} options - 请求配置
 * @returns {Object} 处理后的请求配置
 */
const requestInterceptor = (options) => {
  const token = wx.getStorageSync('token');
  
  // 确保header存在
  options.header = {
    'content-type': 'application/json',
    ...options.header
  };
  
  // header中必须设置auth
  if (token) {
    options.header.auth = token;
  } else {
    console.warn('Token不存在，可能需要重新登录');
  }
  
  // 请求参数必须是对象，即使为空也需要使用{}
  options.data = options.data || {};
  
  return options;
};

// 模拟数据存储（用于开发测试）
let mockAddressList = [
  {
    id: 1,
    region: '广东省,深圳市,南山区',
    detail: '科技园南区深南大道9988号',
    consignee: '张三',
    mobile: '13812345678',
    isDefault: true
  },
  {
    id: 2,
    region: '广东省,广州市,天河区',
    detail: '珠江新城花城大道85号',
    consignee: '李四',
    mobile: '13987654321',
    isDefault: false
  },
  {
    id: 3,
    region: '北京市,北京市,朝阳区',
    detail: '望京SOHO T3座26层',
    consignee: '王五',
    mobile: '13611112222',
    isDefault: false
  }
];

// 模拟数据，用于开发测试
const mockData = {
  '/api/user/info': {
    avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqUQGIsAY8m4IrSLOXuHnOdWP3Z2FGCkHwcBV4tGGjIpVaPRrv11wZ7iaewxl5P4JCm91hqIHU2ejA/132',
    nickName: '张小燕',
    userId: '10086',
    pointsTotal: 280,
    pointsBalance: 280,
    coupons: 3,
    services: 1
  },
  '/points/info': {
    balance: 280,
    isSigned: true,
    total: 280
  },
  '/points/signIn': {
    success: true,
    points: 5
  },
  '/points/signInRecord': {
    days: [1, 2, 3, 4, 5, 6, 7],
    continuousDays: 7
  },
  '/points/exchange': {
    success: true
  },
  // 地址管理相关mock数据
  '/api/address/list': () => {
    // 返回当前地址列表的副本
    return [...mockAddressList];
  },
  '/api/address/add': (data) => {
    // 模拟添加地址
    const newAddress = {
      id: Date.now(), // 使用时间戳作为ID
      ...data
    };
    
    // 如果设为默认地址，需要将其他地址的默认状态取消
    if (newAddress.isDefault) {
      mockAddressList.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    mockAddressList.push(newAddress);
    return { success: true, id: newAddress.id };
  },
  '/api/address/update': (data) => {
    // 模拟更新地址
    const index = mockAddressList.findIndex(addr => addr.id === data.id);
    if (index !== -1) {
      // 如果设为默认地址，需要将其他地址的默认状态取消
      if (data.isDefault) {
        mockAddressList.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      mockAddressList[index] = { ...mockAddressList[index], ...data };
      return { success: true };
    }
    throw new Error('地址不存在');
  },
  '/api/address/delete': (data) => {
    // 模拟删除地址
    const index = mockAddressList.findIndex(addr => addr.id === data.id);
    if (index !== -1) {
      mockAddressList.splice(index, 1);
      return { success: true };
    }
    throw new Error('地址不存在');
  },
  '/api/address/batchDelete': (data) => {
    // 模拟批量删除地址
    const idsToDelete = data.ids || [];
    mockAddressList = mockAddressList.filter(addr => !idsToDelete.includes(addr.id));
    return { success: true, deletedCount: idsToDelete.length };
  },
  '/api/address/setDefault': (data) => {
    // 模拟设置默认地址
    const targetAddress = mockAddressList.find(addr => addr.id === data.id);
    if (targetAddress) {
      // 取消所有地址的默认状态
      mockAddressList.forEach(addr => {
        addr.isDefault = false;
      });
      // 设置目标地址为默认
      targetAddress.isDefault = true;
      return { success: true };
    }
    throw new Error('地址不存在');
  },
  // 搜索相关mock数据
  '/api/search/products': {
    list: [
      {
        id: 1,
        title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
        image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
        price: 299,
        originalPrice: 399,
        sales: 112
      },
      {
        id: 2,
        title: '威克多胜利羽毛球拍ARS90K单拍进攻型碳纤维',
        image: 'https://img.alicdn.com/imgextra/i3/725677994/O1CN01wKJzpA28vKWmLhcYf_!!725677994.jpg',
        price: 1288,
        originalPrice: 1580,
        sales: 85
      },
      {
        id: 3,
        title: '尤尼克斯YONEX羽毛球鞋男女款专业运动鞋',
        image: 'https://img.alicdn.com/imgextra/i4/1917047079/O1CN01oQDGnt22AEHxZ8u8h_!!1917047079.jpg',
        price: 668,
        originalPrice: 880,
        sales: 203
      },
      {
        id: 4,
        title: '李宁羽毛球服套装男女款速干透气比赛服',
        image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01YLSJc81YWUO1XJ0a4_!!2200848636169.jpg',
        price: 158,
        originalPrice: 228,
        sales: 67
      },
      {
        id: 5,
        title: '威克多胜利羽毛球包双肩背包大容量装备包',
        image: 'https://img.alicdn.com/imgextra/i1/3002554020/O1CN01L0FWnE1K4VHtRf7OY_!!3002554020.jpg',
        price: 198,
        originalPrice: 268,
        sales: 156
      },
      {
        id: 6,
        title: 'GOSEN高神羽毛球12只装比赛级训练球',
        image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01Kh4s1q28vKWfDfCk3_!!725677994.jpg',
        price: 88,
        originalPrice: 128,
        sales: 89
      }
    ],
    hasMore: true,
    total: 156
  },
  '/api/search/categories': [
    { id: 1, name: '羽毛球拍', icon: '🏸' },
    { id: 2, name: '球鞋', icon: '👟' },
    { id: 3, name: '球服', icon: '👕' },
    { id: 4, name: '球包', icon: '🎒' },
    { id: 5, name: '羽毛球', icon: '🏸' },
    { id: 6, name: '运动必备', icon: '⚡' }
  ],
  '/api/search/brands': [
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
  ],
  '/api/search/suggestions': {
    suggestions: ['羽毛球拍', '李宁球拍', '尤尼克斯', '威克多', '球鞋']
  }
};

/**
 * 通用请求函数
 * @param {Object} options - 请求配置
 * @returns {Promise<any>} 响应结果
 */
const request = async (options) => {
  try {
    // 开发环境使用mock数据
    if (config.env === 'development' && mockData[options.url]) {
      console.log('[使用模拟数据]', options.url, options.data);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockResult = mockData[options.url];
      
      // 如果是函数，则调用并传入请求数据
      if (typeof mockResult === 'function') {
        return mockResult(options.data);
      }
      
      return mockResult;
    }
    
    // 应用请求拦截器
    const requestConfig = requestInterceptor(options);
    
    // 发起请求
    const response = await new Promise((resolve, reject) => {
      wx.request({
        ...requestConfig,
        url: `${BASE_URL}${options.url}`,
        method: options.method || 'POST', // 默认使用POST方法
        success: (res) => {
          if (!res.data || typeof res.data.error === 'undefined') {
            reject(new Error('接口返回格式错误'));
            return;
          }
          resolve(res.data);
        },
        fail: (error) => {
          console.error('网络请求失败:', error);
          wx.showToast({
            title: '网络请求失败，请检查网络连接',
            icon: 'none',
            duration: 2000
          });
          reject(error);
        }
      });
    });

    // 处理响应
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * API工具对象，提供常用的请求方法
 */
const api = {
  // 默认都使用POST方法，除非明确要求使用其他方法
  post: (url, data = {}) => request({ url, data }),
  get: (url, data = {}) => request({ url, method: 'GET', data }),
  put: (url, data = {}) => request({ url, method: 'PUT', data }),
  delete: (url, data = {}) => request({ url, method: 'DELETE', data })
};

module.exports = {
  request,
  api
}; 