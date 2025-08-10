/**
 * 优惠券列表页面逻辑 - 基于接口文档实现真实API调用
 * 主要功能：显示用户的优惠券列表、切换不同状态、使用优惠券
 */

// 引入优惠券相关API - 基于接口文档实现
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
    // 当前选中的tab标签，0=全部，1=可使用，2=即将过期（原来的已过期tab修改）
    currentTab: 1,
    // tab标签配置 - 去除已使用tab，将已过期改为即将过期
    tabs: [
      { id: 0, name: '全部', status: 0 },
      { id: 1, name: '可使用', status: 1 },
      { id: 2, name: '即将过期', status: 4 } // 状态4表示即将过期，原来的已过期状态3改为即将过期状态4
    ],
    // 优惠券列表数据 - 对应接口文档 couponList
    couponList: [],
    // 分页信息 - 对应接口文档返回结构
    currentPage: 1,      // 当前页码
    pageSize: 10,        // 每页数量
    hasMore: true,       // 是否还有更多数据
    // 加载状态
    loading: false,
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
    if (tab && tab >= 0 && tab <= 4) {
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
      '暂无即将过期优惠券' // 修改提示文案
    ];
    
    this.setData({
      emptyText: emptyTexts[currentTab]
    });
  },

  /**
   * 加载优惠券列表
   */
  async loadCouponList() {
    const { currentTab, pageSize, tabs } = this.data;
    
    try {
      this.setData({ loading: true });
      
      // 获取当前tab对应的状态值
      const currentTabStatus = tabs[currentTab].status;
      
      console.log('加载优惠券列表，参数：');
      console.log('- status:', currentTabStatus);
      console.log('- page: 1');
      console.log('- pageSize:', pageSize);
      console.log('当前tab索引:', currentTab, '对应的status:', currentTabStatus);
      
      // 调用真实API - 完全按照接口文档参数
      const response = await getCouponList(currentTabStatus, 1, pageSize);
      console.log('获取到优惠券列表：', response);
      
      // 处理API返回数据 - 按照接口文档字段结构
      const couponListData = this.safeCouponList(response.couponList || []);
      
      this.setData({
        couponList: couponListData,               // 对应接口文档 couponList
        currentPage: response.currentPage || 1,   // 对应接口文档 currentPage
        pageSize: response.pageSize || pageSize,  // 对应接口文档 pageSize
        hasMore: response.hasMore || false       // 对应接口文档 hasMore
      });
      
    } catch (error) {
      console.error('加载优惠券列表失败：', error);
      
      // API失败时的错误处理，使用默认值避免页面报错
      this.setData({
        couponList: [],
        currentPage: 1,
        hasMore: false
      });
      
      // 根据错误类型显示不同提示
      if (error.message === '未登录') {
        // 已在apiRequest中处理跳转
      } else {
        wx.showToast({
          title: error.message || '加载失败，请重试',
          icon: 'none'
        });
      }
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
    const { hasMore, loading, currentTab, currentPage, pageSize, tabs } = this.data;
    
    if (!hasMore || loading) {
      return; // 没有更多数据或正在加载中，不处理
    }
    
    try {
      this.setData({ loading: true });
      
      // 获取当前tab对应的状态值
      const currentTabStatus = tabs[currentTab].status;
      const nextPage = currentPage + 1;
      
      console.log('加载更多优惠券，参数：');
      console.log('- status:', currentTabStatus);
      console.log('- page:', nextPage);
      console.log('- pageSize:', pageSize);
      
      // 调用真实API - 加载更多数据
      const response = await getCouponList(currentTabStatus, nextPage, pageSize);
      console.log('获取到更多优惠券：', response);
      
      // 处理API返回数据
      const newCouponListData = this.safeCouponList(response.couponList || []);
      
      if (newCouponListData.length > 0) {
        // 合并新数据到现有列表
        const updatedList = [...this.data.couponList, ...newCouponListData];
        
        this.setData({
          couponList: updatedList,
          currentPage: response.currentPage || nextPage,
          hasMore: response.hasMore || false
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
    
    // 检查优惠券是否可用（可使用状态=1 或 即将过期状态=4 都可以选择）
    if (coupon.status !== 1 && coupon.status !== 4) {
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
    
    // 即将过期的优惠券显示特殊提示
    if (coupon.status === 4) {
      wx.showToast({
        title: '即将过期优惠券选择成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '优惠券选择成功',
        icon: 'success',
        duration: 1500
      });
    }
    
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
   * 确认使用优惠券 - 基于接口文档实现
   */
  async confirmUseCoupon() {
    const { currentCoupon } = this.data;
    
    if (!currentCoupon) {
      return;
    }
    
    // 检查用户登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
    
    try {
      wx.showLoading({ title: '使用中...' });
      
      // 调用真实API - 按照接口文档参数
      const response = await useCoupon(currentCoupon.id);
      console.log('[Use Coupon Success]', response);
      
      wx.hideLoading();
      
      // 根据接口文档返回的跳转信息处理
      if (response.useResult && response.useResult.success) {
        const { jumpInfo, message } = response.useResult;
        
        wx.showToast({
          title: '使用成功',
          icon: 'success',
          duration: 1500
        });
        
        // 隐藏弹窗
        this.hideUseCouponModal();
        
        // 根据返回的跳转信息进行页面跳转
        setTimeout(() => {
          if (jumpInfo.type === 'mall') {
            wx.switchTab({
              url: jumpInfo.url
            });
          } else if (jumpInfo.type === 'product' && jumpInfo.productId) {
            wx.navigateTo({
              url: `${jumpInfo.url}?productId=${jumpInfo.productId}`
            });
          } else {
            // 默认跳转到商城
            wx.switchTab({
              url: '/pages/mall/index'
            });
          }
        }, 1500);
        
      } else {
        // 刷新列表
        this.loadCouponList();
      }
      
    } catch (error) {
      wx.hideLoading();
      console.error('使用优惠券失败：', error);
      
      // 根据错误类型显示不同提示
      if (error.message === '未登录') {
        // 已在apiRequest中处理跳转
      } else {
        wx.showToast({
          title: error.message || '使用失败，请重试',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 安全处理优惠券列表 - 确保每张优惠券的字段完整性
   */
  safeCouponList(couponList) {
    if (!Array.isArray(couponList)) return [];
    
    return couponList.map(coupon => ({
      id: coupon.id || 0,
      title: coupon.title || '优惠券',
      amount: parseFloat(coupon.amount) || 0,
      minAmount: parseFloat(coupon.minAmount) || 0,
      type: parseInt(coupon.type) || 1, // 1满减券/2折扣券/3免邮券
      scope: coupon.scope || '全场通用',
      startTime: coupon.startTime || '',
      endTime: coupon.endTime || '',
      status: parseInt(coupon.status) || 1, // 1可使用/4即将过期
      useTime: coupon.useTime || null,
      description: coupon.description || '',
      discount: parseFloat(coupon.discount) || 0
    }));
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