// 我的订单页面逻辑
const { api } = require('../../api/utils/request');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前选中的tab
    currentTab: 0,
    
    // tab列表配置
    tabs: [
      { id: 'all', name: '全部', status: '' },
      { id: 'unpaid', name: '待付款', status: 'unpaid' },
      { id: 'shipped', name: '待发货', status: 'shipped' },
      { id: 'shipping', name: '待收货', status: 'shipping' },
      { id: 'completed', name: '待评价', status: 'completed' },
      { id: 'refunding', name: '退款/售后', status: 'refunding' }
    ],
    
    // 订单列表数据
    orderList: [],
    
    // 加载状态
    loading: false,
    hasMore: true,
    
    // 分页参数
    pageParams: {
      page: 1,
      pageSize: 10
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果有传入默认tab，设置为当前tab
    if (options.tab) {
      const tabIndex = this.data.tabs.findIndex(item => item.id === options.tab);
      if (tabIndex >= 0) {
        this.setData({
          currentTab: tabIndex
        });
      }
    }
    
    // 加载订单数据
    this.loadOrderList(true);
  },

  /**
   * 切换tab
   */
  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentTab: index,
      orderList: [],
      'pageParams.page': 1,
      hasMore: true
    });
    
    // 重新加载数据
    this.loadOrderList(true);
  },

  /**
   * 加载订单列表
   * @param {Boolean} reset 是否重置列表
   */
  async loadOrderList(reset = false) {
    if (this.data.loading) return;
    
    // 如果是重置，清空数据并重置页码
    if (reset) {
      this.setData({
        orderList: [],
        'pageParams.page': 1,
        hasMore: true
      });
    }
    
    // 如果没有更多数据，直接返回
    if (!this.data.hasMore && !reset) {
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const currentTab = this.data.tabs[this.data.currentTab];
      const params = {
        page: this.data.pageParams.page,
        pageSize: this.data.pageParams.pageSize,
        status: currentTab.status
      };
      
      const result = await api.get('/api/order/list', params);
      
      let newOrderList;
      if (reset) {
        newOrderList = result.list;
      } else {
        newOrderList = [...this.data.orderList, ...result.list];
      }
      
      this.setData({
        orderList: newOrderList,
        hasMore: result.hasMore,
        loading: false,
        'pageParams.page': this.data.pageParams.page + 1
      });
      
    } catch (error) {
      console.error('加载订单列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadOrderList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的订单',
      path: '/pages/order-list/index'
    };
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadOrderList(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 点击商品，跳转到商品详情
   */
  onGoodsClick(e) {
    const { goodsId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/productDetail/index?id=${goodsId}`
    });
  },

  /**
   * 查看订单详情
   */
  onOrderDetailClick(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order-detail/index?orderId=${orderId}`
    });
  },

  /**
   * 查看物流信息
   */
  onLogisticsClick(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/logistics/index?orderId=${orderId}`
    });
  },

  /**
   * 确认收货
   */
  async onConfirmReceive(e) {
    const { orderId } = e.currentTarget.dataset;
    
    const confirmResult = await this.showConfirmDialog('确认收货', '确认已收到商品吗？');
    if (!confirmResult) return;
    
    try {
      await api.post('/api/order/confirm-receive', { orderId });
      
      wx.showToast({
        title: '确认收货成功',
        icon: 'success'
      });
      
      // 刷新订单列表
      this.loadOrderList(true);
      
    } catch (error) {
      console.error('确认收货失败:', error);
    }
  },

  /**
   * 取消订单
   */
  async onCancelOrder(e) {
    const { orderId } = e.currentTarget.dataset;
    
    const confirmResult = await this.showConfirmDialog('取消订单', '确定要取消这个订单吗？');
    if (!confirmResult) return;
    
    try {
      await api.post('/api/order/cancel', { 
        orderId,
        reason: '用户主动取消'
      });
      
      wx.showToast({
        title: '订单已取消',
        icon: 'success'
      });
      
      // 刷新订单列表
      this.loadOrderList(true);
      
    } catch (error) {
      console.error('取消订单失败:', error);
    }
  },

  /**
   * 催发货
   */
  async onUrgeShipping(e) {
    const { orderId } = e.currentTarget.dataset;
    
    try {
      await api.post('/api/order/urge-shipping', { orderId });
      
      wx.showToast({
        title: '催发货成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('催发货失败:', error);
    }
  },

  /**
   * 申请退款
   */
  onRequestRefund(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/refund-apply/index?orderId=${orderId}`
    });
  },

  /**
   * 去评价
   */
  onGoEvaluate(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order-evaluate/index?orderId=${orderId}`
    });
  },

  /**
   * 再次购买
   */
  onBuyAgain(e) {
    const { order } = e.currentTarget.dataset;
    // 将商品加入购物车
    const goods = order.goods.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
    
    // 这里可以调用购物车API添加商品，然后跳转到购物车
    wx.navigateTo({
      url: '/pages/cart/index'
    });
  },

  /**
   * 删除订单
   */
  async onDeleteOrder(e) {
    const { orderId } = e.currentTarget.dataset;
    
    const confirmResult = await this.showConfirmDialog('删除订单', '确定要删除这个订单吗？删除后无法恢复。');
    if (!confirmResult) return;
    
    try {
      await api.post('/api/order/delete', { orderId });
      
      wx.showToast({
        title: '订单已删除',
        icon: 'success'
      });
      
      // 刷新订单列表
      this.loadOrderList(true);
      
    } catch (error) {
      console.error('删除订单失败:', error);
    }
  },

  /**
   * 显示确认对话框
   */
  showConfirmDialog(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        success(res) {
          if (res.confirm) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  },

  /**
   * 格式化价格
   */
  formatPrice(price) {
    return (price / 100).toFixed(2);
  },

  /**
   * 获取订单操作按钮
   */
  getOrderActions(order) {
    const actions = [];
    
    switch (order.status) {
      case 'unpaid':
        actions.push(
          { type: 'cancel', text: '取消订单', class: 'cancel' },
          { type: 'pay', text: '立即付款', class: 'primary' }
        );
        break;
      case 'shipped':
        actions.push(
          { type: 'urge', text: '催发货', class: 'default' },
          { type: 'logistics', text: '查看物流', class: 'primary' }
        );
        break;
      case 'shipping':
        actions.push(
          { type: 'logistics', text: '查看物流', class: 'default' },
          { type: 'confirm', text: '确认收货', class: 'primary' }
        );
        break;
      case 'completed':
        actions.push(
          { type: 'buy-again', text: '再次购买', class: 'default' },
          { type: 'evaluate', text: '去评价', class: 'primary' }
        );
        break;
      case 'refunding':
        actions.push(
          { type: 'logistics', text: '查看物流', class: 'default' },
          { type: 'refund-detail', text: '退款详情', class: 'primary' }
        );
        break;
    }
    
    return actions;
  },

  /**
   * 支付订单
   */
  async onPayOrder(e) {
    const { orderId } = e.currentTarget.dataset;
    
    try {
      // 这里应该调用支付接口，先模拟支付成功
      wx.showLoading({
        title: '支付中...'
      });
      
      // 模拟支付延迟
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        });
        
        // 刷新订单列表
        this.loadOrderList(true);
      }, 2000);
      
    } catch (error) {
      wx.hideLoading();
      console.error('支付失败:', error);
    }
  },

  /**
   * 查看退款详情
   */
  onRefundDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/refund-detail/index?orderId=${orderId}`
    });
  },
}); 