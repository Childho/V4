/**
 * 优惠券列表页面逻辑
 * 主要功能：显示用户的优惠券列表、切换不同状态、使用优惠券
 */

// 引入优惠券相关API
import { 
  getCouponList, 
  useCoupon, 
  getAvailableCouponCount 
} from '../../api/couponApi.js';

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
    currentCoupon: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('优惠券页面加载，参数：', options);
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我的优惠券'
    });
    
    // 获取传入的tab参数，用于直接跳转到指定tab
    const { tab } = options;
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
      
      const result = await getCouponList(params);
      console.log('获取到优惠券列表：', result);
      
      // 模拟数据（实际开发中删除这部分）
      const mockData = this.getMockCouponData(currentTab);
      
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
      
      const result = await getCouponList(params);
      
      // 模拟数据（实际开发中删除这部分）
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
      
      // 调用使用优惠券API
      await useCoupon(currentCoupon.id);
      
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
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 获取模拟优惠券数据（实际开发中删除）
   */
  getMockCouponData(status, page = 1) {
    const baseData = [
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
        amount: 12, // 这里表示折扣，88表示8.8折
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
        id: 4,
        title: '满200减50元优惠券',
        amount: 50,
        minAmount: 200,
        type: 1,
        scope: '电子产品',
        startTime: '2024-01-01',
        endTime: '2023-12-31', // 已过期
        status: 3,
        useTime: null,
        description: '购买电子产品满200元可用'
      }
    ];
    
    // 根据状态过滤数据
    let filteredData = baseData;
    if (status > 0) {
      filteredData = baseData.filter(item => item.status === status);
    }
    
    // 模拟分页
    if (page > 1 && Math.random() > 0.5) {
      return []; // 随机返回空数据模拟没有更多
    }
    
    return filteredData;
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