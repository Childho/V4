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

  // 商城相关API Mock数据
  '/api/mall/banners': {
    bannerList: [
      {
        id: 1,
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
        link: '/pages/activityDetail/index?id=1'
      },
      {
        id: 2,
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0403ba2fe65?w=800',
        link: '/pages/activityDetail/index?id=2'
      },
      {
        id: 3,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        link: '/pages/productDetail/index?id=10'
      }
    ]
  },

  '/api/mall/seckill': {
    products: [
      {
        id: 1,
        title: 'YONEX尤尼克斯羽毛球拍',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        originalPrice: 899,
        seckillPrice: 599
      },
      {
        id: 2,
        title: 'Victor胜利羽毛球鞋',
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0403ba2fe65?w=400',
        originalPrice: 699,
        seckillPrice: 399
      },
      {
        id: 3,
        title: 'RSL亚狮龙羽毛球',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        originalPrice: 89,
        seckillPrice: 59
      }
    ]
  },

  '/api/mall/product-groups': {
    productGroups: [
      {
        groupId: 'racket',
        groupName: '羽毛球拍',
        groupDesc: '专业球拍，助你提升球技',
        products: [
          {
            id: 101,
            name: 'YONEX尤尼克斯ARC-11羽毛球拍',
            imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
            price: 899,
            salesCount: 268,
            tag: '热销'
          },
          {
            id: 102,
            name: 'Victor胜利挑战者9500羽毛球拍',
            imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0403ba2fe65?w=400',
            price: 599,
            salesCount: 156,
            tag: '新品'
          }
        ]
      },
      {
        groupId: 'shoes',
        groupName: '羽毛球鞋',
        groupDesc: '专业球鞋，稳定支撑每一步',
        products: [
          {
            id: 201,
            name: 'YONEX尤尼克斯POWER CUSHION65Z2羽毛球鞋',
            imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0403ba2fe65?w=400',
            price: 699,
            salesCount: 324,
            tag: '热销'
          },
          {
            id: 202,
            name: 'Victor胜利A922羽毛球鞋',
            imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
            price: 499,
            salesCount: 198,
            tag: ''
          }
        ]
      }
    ]
  },

  '/api/mall/cart/count': {
    cartCount: 3
  },

  '/api/mall/search': (data) => {
    // 模拟搜索功能
    const keyword = data.keyword || '';
    return {
      products: [
        {
          id: 101,
          name: `搜索结果：${keyword} 相关商品1`,
          imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
          price: 899,
          salesCount: 268
        },
        {
          id: 102,
          name: `搜索结果：${keyword} 相关商品2`,
          imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0403ba2fe65?w=400',
          price: 599,
          salesCount: 156
        }
      ]
    };
  },

  // 新的地址接口路径 - 符合接口文档规范
  '/api/user/addresses/list': (data) => {
    // 获取地址列表 - 符合接口文档响应格式
    // 默认地址排在前面
    const sortedAddresses = [...mockAddressList].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
    
    return {
      error: 0,
      body: sortedAddresses.map(addr => ({
        id: addr.id,
        consignee: addr.consignee,
        mobile: addr.mobile,
        region: addr.region,
        detail: addr.detail,
        isDefault: addr.isDefault
      })),
      message: '获取地址列表成功',
      success: true
    };
  },

  '/api/user/addresses/delete': (data) => {
    // 删除单个地址 - 符合接口文档响应格式
    const addressId = data.addressId;
    const index = mockAddressList.findIndex(addr => addr.id === addressId);
    
    if (index !== -1) {
      const deletedAddress = mockAddressList[index];
      mockAddressList.splice(index, 1);
      
      // 如果删除的是默认地址，将第一个地址设为默认
      if (deletedAddress.isDefault && mockAddressList.length > 0) {
        mockAddressList[0].isDefault = true;
      }
      
      return {
        error: 0,
        body: {
          addressId: addressId,
          deleted: true,
          message: '地址删除成功'
        },
        message: '地址删除成功',
        success: true
      };
    } else {
      return {
        error: 404,
        body: null,
        message: '地址不存在',
        success: false
      };
    }
  },

  '/api/user/addresses/batch-delete': (data) => {
    // 批量删除地址 - 符合接口文档响应格式
    const addressIds = data.addressIds || [];
    const deletedIds = [];
    let hasDefaultDeleted = false;
    
    addressIds.forEach(id => {
      const index = mockAddressList.findIndex(addr => addr.id === id);
      if (index !== -1) {
        if (mockAddressList[index].isDefault) {
          hasDefaultDeleted = true;
        }
        mockAddressList.splice(index, 1);
        deletedIds.push(id);
      }
    });
    
    // 如果删除的地址中包含默认地址，将剩余的第一个地址设为默认
    if (hasDefaultDeleted && mockAddressList.length > 0) {
      mockAddressList[0].isDefault = true;
    }
    
    return {
      error: 0,
      body: {
        requestedCount: addressIds.length,
        deletedCount: deletedIds.length,
        deletedIds: deletedIds,
        message: `成功删除${deletedIds.length}个地址`
      },
      message: '批量删除地址成功',
      success: true
    };
  },

  '/api/user/addresses/set-default': (data) => {
    // 设置默认地址 - 符合接口文档响应格式
    const addressId = data.addressId;
    const targetAddress = mockAddressList.find(addr => addr.id === addressId);
    
    if (targetAddress) {
      // 取消所有地址的默认状态
      mockAddressList.forEach(addr => {
        addr.isDefault = false;
      });
      // 设置目标地址为默认
      targetAddress.isDefault = true;
      
      return {
        error: 0,
        body: {
          addressId: addressId,
          setAsDefault: true,
          message: '默认地址设置成功'
        },
        message: '默认地址设置成功',
        success: true
      };
    } else {
      return {
        error: 404,
        body: null,
        message: '地址不存在',
        success: false
      };
    }
  },

  '/api/user/addresses/detail': (data) => {
    // 获取地址详情 - 符合接口文档响应格式
    const addressId = data.addressId;
    const address = mockAddressList.find(addr => addr.id === addressId);
    
    if (address) {
      return {
        error: 0,
        body: {
          address: {
            id: address.id,
            consignee: address.consignee,
            mobile: address.mobile,
            region: address.region,
            detail: address.detail,
            isDefault: address.isDefault
          }
        },
        message: '获取地址详情成功',
        success: true
      };
    } else {
      return {
        error: 404,
        body: null,
        message: '地址不存在',
        success: false
      };
    }
  },

  '/api/user/addresses/add': (data) => {
    // 新增地址 - 符合接口文档响应格式
    const newAddress = {
      id: Date.now(), // 使用时间戳作为ID
      consignee: data.consignee,
      mobile: data.mobile,
      region: data.region,
      detail: data.detail,
      isDefault: data.isDefault || false
    };
    
    // 如果设为默认地址，需要将其他地址的默认状态取消
    if (newAddress.isDefault) {
      mockAddressList.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    mockAddressList.push(newAddress);
    
    return {
      error: 0,
      body: {
        addressId: newAddress.id,
        created: true,
        addressInfo: {
          id: newAddress.id,
          consignee: newAddress.consignee,
          mobile: newAddress.mobile,
          region: newAddress.region,
          detail: newAddress.detail,
          isDefault: newAddress.isDefault
        },
        message: '地址添加成功'
      },
      message: '地址添加成功',
      success: true
    };
  },

  '/api/user/addresses/update': (data) => {
    // 编辑地址 - 符合接口文档响应格式
    const index = mockAddressList.findIndex(addr => addr.id === data.id);
    
    if (index !== -1) {
      // 如果设为默认地址，需要将其他地址的默认状态取消
      if (data.isDefault) {
        mockAddressList.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      // 更新地址信息
      const updatedAddress = {
        ...mockAddressList[index],
        consignee: data.consignee,
        mobile: data.mobile,
        region: data.region,
        detail: data.detail,
        isDefault: data.isDefault
      };
      
      mockAddressList[index] = updatedAddress;
      
      return {
        error: 0,
        body: {
          addressId: updatedAddress.id,
          updated: true,
          addressInfo: {
            id: updatedAddress.id,
            consignee: updatedAddress.consignee,
            mobile: updatedAddress.mobile,
            region: updatedAddress.region,
            detail: updatedAddress.detail,
            isDefault: updatedAddress.isDefault
          },
          message: '地址修改成功'
        },
        message: '地址修改成功',
        success: true
      };
    } else {
      return {
        error: 404,
        body: null,
        message: '地址不存在',
        success: false
      };
    }
  },

  // 活动相关mock数据 - 严格按照接口文档规范
  '/api/activities/list': (data) => {
    // 模拟活动数据 - 完全符合接口文档的ActivityItem结构
    const mockActivities = [
      {
        id: 1,
        title: '门店周年庆活动',
        description: '羽你同行实体店两周年店庆，全场商品8折，会员额外95折，还有精美礼品赠送！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '12月18日',
        endTime: '12月24日',
        location: '倍特爱运动专卖店',
        status: 'ongoing',
        isFull: false
      },
      {
        id: 2,
        title: '每周日BUFF',
        description: '每周日购买指定号码加价15元定制BUFF头巾',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '12月15日',
        endTime: '12月31日',
        location: '倍特爱运动专卖店',
        status: 'ongoing',
        isFull: false
      },
      {
        id: 3,
        title: '2025年新年特训营',
        description: '青少年羽毛球新年特训营，专业教练一对一指导，提升球技好时机',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '1月5日',
        endTime: '2月28日',
        location: '倍特爱运动专卖店',
        status: 'coming',
        isFull: false
      },
      {
        id: 4,
        title: '春季业余联赛',
        description: '第四届春季业余羽毛球联赛报名开始，丰厚奖品等你来拿！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '3月15日',
        endTime: '3月16日',
        location: '倍特爱运动专卖店',
        status: 'coming',
        isFull: false
      },
      {
        id: 5,
        title: '元旦跨年羽毛球赛',
        description: '元旦期间跨年羽毛球友谊赛，与球友一起迎接新年！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '12月31日',
        endTime: '1月1日',
        location: '倍特爱运动专卖店',
        status: 'coming',
        isFull: false
      },
      {
        id: 6,
        title: '五一优惠活动',
        description: '五一期间，全场羽毛球装备8折优惠，买就送专业羽毛球一筒',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '5月1日',
        endTime: '5月5日',
        location: '倍特爱运动专卖店',
        status: 'finished',
        isFull: false
      }
    ];

    // 根据状态筛选
    let filteredActivities = mockActivities;
    if (data.status && data.status !== 'all') {
      filteredActivities = mockActivities.filter(item => item.status === data.status);
    }

    // 根据关键词搜索
    if (data.searchKeyword) {
      const keyword = data.searchKeyword.toLowerCase();
      filteredActivities = filteredActivities.filter(item => 
        item.title.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword)
      );
    }

    // 分页处理
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageActivities = filteredActivities.slice(start, end);

    // 返回符合接口文档的数据结构
    return {
      activities: pageActivities,
      pagination: {
        page: page,
        pageSize: pageSize,
        hasMore: end < filteredActivities.length,
        loading: false
      }
    };
  },

  '/api/activities/search': (data) => {
    // 搜索活动的逻辑与列表相同，但返回格式包含搜索汇总
    const mockActivities = [
      {
        id: 1,
        title: '门店周年庆活动',
        description: '羽你同行实体店两周年店庆，全场商品8折，会员额外95折，还有精美礼品赠送！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '12月18日',
        endTime: '12月24日',
        location: '倍特爱运动专卖店',
        status: 'ongoing',
        isFull: false
      },
      {
        id: 4,
        title: '春季业余联赛',
        description: '第四届春季业余羽毛球联赛报名开始，丰厚奖品等你来拿！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '3月15日',
        endTime: '3月16日',
        location: '倍特爱运动专卖店',
        status: 'coming',
        isFull: false
      },
      {
        id: 5,
        title: '元旦跨年羽毛球赛',
        description: '元旦期间跨年羽毛球友谊赛，与球友一起迎接新年！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '12月31日',
        endTime: '1月1日',
        location: '倍特爱运动专卖店',
        status: 'coming',
        isFull: false
      }
    ];

    const keyword = data.searchKeyword ? data.searchKeyword.toLowerCase() : '';
    let searchResults = mockActivities;
    
    if (keyword) {
      searchResults = mockActivities.filter(item => 
        item.title.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword)
      );
    }

    // 状态筛选
    if (data.status && data.status !== 'all') {
      searchResults = searchResults.filter(item => item.status === data.status);
    }

    // 分页处理
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageActivities = searchResults.slice(start, end);

    // 返回符合接口文档的搜索数据结构
    return {
      activities: pageActivities,
      pagination: {
        page: page,
        pageSize: pageSize,
        hasMore: end < searchResults.length,
        loading: false
      },
      searchSummary: {
        searchKeyword: data.searchKeyword || '',
        totalMatched: searchResults.length,
        searchTime: 800
      }
    };
  },

  '/api/activities/stats': () => {
    // 返回符合接口文档的统计数据结构
    return {
      stats: {
        all: 6,
        ongoing: 2,
        coming: 3,
        finished: 1
      },
      lastUpdated: new Date().toISOString()
    };
  },

  '/api/activities/detail': (data) => {
    // 模拟活动详情数据 - 严格按照接口文档规范
    const mockActivityDetails = {
      '1': {
        id: '1',
        title: '门店周年庆活动',
        description: '羽你同行实体店两周年店庆，全场商品8折，会员额外95折，还有精美礼品赠送！快来参与我们的庆典活动吧！',
        startTime: '2024年12月18日 10:00',
        endTime: '2024年12月24日 18:00',
        location: '倍特爱运动专卖店',
        organizer: '倍特爱运动专卖店',
        content: '<p>🎉 为庆祝倍特爱运动专卖店周年庆，我们特举办盛大庆典活动！</p><p><strong>活动亮点：</strong></p><p>• 全场商品8折优惠</p><p>• 会员额外享受95折</p><p>• 购物满299元送精美礼品</p><p>• 现场抽奖有机会获得专业球拍</p><p><strong>活动地址：</strong>倍特爱运动专卖店</p>',
        rules: '1. 活动期间每天限量100份礼品，先到先得\n2. 会员折扣与商品折扣可叠加使用\n3. 抽奖活动每人每天限参与一次\n4. 活动最终解释权归商家所有',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?w=800',
        isJoined: false
      },
      '2': {
        id: '2',
        title: '每周日BUFF头巾定制',
        description: '每周日购买指定号码加价15元定制BUFF头巾，个性化运动装备等你来！',
        startTime: '每周日 09:00',
        endTime: '每周日 17:00',
        location: '倍特爱运动专卖店',
        organizer: '倍特爱运动专卖店',
        content: '<p>🧢 专业运动头巾定制服务！</p><p><strong>定制说明：</strong></p><p>• 选择喜欢的号码图案</p><p>• 加价仅需15元</p><p>• 材质透气舒适</p><p>• 专业运动设计</p><p>• 一周内制作完成</p>',
        rules: '1. 每周日活动时间内下单有效\n2. 定制商品不支持退换货\n3. 制作周期为5-7个工作日\n4. 数字号码范围：0-99',
        coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        isJoined: true
      },
      '3': {
        id: '3',
        title: '2025年新年特训营',
        description: '青少年羽毛球新年特训营，专业教练一对一指导，提升球技好时机',
        startTime: '2025年1月5日',
        endTime: '2025年2月28日',
        location: '倍特爱运动专卖店',
        organizer: '倍特爱运动专卖店',
        content: '<p>🏆 专业青少年羽毛球特训营开营啦！</p><p><strong>课程特色：</strong></p><p>• 专业教练1对1指导</p><p>• 分级训练，因材施教</p><p>• 全天候训练计划</p><p>• 比赛技巧专项训练</p><p>• 身体素质提升课程</p><p><strong>适合年龄：</strong>8-16岁青少年</p>',
        rules: '1. 需提供健康证明\n2. 训练期间需购买保险\n3. 请穿着专业运动装备\n4. 训练营不提供球拍，需自备\n5. 如遇恶劣天气将调整至室内场地',
        coverUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        isJoined: false
      },
      '4': {
        id: '4',
        title: '春季业余联赛',
        description: '第四届春季业余羽毛球联赛报名开始，丰厚奖品等你来拿！',
        startTime: '2025年3月15日',
        endTime: '2025年3月16日',
        location: '倍特爱运动专卖店',
        organizer: '倍特爱运动专卖店',
        content: '<p>🏆 第四届春季业余羽毛球联赛即将开始！</p><p><strong>比赛信息：</strong></p><p>• 分组竞技，公平比赛</p><p>• 丰厚奖品等你来拿</p><p>• 专业裁判执法</p><p>• 免费提供比赛用球</p><p>• 现场直播精彩瞬间</p>',
        rules: '1. 年满18岁即可报名参加\n2. 需自备球拍和运动装备\n3. 比赛采用三局两胜制\n4. 请提前30分钟到场签到\n5. 如有身体不适请及时告知',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        isJoined: false
      },
      '5': {
        id: '5',
        title: '元旦跨年羽毛球赛',
        description: '元旦期间跨年羽毛球友谊赛，与球友一起迎接新年！',
        startTime: '2024年12月31日',
        endTime: '2025年1月1日',
        location: '倍特爱运动专卖店',
        organizer: '倍特爱运动专卖店',
        content: '<p>🎊 元旦跨年特别活动！</p><p><strong>活动内容：</strong></p><p>• 跨年友谊赛</p><p>• 新年祝福抽奖</p><p>• 免费提供热饮</p><p>• 精美纪念品</p><p>• 合影留念</p>',
        rules: '1. 活动免费参加\n2. 请自备运动装备\n3. 注意保暖防寒\n4. 活动期间禁止吸烟\n5. 请爱护场地设施',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        isJoined: false
      }
    };

    const activityId = data.id;
    const activityDetail = mockActivityDetails[activityId] || mockActivityDetails['1'];
    
    // 返回符合接口文档的数据结构
    return activityDetail;
  },

  '/api/activities/signup': (data) => {
    // 模拟报名操作 - 严格按照接口文档规范
    console.log('模拟活动报名，活动ID:', data.id);
    
    // 模拟各种业务错误场景
    const random = Math.random();
    
    if (random < 0.05) {
      // 5% 概率模拟已报名错误
      throw {
        error: 1003,
        message: '你已报名此活动',
        body: null
      };
    } else if (random < 0.1) {
      // 5% 概率模拟报名已满错误
      throw {
        error: 1001,
        message: '报名人数已满',
        body: null
      };
    } else if (random < 0.15) {
      // 5% 概率模拟报名截止错误
      throw {
        error: 1002,
        message: '报名已截止',
        body: null
      };
    }
    
    // 85% 概率模拟成功
    return {
      signupId: `signup_${Date.now()}`,
      activityId: data.id,
      signupTime: new Date().toISOString(),
      status: 'confirmed',
      message: '报名成功！'
    };
  },

  '/api/activities/cancel-signup': (data) => {
    // 模拟取消报名操作
    console.log('模拟取消报名，活动ID:', data.eventId, '报名ID:', data.signupId);
    
    return {
      eventId: data.eventId,
      signupId: data.signupId,
      cancelTime: new Date().toISOString(),
      refundAmount: 0,
      message: '取消报名成功'
    };
  },

  '/api/activities/my-signups': (data) => {
    // 模拟用户报名记录
    const mockSignups = [
      {
        signupId: 'signup_123456',
        activityId: '1',
        activityTitle: '门店周年庆活动',
        activityCoverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?w=400',
        activityStartTime: '2024年12月18日 10:00',
        activityEndTime: '2024年12月24日 18:00',
        activityLocation: '倍特爱运动专卖店',
        signupTime: '2024-12-18T14:30:00Z',
        status: 'confirmed',
        isJoined: true
      },
      {
        signupId: 'signup_234567',
        activityId: '2',
        activityTitle: '每周日BUFF头巾定制',
        activityCoverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        activityStartTime: '每周日 09:00',
        activityEndTime: '每周日 17:00',
        activityLocation: '倍特爱运动专卖店',
        signupTime: '2024-12-15T10:20:00Z',
        status: 'completed',
        isJoined: true
      }
    ];

    // 状态筛选
    let filteredSignups = mockSignups;
    if (data.status && data.status !== 'all') {
      filteredSignups = mockSignups.filter(item => item.status === data.status);
    }

    // 分页处理
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageSignups = filteredSignups.slice(start, end);

    return {
      signups: pageSignups,
      pagination: {
        page: page,
        pageSize: pageSize,
        total: filteredSignups.length,
        totalPages: Math.ceil(filteredSignups.length / pageSize),
        hasMore: end < filteredSignups.length
      }
    };
  },

  // 服务页面相关mock数据 - 严格按照接口文档规范
  '/api/strings/list': (data) => {
    // 模拟线材品牌和线材数据 - 完全符合接口文档
    const mockBrands = [
      { id: 'all', name: '全部' },
      { id: 'yonex', name: 'YONEX' },
      { id: 'victor', name: 'VICTOR' },
      { id: 'li_ning', name: '李宁' },
      { id: 'gosen', name: 'GOSEN' }
    ];

    const mockStrings = [
      { 
        id: 'BG65', 
        name: 'BG-65', 
        brand: 'yonex',
        description: '经典耐用，适合初学者',
        price: 35 
      },
      { 
        id: 'BG80', 
        name: 'BG-80 Power', 
        brand: 'yonex',
        description: '高弹性，进攻型选手首选',
        price: 45 
      },
      { 
        id: 'VBS63', 
        name: 'VBS-63', 
        brand: 'victor',
        description: '控制性佳，防守型球员推荐',
        price: 38 
      },
      { 
        id: 'LN_NO7', 
        name: 'No.7线', 
        brand: 'li_ning',
        description: '均衡型线材，适合各类打法',
        price: 32 
      },
      { 
        id: 'GOSEN_G_TONE', 
        name: 'G-TONE 9', 
        brand: 'gosen',
        description: '日本进口专业线材，手感佳',
        price: 48 
      },
      { 
        id: 'GOSEN_PRO', 
        name: 'Pro 88', 
        brand: 'gosen',
        description: '专业比赛级线材，控制精准',
        price: 55 
      }
    ];

    // 根据品牌筛选
    let filteredStrings = mockStrings;
    if (data.brand && data.brand !== 'all') {
      filteredStrings = mockStrings.filter(item => item.brand === data.brand);
    }

    return {
      brands: mockBrands,
      strings: filteredStrings
    };
  },

  '/api/string-service/create': (data) => {
    // 模拟穿线订单创建 - 严格按照接口文档规范
    console.log('模拟创建穿线订单:', data);

    // 模拟业务错误场景
    const random = Math.random();
    
    if (random < 0.05) {
      // 5% 概率模拟未登录错误
      throw {
        error: 401,
        message: '请先登录',
        body: null
      };
    } else if (random < 0.1) {
      // 5% 概率模拟参数错误
      throw {
        error: 400,
        message: '参数错误，请检查订单信息',
        body: null
      };
    }

    // 查找线材信息
    const stringInfo = {
      'BG65': { name: 'BG-65', price: 35 },
      'BG80': { name: 'BG-80 Power', price: 45 },
      'VBS63': { name: 'VBS-63', price: 38 },
      'LN_NO7': { name: 'No.7线', price: 32 },
      'GOSEN_G_TONE': { name: 'G-TONE 9', price: 48 },
      'GOSEN_PRO': { name: 'Pro 88', price: 55 }
    }[data.string_id] || { name: '未知线材', price: 30 };

    // 90% 概率模拟成功
    return {
      orderId: `string_${Date.now()}`,
      orderNo: `STR${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
      racket_brand: data.racket_brand,
      pounds: data.pounds,
      string_name: stringInfo.name,
      total_price: stringInfo.price,
      status: 'pending',
      status_text: '待接单',
      estimated_time: '2-3个工作日',
      create_time: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    };
  },

  '/api/points/exchange-info': (data) => {
    // 模拟积分兑换信息 - 严格按照接口文档规范
    console.log('模拟获取积分兑换信息');

    return {
      user_points: 2580,
      goods: [
        {
          id: 101,
          name: '羽毛球拍',
          img: '/assets/images/racket.jpg',
          points: 2200,
          stock: 5
        },
        {
          id: 102,
          name: '专业羽毛球鞋',
          img: '/assets/images/shoes.jpg',
          points: 1800,
          stock: 3
        },
        {
          id: 103,
          name: '手胶套装',
          img: '/assets/images/grip.jpg',
          points: 300,
          stock: 10
        }
      ],
      recent_exchanges: [
        {
          goods_name: '专业羽毛球鞋',
          points: 1800,
          date: '2024-06-01'
        },
        {
          goods_name: '手胶套装',
          points: 300,
          date: '2024-05-28'
        }
      ]
    };
  },

  '/api/points/exchange': (data) => {
    // 模拟积分商品兑换
    console.log('模拟积分兑换:', data);

    // 模拟业务错误场景
    const random = Math.random();
    
    if (random < 0.1) {
      // 10% 概率模拟积分不足
      throw {
        error: 1001,
        message: '积分不足',
        body: null
      };
    } else if (random < 0.15) {
      // 5% 概率模拟库存不足
      throw {
        error: 1002,
        message: '商品库存不足',
        body: null
      };
    }

    return {
      exchangeId: `ex_${Date.now()}`,
      goodsId: data.goodsId,
      points: data.points,
      exchangeTime: new Date().toISOString(),
      status: 'success',
      message: '兑换成功'
    };
  },

  '/api/promotion/info': (data) => {
    // 模拟推广返佣信息 - 严格按照接口文档规范
    console.log('模拟获取推广返佣信息');

    return {
      total_earnings: 158,
      invited_users: 6,
      this_month_earnings: 45,
      today_earnings: 8,
      account_balance: 245,
      invite_code: 'PROMO001',
      invite_link: 'https://miniprogram.com/invite?code=PROMO001',
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://miniprogram.com/invite?code=PROMO001',
      commission_records: [
        {
          desc: '邀请好友注册奖励',
          amount: 20,
          date: '2024-06-08',
          status: '已到账',
          type: 'invite'
        },
        {
          desc: '好友消费返佣',
          amount: 15,
          date: '2024-06-07',
          status: '已到账',
          type: 'commission'
        },
        {
          desc: '邀请好友注册奖励',
          amount: 20,
          date: '2024-06-05',
          status: '已到账',
          type: 'invite'
        },
        {
          desc: '好友消费返佣',
          amount: 8,
          date: '2024-06-03',
          status: '已到账',
          type: 'commission'
        }
      ],
      withdraw_records: [
        {
          amount: 100,
          date: '2024-06-01',
          status: '已到账',
          order_no: 'WD202406010001'
        },
        {
          amount: 50,
          date: '2024-05-25',
          status: '已到账',
          order_no: 'WD202405250001'
        }
      ]
    };
  },

  '/api/promotion/withdraw': (data) => {
    // 模拟提现申请
    console.log('模拟提现申请:', data);

    // 模拟业务错误场景
    const random = Math.random();
    
    if (random < 0.05) {
      // 5% 概率模拟余额不足
      throw {
        error: 1001,
        message: '账户余额不足',
        body: null
      };
    } else if (random < 0.1) {
      // 5% 概率模拟提现金额不符合要求
      throw {
        error: 1002,
        message: '提现金额不符合要求',
        body: null
      };
    }

    return {
      withdrawId: `wd_${Date.now()}`,
      amount: data.amount,
      orderNo: `WD${new Date().getTime()}`,
      applyTime: new Date().toISOString(),
      status: 'processing',
      message: '提现申请已提交，预计1-3个工作日到账'
    };
  },

  '/api/user/service-records': (data) => {
    // 模拟我的服务记录 - 严格按照接口文档规范
    console.log('模拟获取服务记录:', data);

    const mockServiceRecords = [
      {
        service_type: '穿线进度',
        racket: 'YONEX BG-65',
        status: '穿线中',
        progress: 60,
        detail: '主线24磅，横线23磅，预计6月10日完成'
      },
      {
        service_type: '奖品物流',
        goods: '专业手胶套装',
        logistics: [
          { desc: '已发货', time: '2024-06-06 15:00' },
          { desc: '运输中', time: '2024-06-06 18:00' },
          { desc: '派送中', time: '2024-06-07 09:00' }
        ],
        express_number: 'SF1234567890'
      },
      {
        service_type: '返佣记录',
        amount: 20,
        desc: '邀请好友下单奖励',
        date: '2024-06-02',
        status: '已到账'
      },
      {
        service_type: '穿线进度',
        racket: 'VICTOR VBS-63',
        status: '已完成',
        progress: 100,
        detail: '主线26磅，横线25磅，已完成待取'
      }
    ];

    // 根据类型筛选
    let filteredRecords = mockServiceRecords;
    if (data.type && data.type !== 'all') {
      filteredRecords = mockServiceRecords.filter(item => item.service_type === data.type);
    }

    // 分页处理
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageRecords = filteredRecords.slice(start, end);

    // 直接返回数组，符合接口文档中body字段是array的定义
    return pageRecords;
  },

  // 购物车相关mock数据 - 严格按照接口文档规范
  '/api/cart/list': (data) => {
    // 模拟购物车商品列表 - 完全符合接口文档
    console.log('模拟获取购物车列表');

    return {
      cartList: [
        {
          id: 1,
          name: 'YONEX尤尼克斯ARC-11羽毛球拍',
          spec: '颜色：蓝色 重量：4U',
          price: 899.00,
          quantity: 1,
          image: '/assets/images/racket1.jpg',
          selected: true,
          specGroups: [
            {
              name: '颜色',
              options: [
                { value: '蓝色', selected: true, disabled: false },
                { value: '红色', selected: false, disabled: false },
                { value: '黑色', selected: false, disabled: false }
              ]
            },
            {
              name: '重量',
              options: [
                { value: '3U', selected: false, disabled: false },
                { value: '4U', selected: true, disabled: false },
                { value: '5U', selected: false, disabled: false }
              ]
            }
          ]
        },
        {
          id: 2,
          name: 'VICTOR胜利JS-12羽毛球',
          spec: '速度：77 包装：12只装',
          price: 65.00,
          quantity: 2,
          image: '/assets/images/shuttlecock1.jpg',
          selected: false,
          specGroups: [
            {
              name: '速度',
              options: [
                { value: '76', selected: false, disabled: false },
                { value: '77', selected: true, disabled: false },
                { value: '78', selected: false, disabled: false }
              ]
            },
            {
              name: '包装',
              options: [
                { value: '12只装', selected: true, disabled: false },
                { value: '25只装', selected: false, disabled: false }
              ]
            }
          ]
        },
        {
          id: 3,
          name: 'LI-NING李宁专业手胶',
          spec: '颜色：白色 厚度：标准',
          price: 25.00,
          quantity: 3,
          image: '/assets/images/grip1.jpg',
          selected: true,
          specGroups: [
            {
              name: '颜色',
              options: [
                { value: '白色', selected: true, disabled: false },
                { value: '黑色', selected: false, disabled: false },
                { value: '蓝色', selected: false, disabled: false }
              ]
            },
            {
              name: '厚度',
              options: [
                { value: '标准', selected: true, disabled: false },
                { value: '加厚', selected: false, disabled: false }
              ]
            }
          ]
        }
      ]
    };
  },

  '/api/cart/add': (data) => {
    // 模拟添加商品到购物车 - 严格按照接口文档规范
    console.log('模拟添加商品到购物车:', data);

    // 模拟业务错误场景
    const random = Math.random();
    
    if (random < 0.05) {
      // 5% 概率模拟未登录错误
      throw {
        error: 401,
        message: '请先登录',
        body: null
      };
    } else if (random < 0.1) {
      // 5% 概率模拟商品库存不足
      throw {
        error: 1001,
        message: '商品库存不足',
        body: null
      };
    }

    // 90% 概率模拟成功
    return {
      cartId: Math.floor(Math.random() * 1000) + 100,
      action: Math.random() > 0.7 ? 'updated' : 'added',
      newQuantity: data.quantity,
      cartCount: Math.floor(Math.random() * 10) + 1
    };
  },

  '/api/cart/update-quantity': (data) => {
    // 模拟修改购物车商品数量 - 严格按照接口文档规范
    console.log('模拟修改购物车数量:', data);

    // 模拟业务错误场景
    const random = Math.random();
    
    if (random < 0.05) {
      // 5% 概率模拟数量超出库存
      throw {
        error: 1002,
        message: '商品数量超出库存',
        body: null
      };
    }

    return {
      cartId: data.cartId,
      newQuantity: data.quantity,
      newSubtotal: data.quantity * 899.00,
      cartSummary: {
        totalItems: 5,
        selectedItems: 3,
        totalAmount: data.quantity * 899.00 + 200.00
      }
    };
  },

  '/api/cart/update-specs': (data) => {
    // 模拟修改购物车商品规格 - 严格按照接口文档规范
    console.log('模拟修改购物车规格:', data);

    const specsText = Object.entries(data.newSpecs).map(([key, value]) => `${key}：${value}`).join(' ');

    return {
      cartId: data.cartId,
      action: Math.random() > 0.5 ? 'updated' : 'merged',
      newSpec: specsText,
      merged: Math.random() > 0.7,
      cartSummary: {
        totalItems: 5,
        selectedItems: 3,
        totalAmount: 2697.00
      }
    };
  },

  '/api/cart/toggle-select': (data) => {
    // 模拟切换购物车商品选择状态 - 严格按照接口文档规范
    console.log('模拟切换选择状态:', data);

    return {
      updatedItems: data.selectAll ? [1, 2, 3] : (data.cartIds || []),
      cartSummary: {
        totalItems: 3,
        selectedItems: data.selected ? (data.selectAll ? 3 : 1) : 0,
        totalAmount: data.selected ? (data.selectAll ? 1989.00 : 899.00) : 0.00,
        originalAmount: data.selected ? (data.selectAll ? 2189.00 : 999.00) : 0.00,
        discountAmount: data.selected ? (data.selectAll ? 200.00 : 100.00) : 0.00,
        allSelected: data.selectAll && data.selected
      }
    };
  },

  '/api/cart/remove': (data) => {
    // 模拟删除购物车商品 - 严格按照接口文档规范
    console.log('模拟删除购物车商品:', data);

    return {
      deletedItems: data.cartIds,
      deletedCount: data.cartIds.length,
      cartSummary: {
        totalItems: Math.max(0, 3 - data.cartIds.length),
        selectedItems: Math.max(0, 2 - data.cartIds.length),
        totalAmount: Math.max(0, 1989.00 - (data.cartIds.length * 300))
      }
    };
  },

  '/api/cart/checkout-prepare': (data) => {
    // 模拟购物车结算准备 - 严格按照接口文档规范
    console.log('模拟购物车结算准备:', data);

    return {
      checkoutItems: [
        {
          cartId: 1,
          productId: 'product_101',
          name: 'YONEX尤尼克斯ARC-11羽毛球拍',
          image: '/assets/images/racket1.jpg',
          spec: '颜色：蓝色 重量：4U',
          price: 899.00,
          quantity: 1,
          subtotal: 899.00,
          shippingFee: 15.00
        },
        {
          cartId: 3,
          productId: 'product_103',
          name: 'LI-NING李宁专业手胶',
          image: '/assets/images/grip1.jpg',
          spec: '颜色：白色 厚度：标准',
          price: 25.00,
          quantity: 3,
          subtotal: 75.00,
          shippingFee: 0.00
        }
      ],
      defaultAddress: {
        addressId: 'addr_001',
        recipientName: '张三',
        phone: '138****5678',
        region: '广东省 深圳市 南山区',
        detailAddress: '科技园南区深圳软件园'
      },
      availableCoupons: [
        {
          couponId: 'coupon_001',
          name: '满200减30优惠券',
          discountType: 'amount',
          discountValue: 30.00,
          minAmount: 200.00,
          validUntil: '2024-12-31T23:59:59Z'
        },
        {
          couponId: 'coupon_002',
          name: '全场9折优惠券',
          discountType: 'percent',
          discountValue: 0.9,
          minAmount: 100.00,
          validUntil: '2024-12-31T23:59:59Z'
        }
      ],
      priceDetail: {
        itemsTotal: 974.00,
        shippingTotal: 15.00,
        discountTotal: 0.00,
        finalTotal: 989.00
      }
    };
  },

  '/api/cart/clear': (data) => {
    // 模拟清空购物车 - 严格按照接口文档规范
    console.log('模拟清空购物车');

    return {
      clearedCount: 3
    };
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
      expiredCount: 2
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
      // ========== 待付款订单 (unpaid) ==========
      {
        id: 'ORDER001',
        createTime: '2024-01-15 14:30:00',
        status: 'unpaid',
        statusText: '待付款',
        totalAmount: 486.00,
        goods: [
          {
            id: 1,
            title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
            spec: '颜色:炫酷黑 重量:4U',
            price: 299.00,
            quantity: 1
          },
          {
            id: 6,
            title: 'GOSEN高神羽毛球12只装比赛级训练球',
            image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01Kh4s1q28vKWfDfCk3_!!725677994.jpg',
            spec: '颜色:白色 速度:77',
            price: 88.00,
            quantity: 2
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: ''
        }
      },
      {
        id: 'ORDER006',
        createTime: '2024-01-10 11:20:00',
        status: 'unpaid',
        statusText: '待付款',
        totalAmount: 356.00,
        goods: [
          {
            id: 4,
            title: '李宁羽毛球服套装男女款速干透气比赛服',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01YLSJc81YWUO1XJ0a4_!!2200848636169.jpg',
            spec: '颜色:红黑配色 尺码:XL',
            price: 158.00,
            quantity: 1
          },
          {
            id: 5,
            title: '威克多胜利羽毛球包双肩背包大容量装备包',
            image: 'https://img.alicdn.com/imgextra/i1/3002554020/O1CN01L0FWnE1K4VHtRf7OY_!!3002554020.jpg',
            spec: '颜色:蓝色款',
            price: 198.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: ''
        }
      },
      {
        id: 'ORDER007',
        createTime: '2024-01-09 16:45:00',
        status: 'unpaid',
        statusText: '待付款',
        totalAmount: 668.00,
        goods: [
          {
            id: 3,
            title: '尤尼克斯YONEX羽毛球鞋男女款专业运动鞋',
            image: 'https://img.alicdn.com/imgextra/i4/1917047079/O1CN01oQDGnt22AEHxZ8u8h_!!1917047079.jpg',
            spec: '颜色:白蓝配色 尺码:40',
            price: 668.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: ''
        }
      },

      // ========== 待发货订单 (shipped) ==========
      {
        id: 'ORDER002',
        createTime: '2024-01-14 16:20:00',
        status: 'shipped',
        statusText: '待发货',
        totalAmount: 1288.00,
        goods: [
          {
            id: 2,
            title: '威克多胜利羽毛球拍ARS90K单拍进攻型碳纤维',
            image: 'https://img.alicdn.com/imgextra/i3/725677994/O1CN01wKJzpA28vKWmLhcYf_!!725677994.jpg',
            spec: '颜色:经典红 重量:3U',
            price: 1288.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: ''
        }
      },
      {
        id: 'ORDER008',
        createTime: '2024-01-13 09:15:00',
        status: 'shipped',
        statusText: '待发货',
        totalAmount: 176.00,
        goods: [
          {
            id: 6,
            title: 'GOSEN高神羽毛球12只装比赛级训练球',
            image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01Kh4s1q28vKWfDfCk3_!!725677994.jpg',
            spec: '颜色:黄色 速度:76',
            price: 88.00,
            quantity: 2
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: ''
        }
      },
      {
        id: 'ORDER009',
        createTime: '2024-01-12 14:30:00',
        status: 'shipped',
        statusText: '待发货',
        totalAmount: 457.00,
        goods: [
          {
            id: 1,
            title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
            spec: '颜色:银蓝配色 重量:5U',
            price: 299.00,
            quantity: 1
          },
          {
            id: 4,
            title: '李宁羽毛球服套装男女款速干透气比赛服',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01YLSJc81YWUO1XJ0a4_!!2200848636169.jpg',
            spec: '颜色:白黑配色 尺码:M',
            price: 158.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '',
          trackingNo: '',
          status: ''
        }
      },

      // ========== 待收货订单 (shipping) ==========
      {
        id: 'ORDER003',
        createTime: '2024-01-13 10:15:00',
        status: 'shipping',
        statusText: '待收货',
        totalAmount: 866.00,
        goods: [
          {
            id: 3,
            title: '尤尼克斯YONEX羽毛球鞋男女款专业运动鞋',
            image: 'https://img.alicdn.com/imgextra/i4/1917047079/O1CN01oQDGnt22AEHxZ8u8h_!!1917047079.jpg',
            spec: '颜色:白蓝配色 尺码:42',
            price: 668.00,
            quantity: 1
          },
          {
            id: 5,
            title: '威克多胜利羽毛球包双肩背包大容量装备包',
            image: 'https://img.alicdn.com/imgextra/i1/3002554020/O1CN01L0FWnE1K4VHtRf7OY_!!3002554020.jpg',
            spec: '颜色:黑红配色',
            price: 198.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '圆通快递',
          trackingNo: 'YTO888123456789',
          status: '运输中'
        }
      },
      {
        id: 'ORDER010',
        createTime: '2024-01-11 15:20:00',
        status: 'shipping',
        statusText: '待收货',
        totalAmount: 1288.00,
        goods: [
          {
            id: 2,
            title: '威克多胜利羽毛球拍ARS90K单拍进攻型碳纤维',
            image: 'https://img.alicdn.com/imgextra/i3/725677994/O1CN01wKJzpA28vKWmLhcYf_!!725677994.jpg',
            spec: '颜色:黑金配色 重量:4U',
            price: 1288.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '顺丰快递',
          trackingNo: 'SF9999888777666',
          status: '派件中'
        }
      },
      {
        id: 'ORDER011',
        createTime: '2024-01-10 08:30:00',
        status: 'shipping',
        statusText: '待收货',
        totalAmount: 356.00,
        goods: [
          {
            id: 4,
            title: '李宁羽毛球服套装男女款速干透气比赛服',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01YLSJc81YWUO1XJ0a4_!!2200848636169.jpg',
            spec: '颜色:深蓝配色 尺码:L',
            price: 158.00,
            quantity: 1
          },
          {
            id: 5,
            title: '威克多胜利羽毛球包双肩背包大容量装备包',
            image: 'https://img.alicdn.com/imgextra/i1/3002554020/O1CN01L0FWnE1K4VHtRf7OY_!!3002554020.jpg',
            spec: '颜色:全黑款',
            price: 198.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '中通快递',
          trackingNo: 'ZTO555444333222',
          status: '运输中'
        }
      },

      // ========== 待评价订单 (completed) ==========
      {
        id: 'ORDER004',
        createTime: '2024-01-12 09:30:00',
        status: 'completed',
        statusText: '待评价',
        totalAmount: 158.00,
        goods: [
          {
            id: 4,
            title: '李宁羽毛球服套装男女款速干透气比赛服',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01YLSJc81YWUO1XJ0a4_!!2200848636169.jpg',
            spec: '颜色:蓝白配色 尺码:L',
            price: 158.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '顺丰快递',
          trackingNo: 'SF1234567890123',
          status: '已签收'
        }
      },
      {
        id: 'ORDER012',
        createTime: '2024-01-08 14:20:00',
        status: 'completed',
        statusText: '待评价',
        totalAmount: 668.00,
        goods: [
          {
            id: 3,
            title: '尤尼克斯YONEX羽毛球鞋男女款专业运动鞋',
            image: 'https://img.alicdn.com/imgextra/i4/1917047079/O1CN01oQDGnt22AEHxZ8u8h_!!1917047079.jpg',
            spec: '颜色:全白款 尺码:41',
            price: 668.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '申通快递',
          trackingNo: 'STO7777888999000',
          status: '已签收'
        }
      },
      {
        id: 'ORDER013',
        createTime: '2024-01-07 10:45:00',
        status: 'completed',
        statusText: '待评价',
        totalAmount: 387.00,
        goods: [
          {
            id: 1,
            title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
            spec: '颜色:炫酷黑 重量:4U',
            price: 299.00,
            quantity: 1
          },
          {
            id: 6,
            title: 'GOSEN高神羽毛球12只装比赛级训练球',
            image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01Kh4s1q28vKWfDfCk3_!!725677994.jpg',
            spec: '颜色:白色 速度:77',
            price: 88.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '韵达快递',
          trackingNo: 'YD3333222111000',
          status: '已签收'
        }
      },
      // 新增待评价订单 - 高端护腕护膝套装
      {
        id: 'ORDER016',
        createTime: '2024-01-04 16:15:00',
        status: 'completed',
        statusText: '待评价',
        totalAmount: 189.00,
        goods: [
          {
            id: 7,
            title: 'LP护腕护膝套装运动防护用品羽毛球专用',
            image: 'https://img.alicdn.com/imgextra/i3/2208137867776/O1CN01OHIXuD1Qj8rGEP1aX_!!2208137867776.jpg',
            spec: '颜色:黑色 尺码:均码',
            price: 89.00,
            quantity: 1
          },
          {
            id: 8,
            title: '专业羽毛球拍线高弹性比赛用线耐磨',
            image: 'https://img.alicdn.com/imgextra/i1/1917047079/O1CN01y2Xw2122AEI6wQlYt_!!1917047079.jpg',
            spec: '颜色:白色 磅数:22-28磅',
            price: 45.00,
            quantity: 2
          },
          {
            id: 9,
            title: 'KAWASAKI川崎羽毛球握把胶防滑吸汗手胶',
            image: 'https://img.alicdn.com/imgextra/i2/725677994/O1CN01bCWgPx28vKY8fRdNt_!!725677994.jpg',
            spec: '颜色:白色 厚度:1.8mm',
            price: 25.00,
            quantity: 2
          }
        ],
        logistics: {
          company: '百世快递',
          trackingNo: 'BT9999888777666',
          status: '已签收'
        }
      },
      // 新增待评价订单 - 训练器材组合
      {
        id: 'ORDER017',
        createTime: '2024-01-03 11:30:00',
        status: 'completed',
        statusText: '待评价',
        totalAmount: 268.00,
        goods: [
          {
            id: 10,
            title: '羽毛球发球机自动发球器训练神器',
            image: 'https://img.alicdn.com/imgextra/i4/2200848636169/O1CN01VjQNjm1YWUO6Qp2Nn_!!2200848636169.jpg',
            spec: '颜色:蓝色 电池容量:2000mAh',
            price: 188.00,
            quantity: 1
          },
          {
            id: 11,
            title: '羽毛球训练用弹力带力量练习器',
            image: 'https://img.alicdn.com/imgextra/i3/3002554020/O1CN01mNqiEQ1K4VHzwP8xY_!!3002554020.jpg',
            spec: '颜色:红色 阻力等级:中等',
            price: 80.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '德邦快递',
          trackingNo: 'DBK8888777666555',
          status: '已签收'
        }
      },
      // 新增待评价订单 - 多商品组合
      {
        id: 'ORDER018',
        createTime: '2024-01-02 13:45:00',
        status: 'completed',
        statusText: '待评价',
        totalAmount: 599.00,
        goods: [
          {
            id: 12,
            title: 'VICTOR胜利羽毛球拍双拍套装情侣款',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01WqP4mJ1H8QBsRtYhm_!!2200756107659.jpg',
            spec: '颜色:红蓝配色 重量:4U',
            price: 399.00,
            quantity: 1
          },
          {
            id: 13,
            title: '高端羽毛球比赛服男女款透气短袖',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01PqK8mN1YWUO8FgP2n_!!2200848636169.jpg',
            spec: '颜色:白红配色 尺码:M',
            price: 89.00,
            quantity: 1
          },
          {
            id: 14,
            title: '专业比赛级羽毛球12只装耐打王',
            image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01qWe4mK28vKY9fQlNt_!!725677994.jpg',
            spec: '颜色:白色 速度:76',
            price: 111.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '京东快递',
          trackingNo: 'JDV00012345678',
          status: '已签收'
        }
      },

      // ========== 退款/售后订单 (refunding) ==========
      {
        id: 'ORDER005',
        createTime: '2024-01-11 15:45:00',
        status: 'refunding',
        statusText: '退款中',
        totalAmount: 299.00,
        goods: [
          {
            id: 1,
            title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
            image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
            spec: '颜色:炫酷黑 重量:4U',
            price: 299.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '韵达快递',
          trackingNo: 'YD1234567890456',
          status: '退货中'
        },
        refundInfo: {
          reason: '商品质量问题',
          refundAmount: 299.00,
          refundStatus: '退货中，等待商家收货',
          applyTime: '2024-01-11 16:00:00'
        }
      },
      {
        id: 'ORDER014',
        createTime: '2024-01-06 13:20:00',
        status: 'refunding',
        statusText: '退款中',
        totalAmount: 668.00,
        goods: [
          {
            id: 3,
            title: '尤尼克斯YONEX羽毛球鞋男女款专业运动鞋',
            image: 'https://img.alicdn.com/imgextra/i4/1917047079/O1CN01oQDGnt22AEHxZ8u8h_!!1917047079.jpg',
            spec: '颜色:红白配色 尺码:43',
            price: 668.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '圆通快递',
          trackingNo: 'YTO1111000999888',
          status: '退款处理中'
        },
        refundInfo: {
          reason: '尺码不合适',
          refundAmount: 668.00,
          refundStatus: '审核通过，预计3-7个工作日到账',
          applyTime: '2024-01-06 14:00:00'
        }
      },
      {
        id: 'ORDER015',
        createTime: '2024-01-05 11:15:00',
        status: 'refunding',
        statusText: '退款中',
        totalAmount: 396.00,
        goods: [
          {
            id: 5,
            title: '威克多胜利羽毛球包双肩背包大容量装备包',
            image: 'https://img.alicdn.com/imgextra/i1/3002554020/O1CN01L0FWnE1K4VHtRf7OY_!!3002554020.jpg',
            spec: '颜色:红黑配色',
            price: 198.00,
            quantity: 2
          }
        ],
        logistics: {
          company: '中通快递',
          trackingNo: 'ZTO4444333222111',
          status: '售后处理中'
        },
        refundInfo: {
          reason: '不喜欢',
          refundAmount: 396.00,
          refundStatus: '售后处理中，客服已联系',
          applyTime: '2024-01-05 12:00:00'
        }
      },
      // 新增退款订单 - 羽毛球拍套装退款
      {
        id: 'ORDER019',
        createTime: '2024-01-01 14:20:00',
        status: 'refunding',
        statusText: '退款中',
        totalAmount: 588.00,
        goods: [
          {
            id: 15,
            title: 'KAWASAKI川崎羽毛球拍碳纤维超轻专业拍',
            image: 'https://img.alicdn.com/imgextra/i2/2200756107659/O1CN01TpQ4mJ1H8QBvRtZhm_!!2200756107659.jpg',
            spec: '颜色:荧光绿 重量:5U',
            price: 399.00,
            quantity: 1
          },
          {
            id: 16,
            title: '专业羽毛球拍袋单拍套方形保护套',
            image: 'https://img.alicdn.com/imgextra/i3/3002554020/O1CN01pKqiEQ1K4VH2wP9xY_!!3002554020.jpg',
            spec: '颜色:黑色 材质:防水尼龙',
            price: 39.00,
            quantity: 1
          },
          {
            id: 17,
            title: '高品质羽毛球穿线服务专业调磅',
            image: 'https://img.alicdn.com/imgextra/i1/1917047079/O1CN01c2Xw2122AEI8wQmYt_!!1917047079.jpg',
            spec: '线型:BG65 磅数:24磅',
            price: 150.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '顺丰快递',
          trackingNo: 'SF9999888777123',
          status: '退货已寄出'
        },
        refundInfo: {
          reason: '拍子重量不符合描述',
          refundAmount: 588.00,
          refundStatus: '退货已寄出，等待商家确认收货',
          applyTime: '2024-01-01 15:30:00'
        }
      },
      // 新增退款订单 - 运动护具问题
      {
        id: 'ORDER020',
        createTime: '2023-12-30 09:45:00',
        status: 'refunding',
        statusText: '售后中',
        totalAmount: 156.00,
        goods: [
          {
            id: 18,
            title: 'MIZUNO美津浓运动护踝专业防护',
            image: 'https://img.alicdn.com/imgextra/i3/2208137867776/O1CN01qHIXuD1Qj8rHEP2aX_!!2208137867776.jpg',
            spec: '颜色:黑色 尺码:L',
            price: 78.00,
            quantity: 2
          }
        ],
        logistics: {
          company: '申通快递',
          trackingNo: 'STO5555444333222',
          status: '售后协商中'
        },
        refundInfo: {
          reason: '商品破损',
          refundAmount: 156.00,
          refundStatus: '客服正在协商解决方案',
          applyTime: '2023-12-30 10:15:00'
        }
      },
      // 新增退款订单 - 多商品组合退款
      {
        id: 'ORDER021',
        createTime: '2023-12-28 16:30:00',
        status: 'refunding',
        statusText: '退款中',
        totalAmount: 445.00,
        goods: [
          {
            id: 19,
            title: 'RSL亚狮龙羽毛球比赛级12只装',
            image: 'https://img.alicdn.com/imgextra/i4/725677994/O1CN01zWe4mK28vKY2fQrNt_!!725677994.jpg',
            spec: '颜色:白色 速度:77',
            price: 99.00,
            quantity: 3
          },
          {
            id: 20,
            title: '专业级羽毛球计分牌便携式记分器',
            image: 'https://img.alicdn.com/imgextra/i2/2200848636169/O1CN01ZqK8mN1YWUO3FgQ2n_!!2200848636169.jpg',
            spec: '颜色:白色 材质:塑料',
            price: 49.00,
            quantity: 1
          },
          {
            id: 21,
            title: '羽毛球场地画线专用胶带比赛标准',
            image: 'https://img.alicdn.com/imgextra/i1/3002554020/O1CN01mOqiEQ1K4VH5wP6xY_!!3002554020.jpg',
            spec: '颜色:白色 宽度:5cm',
            price: 99.00,
            quantity: 1
          }
        ],
        logistics: {
          company: '邮政EMS',
          trackingNo: 'EMS1234567890000',
          status: '退款审核中'
        },
        refundInfo: {
          reason: '发错货了',
          refundAmount: 445.00,
          refundStatus: '退款申请审核中，请耐心等待',
          applyTime: '2023-12-28 17:00:00'
        }
      }
    ];
    
    // 根据状态过滤订单
    let filteredOrders = allOrders;
    if (data.status && data.status !== '') {
      filteredOrders = allOrders.filter(order => order.status === data.status);
    }
    
    console.log('[订单筛选]', '请求状态:', data.status, '筛选后订单数量:', filteredOrders.length);
    
    // 模拟分页
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const resultData = {
      list: filteredOrders.slice(startIndex, endIndex),
      total: filteredOrders.length,
      hasMore: endIndex < filteredOrders.length
    };
    
    console.log('[订单分页结果]', '页码:', page, '每页数量:', pageSize, '返回订单数:', resultData.list.length, '是否有更多:', resultData.hasMore);
    
    return resultData;
  },
  '/api/order/detail': (data) => {
    // 模拟获取订单详情（这里可以根据orderId返回对应的详情）
    return {
      id: data.orderId || 'ORDER001',
      createTime: '2024-01-15 14:30:00',
      status: 'unpaid',
      statusText: '待付款',
      totalAmount: 486.00,
      goods: [
        {
          id: 1,
          title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
          image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
          spec: '颜色:炫酷黑 重量:4U',
          price: 299.00,
          quantity: 1
        }
      ],
      address: {
        consignee: '张三',
        mobile: '138****5678',
        region: '广东省,深圳市,南山区',
        detail: '科技园南区深南大道9988号'
      },
      logistics: {
        company: '',
        trackingNo: '',
        status: ''
      }
    };
  },
  '/api/order/cancel': (data) => {
    console.log('模拟取消订单，订单ID：', data.orderId);
    return { success: true, message: '订单取消成功' };
  },
  '/api/order/confirm-receive': (data) => {
    console.log('模拟确认收货，订单ID：', data.orderId);
    return { success: true, message: '确认收货成功' };
  },
  '/api/order/urge-shipping': (data) => {
    console.log('模拟催发货，订单ID：', data.orderId);
    return { success: true, message: '催发货成功，商家会尽快发货' };
  }
};

/**
 * 通用请求函数
 * @param {Object} options - 请求配置
 * @returns {Promise<any>} 响应结果
 */
const request = async (options) => {
  try {
    console.log('[API请求]', options.url, options.data);
    console.log('[环境配置]', config.env);
    
    // 根据配置决定是否使用mock数据
    if (config.enableMock && mockData[options.url]) {
      console.log('🎭 [使用模拟数据]', options.url, options.data);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResult = mockData[options.url];
      
      // 如果是函数，则调用并传入请求数据
      if (typeof mockResult === 'function') {
        const result = mockResult(options.data);
        console.log('🎭 [模拟数据返回]', result);
        return result;
      }
      
      console.log('🎭 [模拟数据返回]', mockResult);
      return mockResult;
    }
    
    console.log('🌐 [发起真实API请求]', options.url, '配置enableMock:', config.enableMock);
    
    // 应用请求拦截器
    const requestConfig = requestInterceptor(options);
    
    const fullUrl = `${BASE_URL}${options.url}`;
    const method = options.method || 'POST';
    
    console.log('🚀 [发起网络请求]', {
      url: fullUrl,
      method: method,
      data: requestConfig.data,
      header: requestConfig.header
    });
    
    // 发起请求
    const response = await new Promise((resolve, reject) => {
      wx.request({
        ...requestConfig,
        url: fullUrl,
        method: method,
        success: (res) => {
          console.log('✅ [网络请求成功]', {
            statusCode: res.statusCode,
            data: res.data
          });
          
          if (!res.data || typeof res.data.error === 'undefined') {
            console.error('❌ [接口返回格式错误]', res.data);
            reject(new Error('接口返回格式错误'));
            return;
          }
          resolve(res.data);
        },
        fail: (error) => {
          console.error('❌ [网络请求失败]', error);
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
    console.error('[API请求失败]', error);
    throw error;
  }
};

/**
 * API请求函数 - 兼容现有代码
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {string} method - 请求方法
 * @returns {Promise<any>} 响应结果
 */
const apiRequest = async (url, data = {}, method = 'POST') => {
  return request({ url, data, method });
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
  api,
  apiRequest
};