/**
 * 优惠券列表页面逻辑
 * 主要功能：显示用户的优惠券列表、切换不同状态、使用优惠券
 */

// TODO: 实际开发时取消下面的注释，引入真实的API文件
// 引入优惠券相关API
// import { 
//   getCouponList, 
//   useCoupon, 
//   getAvailableCouponCount 
// } from '../../api/couponApi.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前选中的tab标签，0=全部，1=可使用，2=已使用，3=已过期
    currentTab: 1,
    // tab标签配置
    tabs: [
      { id: 0, name: '全部', status: 0 },
      { id: 1, name: '可使用', status: 1 },
      { id: 2, name: '已使用', status: 2 },
      { id: 3, name: '已过期', status: 3 }
    ],
    // 优惠券列表数据
    couponList: [],
    // 加载状态
    loading: false,
    // 是否还有更多数据
    hasMore: true,
    // 当前页码
    currentPage: 1,
    // 每页数据数量
    pageSize: 10,
    // 空状态提示文案
    emptyText: '暂无可用优惠券',
    // 显示使用确认弹窗
    showUseModal: false,
    // 当前要使用的优惠券
    currentCoupon: null,
    // 来源页面
    fromPage: 'personal',
    // 订单金额
    orderAmount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('优惠券页面加载，参数：', options);
    
    // 获取传入参数
    const { from, orderAmount, tab } = options;
    
    // 设置页面数据
    this.setData({
      fromPage: from || 'personal',  // 来源页面
      orderAmount: orderAmount ? parseFloat(orderAmount) : 0  // 订单金额
    });
    
    // 根据来源设置页面标题
    if (from === 'order-confirm') {
      wx.setNavigationBarTitle({
        title: '选择优惠券'
      });
    } else {
      wx.setNavigationBarTitle({
        title: '我的优惠券'
      });
    }
    
    // 获取传入的tab参数，用于直接跳转到指定tab
    if (tab && tab >= 0 && tab <= 3) {
      this.setData({
        currentTab: parseInt(tab)
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   * 每次进入页面都重新加载数据
   */
  onShow() {
    this.loadCouponList();
  },

  /**
   * 页面下拉刷新事件处理函数
   */
  onPullDownRefresh() {
    console.log('下拉刷新优惠券列表');
    this.refreshCouponList();
  },

  /**
   * 页面上拉触底事件处理函数
   */
  onReachBottom() {
    console.log('上拉加载更多优惠券');
    this.loadMoreCoupons();
  },

  /**
   * 切换tab标签
   */
  switchTab(e) {
    const { index } = e.currentTarget.dataset;
    
    if (index === this.data.currentTab) {
      return; // 如果点击的是当前tab，不处理
    }
    
    console.log('切换到tab：', this.data.tabs[index].name);
    
    this.setData({
      currentTab: index,
      couponList: [],      // 清空当前列表
      currentPage: 1,      // 重置页码
      hasMore: true        // 重置加载状态
    });
    
    // 更新空状态提示文案
    this.updateEmptyText();
    
    // 加载新tab的数据
    this.loadCouponList();
  },

  /**
   * 更新空状态提示文案
   */
  updateEmptyText() {
    const { currentTab } = this.data;
    const emptyTexts = [
      '暂无优惠券',
      '暂无可用优惠券',
      '暂无已使用优惠券', 
      '暂无已过期优惠券'
    ];
    
    this.setData({
      emptyText: emptyTexts[currentTab]
    });
  },

  /**
   * 加载优惠券列表
   */
  async loadCouponList() {
    const { currentTab, pageSize } = this.data;
    
    try {
      this.setData({ loading: true });
      
      const params = {
        status: currentTab,    // 根据当前tab查询对应状态的优惠券
        page: 1,              // 重新加载从第一页开始
        pageSize: pageSize
      };
      
      console.log('加载优惠券列表，参数：', params);
      
      // TODO: 实际开发时取消下面的注释，使用真实API
      // const result = await getCouponList(params);
      // console.log('获取到优惠券列表：', result);
      
      // 使用模拟数据（实际开发中替换为 result.list 或 result）
      const mockData = this.getMockCouponData(currentTab);
      console.log('生成的mock数据：', mockData);
      
      this.setData({
        couponList: mockData,           // 实际应该是 result.list 或 result
        hasMore: mockData.length >= pageSize,  // 实际应该根据后端返回的总数判断
        currentPage: 1
      });
      
    } catch (error) {
      console.error('加载优惠券列表失败：', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
      
      // 即使API失败，也尝试使用mock数据作为降级方案
      const mockData = this.getMockCouponData(currentTab);
      this.setData({
        couponList: mockData,
        hasMore: mockData.length >= pageSize,
        currentPage: 1
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 刷新优惠券列表
   */
  async refreshCouponList() {
    await this.loadCouponList();
    wx.stopPullDownRefresh(); // 停止下拉刷新动画
  },

  /**
   * 加载更多优惠券
   */
  async loadMoreCoupons() {
    const { hasMore, loading, currentTab, currentPage, pageSize } = this.data;
    
    if (!hasMore || loading) {
      return; // 没有更多数据或正在加载中，不处理
    }
    
    try {
      this.setData({ loading: true });
      
      const nextPage = currentPage + 1;
      const params = {
        status: currentTab,
        page: nextPage,
        pageSize: pageSize
      };
      
      // TODO: 实际开发时取消下面的注释，使用真实API
      // const result = await getCouponList(params);
      
      // 使用模拟数据（实际开发中替换为 result.list 或 result）
      const mockData = this.getMockCouponData(currentTab, nextPage);
      
      if (mockData.length > 0) {
        this.setData({
          couponList: [...this.data.couponList, ...mockData],
          currentPage: nextPage,
          hasMore: mockData.length >= pageSize
        });
      } else {
        this.setData({
          hasMore: false
        });
      }
      
    } catch (error) {
      console.error('加载更多优惠券失败：', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 选择优惠券（从订单确认页面调用）
   */
  selectCoupon(e) {
    const { index } = e.currentTarget.dataset;
    const coupon = this.data.couponList[index];
    const { fromPage, orderAmount } = this.data;
    
    console.log('选择优惠券：', coupon);
    
    // 如果不是从订单确认页面来的，直接返回
    if (fromPage !== 'order-confirm') {
      return;
    }
    
    // 检查优惠券是否可用
    if (coupon.status !== 1) {
      wx.showToast({
        title: '该优惠券不可用',
        icon: 'none'
      });
      return;
    }
    
    // 检查订单金额是否满足优惠券使用条件
    if (coupon.minAmount > 0 && orderAmount < coupon.minAmount) {
      wx.showToast({
        title: `订单金额需满${coupon.minAmount}元`,
        icon: 'none'
      });
      return;
    }
    
    // 将选中的优惠券保存到本地存储
    wx.setStorageSync('selectedCoupon', coupon);
    
    wx.showToast({
      title: '优惠券选择成功',
      icon: 'success',
      duration: 1500
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  /**
   * 显示使用优惠券确认弹窗
   */
  showUseCouponModal(e) {
    const { index } = e.currentTarget.dataset;
    const coupon = this.data.couponList[index];
    
    console.log('准备使用优惠券：', coupon);
    
    this.setData({
      showUseModal: true,
      currentCoupon: coupon
    });
  },

  /**
   * 隐藏使用优惠券确认弹窗
   */
  hideUseCouponModal() {
    this.setData({
      showUseModal: false,
      currentCoupon: null
    });
  },

  /**
   * 确认使用优惠券
   */
  async confirmUseCoupon() {
    const { currentCoupon } = this.data;
    
    if (!currentCoupon) {
      return;
    }
    
    try {
      wx.showLoading({ title: '使用中...' });
      
      // TODO: 实际开发时取消下面的注释，使用真实API
      // await useCoupon(currentCoupon.id);
      
      // 模拟API调用成功（实际开发中删除这个延时）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      wx.showToast({
        title: '使用成功',
        icon: 'success'
      });
      
      // 隐藏弹窗
      this.hideUseCouponModal();
      
      // 刷新列表
      this.loadCouponList();
      
    } catch (error) {
      console.error('使用优惠券失败：', error);
      wx.showToast({
        title: '使用失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 获取模拟优惠券数据（实际开发中删除）
   * 这个方法模拟了不同状态的优惠券数据，方便前端UI联调
   */
  getMockCouponData(status, page = 1) {
    // 创建完整的模拟数据集，包含各种类型和状态的优惠券
    const allMockData = [
      // ========== 可使用的优惠券 ==========
      {
        id: 101,
        title: '新用户专享大礼包',
        amount: 50,
        minAmount: 99,
        type: 1, // 1=满减券，2=折扣券，3=免邮券
        scope: '全场通用',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 1, // 1=可使用，2=已使用，3=已过期
        useTime: null,
        description: '新用户注册即得，购买任意商品满99元可用',
        discount: 50
      },
      {
        id: 102,
        title: '服装类8折优惠券',
        amount: 80, // 表示8折，80代表80%
        minAmount: 150,
        type: 2,
        scope: '服装鞋帽类',
        startTime: '2024-02-01',
        endTime: '2024-08-31',
        status: 1,
        useTime: null,
        description: '春夏服装大促，满150元享8折优惠',
        discount: 0 // 折扣券的优惠金额需要根据订单金额计算
      },
      {
        id: 103,
        title: '满200减30优惠券',
        amount: 30,
        minAmount: 200,
        type: 1,
        scope: '电子数码产品',
        startTime: '2024-01-15',
        endTime: '2024-07-15',
        status: 1,
        useTime: null,
        description: '购买手机、电脑、平板等数码产品专用',
        discount: 30
      },
      {
        id: 104,
        title: '免邮券',
        amount: 0,
        minAmount: 0,
        type: 3,
        scope: '全场通用',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 1,
        useTime: null,
        description: '任意订单免运费，最高免15元运费',
        discount: 0
      },
      {
        id: 105,
        title: '家具家电9折券',
        amount: 90,
        minAmount: 500,
        type: 2,
        scope: '家具家电类',
        startTime: '2024-03-01',
        endTime: '2024-09-30',
        status: 1,
        useTime: null,
        description: '家装节特惠，购买家具家电满500元享9折',
        discount: 0
      },
      {
        id: 106,
        title: '满500减80元券',
        amount: 80,
        minAmount: 500,
        type: 1,
        scope: '美妆护肤类',
        startTime: '2024-01-01',
        endTime: '2024-06-30',
        status: 1,
        useTime: null,
        description: '美妆护肤品牌联合大促销',
        discount: 80
      },
      {
        id: 107,
        title: '无门槛5元券',
        amount: 5,
        minAmount: 0,
        type: 1,
        scope: '零食饮料类',
        startTime: '2024-02-14',
        endTime: '2024-05-14',
        status: 1,
        useTime: null,
        description: '情人节专享，购买零食饮料无门槛使用',
        discount: 5
      },

      // ========== 已使用的优惠券 ==========
      {
        id: 201,
        title: '满100减15元券',
        amount: 15,
        minAmount: 100,
        type: 1,
        scope: '图书文具类',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 2,
        useTime: '2024-02-15 14:30:25',
        description: '知识就是力量，买书优惠多多',
        discount: 15
      },
      {
        id: 202,
        title: '运动用品8.5折券',
        amount: 85,
        minAmount: 200,
        type: 2,
        scope: '运动户外类',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 2,
        useTime: '2024-01-28 09:15:42',
        description: '健康生活从运动开始',
        discount: 0
      },
      {
        id: 203,
        title: '满300减40元券',
        amount: 40,
        minAmount: 300,
        type: 1,
        scope: '母婴用品类',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 2,
        useTime: '2024-02-08 16:45:18',
        description: '妈妈的爱，宝宝的需要',
        discount: 40
      },
      {
        id: 204,
        title: '免邮券',
        amount: 0,
        minAmount: 0,
        type: 3,
        scope: '全场通用',
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        status: 2,
        useTime: '2024-01-20 11:22:35',
        description: '任意订单免运费',
        discount: 0
      },
      {
        id: 205,
        title: '满88减12元券',
        amount: 12,
        minAmount: 88,
        type: 1,
        scope: '生活用品类',
        startTime: '2024-01-01',
        endTime: '2024-06-30',
        status: 2,
        useTime: '2024-01-25 20:10:15',
        description: '生活必需品，优惠享不停',
        discount: 12
      },

      // ========== 已过期的优惠券 ==========
      {
        id: 301,
        title: '双11狂欢券',
        amount: 100,
        minAmount: 300,
        type: 1,
        scope: '全场通用',
        startTime: '2023-11-01',
        endTime: '2023-11-30', // 已过期
        status: 3,
        useTime: null,
        description: '双11购物狂欢节专享优惠券',
        discount: 100
      },
      {
        id: 302,
        title: '元旦特惠7折券',
        amount: 70,
        minAmount: 200,
        type: 2,
        scope: '服装鞋帽类',
        startTime: '2023-12-28',
        endTime: '2024-01-03', // 已过期
        status: 3,
        useTime: null,
        description: '新年新衣，折扣给力',
        discount: 0
      },
      {
        id: 303,
        title: '满199减25元券',
        amount: 25,
        minAmount: 199,
        type: 1,
        scope: '电子数码产品',
        startTime: '2023-12-01',
        endTime: '2023-12-31', // 已过期
        status: 3,
        useTime: null,
        description: '年末数码产品清仓大促',
        discount: 25
      },
      {
        id: 304,
        title: '周年庆9折券',
        amount: 90,
        minAmount: 500,
        type: 2,
        scope: '家具家电类',
        startTime: '2023-10-01',
        endTime: '2023-10-31', // 已过期
        status: 3,
        useTime: null,
        description: '店庆周年，感恩回馈',
        discount: 0
      },
      {
        id: 305,
        title: '中秋团圆券',
        amount: 30,
        minAmount: 150,
        type: 1,
        scope: '食品生鲜类',
        startTime: '2023-09-15',
        endTime: '2023-09-30', // 已过期
        status: 3,
        useTime: null,
        description: '中秋佳节，团圆有礼',
        discount: 30
      }
    ];

    // 根据选择的tab状态过滤数据
    let filteredData;
    if (status === 0) {
      // status = 0 表示"全部"tab，返回所有优惠券
      filteredData = allMockData;
    } else {
      // 根据具体状态过滤：1=可使用，2=已使用，3=已过期
      filteredData = allMockData.filter(item => item.status === status);
    }

    // 模拟分页逻辑，每页显示10条数据
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // 获取当前页的数据
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    // 如果是第一页，直接返回数据
    if (page === 1) {
      return currentPageData;
    }
    
    // 如果是后续页面，有一定概率返回空数据模拟加载完毕
    if (page > 2 && Math.random() > 0.7) {
      return []; // 70%的概率返回空数据，模拟数据加载完毕
    }
    
    return currentPageData;
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: '我的优惠券',
      path: '/pages/coupon/index'
    };
  }
}); 