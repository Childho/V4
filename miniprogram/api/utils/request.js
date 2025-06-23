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
  },
  // 优惠券相关mock数据
  '/api/coupon/list': (data) => {
    // 模拟优惠券数据
    const allCoupons = [
      {
        id: 1,
        title: '满100减20元优惠券',
        amount: 20,
        minAmount: 100,
        type: 1, // 1=满减券，2=折扣券，3=免邮券
        scope: '全场通用',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 1, // 1=可使用，2=已使用，3=已过期
        useTime: null,
        description: '购买任意商品满100元可用'
      },
      {
        id: 2,
        title: '8.8折优惠券',
        amount: 88, // 表示8.8折
        minAmount: 50,
        type: 2,
        scope: '服装类商品',
        startTime: '2024-01-01', 
        endTime: '2024-06-30',
        status: 1,
        useTime: null,
        description: '购买服装类商品满50元可用'
      },
      {
        id: 3,
        title: '满200减50元优惠券',
        amount: 50,
        minAmount: 200,
        type: 1,
        scope: '运动器材',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 1,
        useTime: null,
        description: '购买运动器材满200元可用'
      },
      {
        id: 4,
        title: '免邮券',
        amount: 0,
        minAmount: 0,
        type: 3,
        scope: '全场通用',
        startTime: '2024-01-01',
        endTime: '2024-12-31', 
        status: 2,
        useTime: '2024-01-15 10:30:00',
        description: '任意订单免运费'
      },
      {
        id: 5,
        title: '新人专享券',
        amount: 30,
        minAmount: 99,
        type: 1,
        scope: '全场通用',
        startTime: '2024-01-01',
        endTime: '2024-03-31',
        status: 2,
        useTime: '2024-02-20 15:20:00',
        description: '新用户首次购买专享'
      },
      {
        id: 6,
        title: '满300减80元优惠券',
        amount: 80,
        minAmount: 300,
        type: 1,
        scope: '电子产品',
        startTime: '2024-01-01',
        endTime: '2023-12-31', // 已过期
        status: 3,
        useTime: null,
        description: '购买电子产品满300元可用'
      },
      {
        id: 7,
        title: '9折优惠券',
        amount: 90,
        minAmount: 100,
        type: 2,
        scope: '运动服装',
        startTime: '2024-01-01',
        endTime: '2023-11-30', // 已过期
        status: 3,
        useTime: null,
        description: '购买运动服装满100元可用'
      }
    ];
    
    // 根据状态过滤优惠券
    let filteredCoupons = allCoupons;
    if (data.status > 0) {
      filteredCoupons = allCoupons.filter(coupon => coupon.status === data.status);
    }
    
    // 模拟分页
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      list: filteredCoupons.slice(startIndex, endIndex),
      total: filteredCoupons.length,
      hasMore: endIndex < filteredCoupons.length
    };
  },
  '/api/coupon/use': (data) => {
    // 模拟使用优惠券
    console.log('模拟使用优惠券，ID：', data.couponId);
    return {
      success: true,
      message: '优惠券使用成功'
    };
  },
  '/api/coupon/count': () => {
    // 模拟获取可用优惠券数量
    return {
      availableCount: 3,
      usedCount: 2,
      expiredCount: 2,
      totalCount: 7
    };
  },
  '/api/coupon/receive': (data) => {
    // 模拟领取优惠券
    console.log('模拟领取优惠券，活动ID：', data.activityId, '券ID：', data.couponId);
    return {
      success: true,
      message: '优惠券领取成功',
      couponId: Date.now()
    };
  },
  '/api/coupon/detail': (data) => {
    // 模拟获取优惠券详情
    return {
      id: data.couponId,
      title: '满100减20元优惠券',
      amount: 20,
      minAmount: 100,
      type: 1,
      scope: '全场通用',
      startTime: '2024-01-01',
      endTime: '2024-12-31',
      status: 1,
      description: '购买任意商品满100元可用',
      rules: [
        '每人限领1张',
        '不与其他优惠券同时使用',
        '仅限线上商城使用'
      ]
    };
  },
  // 订单管理相关mock数据
  '/api/order/list': (data) => {
    // 模拟订单数据
    const allOrders = [
      {
        id: 'ORD202401001',
        status: 'unpaid', // unpaid=待付款, shipped=待发货, shipping=待收货, completed=待评价, refunding=退款中
        statusText: '待付款',
        createTime: '2024-01-15 14:30:00',
        payTime: null,
        shipTime: null,
        finishTime: null,
        totalAmount: 458,
        goods: [
          {
            id: 1,
            title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
            spec: '黑红色 / 4U',
            price: 299,
            quantity: 1
          },
          {
            id: 2,
            title: '李宁羽毛球服套装男女款速干透气比赛服',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01YLSJc81YWUO1XJ0a4_!!2200848636169.jpg',
            spec: '蓝色 / L',
            price: 158,
            quantity: 1
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: '等待付款'
        }
      },
      {
        id: 'ORD202401002',
        status: 'shipped',
        statusText: '待发货',
        createTime: '2024-01-14 10:20:00',
        payTime: '2024-01-14 10:25:00',
        shipTime: null,
        finishTime: null,
        totalAmount: 1288,
        goods: [
          {
            id: 3,
            title: '威克多胜利羽毛球拍ARS90K单拍进攻型碳纤维',
            image: 'https://img.alicdn.com/imgextra/i3/725677994/O1CN01wKJzpA28vKWmLhcYf_!!725677994.jpg',
            spec: '红色 / 3U',
            price: 1288,
            quantity: 1
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: '商家正在准备发货'
        }
      },
      {
        id: 'ORD202401003',
        status: 'shipping',
        statusText: '待收货',
        createTime: '2024-01-12 16:45:00',
        payTime: '2024-01-12 16:50:00',
        shipTime: '2024-01-13 09:30:00',
        finishTime: null,
        totalAmount: 866,
        goods: [
          {
            id: 4,
            title: '尤尼克斯YONEX羽毛球鞋男女款专业运动鞋',
            image: 'https://img.alicdn.com/imgextra/i4/1917047079/O1CN01oQDGnt22AEHxZ8u8h_!!1917047079.jpg',
            spec: '白蓝色 / 42',
            price: 668,
            quantity: 1
          },
          {
            id: 5,
            title: '威克多胜利羽毛球包双肩背包大容量装备包',
            image: 'https://img.alicdn.com/imgextra/i1/3002554020/O1CN01L0FWnE1K4VHtRf7OY_!!3002554020.jpg',
            spec: '黑色',
            price: 198,
            quantity: 1
          }
        ],
        logistics: {
          company: '顺丰速运',
          trackingNo: 'SF1234567890',
          status: '运输中，预计明日送达'
        }
      },
      {
        id: 'ORD202401004',
        status: 'completed',
        statusText: '待评价',
        createTime: '2024-01-10 11:15:00',
        payTime: '2024-01-10 11:20:00',
        shipTime: '2024-01-10 15:30:00',
        finishTime: '2024-01-12 14:20:00',
        totalAmount: 88,
        goods: [
          {
            id: 6,
            title: 'GOSEN高神羽毛球12只装比赛级训练球',
            image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01Kh4s1q28vKWfDfCk3_!!725677994.jpg',
            spec: '白色',
            price: 88,
            quantity: 1
          }
        ],
        logistics: {
          company: '圆通速递',
          trackingNo: 'YT9876543210',
          status: '已签收'
        }
      },
      {
        id: 'ORD202401005',
        status: 'refunding',
        statusText: '退款中',
        createTime: '2024-01-08 09:20:00',
        payTime: '2024-01-08 09:25:00',
        shipTime: '2024-01-08 14:30:00',
        finishTime: null,
        totalAmount: 299,
        goods: [
          {
            id: 7,
            title: '李宁羽毛球拍 AYPM442 攻守兼备型',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
            spec: '蓝色 / 5U',
            price: 299,
            quantity: 1
          }
        ],
        logistics: {
          company: '中通快递',
          trackingNo: 'ZTO1357924680',
          status: '退款处理中'
        },
        refund: {
          reason: '商品有质量问题',
          status: '处理中',
          refundAmount: 299,
          applyTime: '2024-01-13 10:30:00'
        }
      }
    ];
    
    // 根据状态过滤订单
    let filteredOrders = allOrders;
    if (data.status && data.status !== 'all') {
      filteredOrders = allOrders.filter(order => order.status === data.status);
    }
    
    // 模拟分页
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      list: filteredOrders.slice(startIndex, endIndex),
      total: filteredOrders.length,
      hasMore: endIndex < filteredOrders.length
    };
  },
  '/api/order/detail': (data) => {
    // 模拟获取订单详情
    const orderId = data.orderId;
    const orders = {
      'ORD202401001': {
        id: 'ORD202401001',
        status: 'unpaid',
        statusText: '待付款',
        createTime: '2024-01-15 14:30:00',
        payTime: null,
        shipTime: null,
        finishTime: null,
        totalAmount: 458,
        discountAmount: 20,
        shippingFee: 10,
        actualAmount: 448,
        goods: [
          {
            id: 1,
            title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
            spec: '黑红色 / 4U',
            price: 299,
            quantity: 1
          },
          {
            id: 2,
            title: '李宁羽毛球服套装男女款速干透气比赛服',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01YLSJc81YWUO1XJ0a4_!!2200848636169.jpg',
            spec: '蓝色 / L',
            price: 158,
            quantity: 1
          }
        ],
        address: {
          consignee: '张三',
          mobile: '13812345678',
          region: '广东省深圳市南山区',
          detail: '科技园南区深南大道9988号'
        },
        logistics: {
          company: '',
          trackingNo: '',
          status: '等待付款',
          tracks: []
        }
      }
    };
    
    const order = orders[orderId];
    if (!order) {
      throw new Error('订单不存在');
    }
    
    return order;
  },
  '/api/order/confirm-receive': (data) => {
    // 模拟确认收货
    console.log('模拟确认收货，订单ID：', data.orderId);
    return { success: true, message: '确认收货成功' };
  },
  '/api/order/cancel': (data) => {
    // 模拟取消订单
    console.log('模拟取消订单，订单ID：', data.orderId, '原因：', data.reason);
    return { success: true, message: '订单取消成功' };
  },
  '/api/order/refund': (data) => {
    // 模拟申请退款
    console.log('模拟申请退款，订单ID：', data.orderId, '原因：', data.reason);
    return { success: true, message: '退款申请提交成功' };
  },
  '/api/order/logistics': (data) => {
    // 模拟获取物流信息
    const logistics = {
      company: '顺丰速运',
      trackingNo: 'SF1234567890',
      status: '运输中',
      tracks: [
        {
          time: '2024-01-13 09:30:00',
          desc: '快件已发出',
          location: '深圳分拨中心'
        },
        {
          time: '2024-01-13 12:45:00',
          desc: '快件运输中',
          location: '广州转运中心'
        },
        {
          time: '2024-01-14 08:20:00',
          desc: '快件到达目的地',
          location: '北京分拨中心'
        },
        {
          time: '2024-01-14 14:30:00',
          desc: '正在派件中',
          location: '北京朝阳区配送点'
        }
      ]
    };
    
    return logistics;
  },
  '/api/order/urge-shipping': (data) => {
    // 模拟催发货
    console.log('模拟催发货，订单ID：', data.orderId);
    return { success: true, message: '催发货成功，商家会尽快处理' };
  },
  '/api/order/evaluate': (data) => {
    // 模拟订单评价
    console.log('模拟订单评价，订单ID：', data.orderId, '评价：', data);
    return { success: true, message: '评价提交成功' };
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