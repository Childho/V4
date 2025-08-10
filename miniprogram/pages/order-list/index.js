// 我的订单页面逻辑
// 导入订单相关API
import { 
  getOrderList, 
  cancelOrder, 
  confirmReceive, 
  urgeShipping, 
  payOrder, 
  deleteOrder, 
  getOrderLogistics 
} from '../../api/orderApi.js';

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
    console.log('[订单页面] onLoad开始，参数:', options);
    
    // 如果有传入默认tab，设置为当前tab
    if (options.tab) {
      const tabIndex = this.data.tabs.findIndex(item => item.id === options.tab);
      if (tabIndex >= 0) {
        console.log('[订单页面] 设置默认tab:', tabIndex);
        this.setData({
          currentTab: tabIndex
        });
      }
    }
    
    console.log('[订单页面] 准备加载订单数据');
    // 加载订单数据
    this.loadOrderList(true);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('[订单页面] onShow');
    // 页面显示时刷新数据，获取最新订单状态
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
    console.log('[加载订单] 开始，reset:', reset, 'loading:', this.data.loading);
    
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
      console.log('[加载订单] 没有更多数据，返回');
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
      
      console.log('[加载订单] 调用API，参数:', params);
      console.log('[加载订单] 当前tab:', currentTab);
      
      // 调用真实API获取订单列表
      const result = await getOrderList(params);
      
      if (result.success && result.body && result.body.orders) {
        const { orders, pagination } = result.body;
        
        console.log('[加载订单] API调用成功，订单数量:', orders.list.length);
        
        let newOrderList;
        if (reset) {
          newOrderList = orders.list;
        } else {
          newOrderList = [...this.data.orderList, ...orders.list];
        }
        
        this.setData({
          orderList: newOrderList,
          hasMore: pagination.hasMore,
          loading: false,
          'pageParams.page': this.data.pageParams.page + 1
        });
        
        console.log('[加载订单] 数据设置完成，总订单数:', newOrderList.length);
        
        // 显示成功提示
        if (reset && newOrderList.length > 0) {
          wx.showToast({
            title: `加载了${newOrderList.length}个订单`,
            icon: 'success',
            duration: 1500
          });
        } else if (reset && newOrderList.length === 0) {
          wx.showToast({
            title: `暂无${currentTab.name}订单`,
            icon: 'none',
            duration: 1500
          });
        }
      } else {
        throw new Error(result.message || '获取订单列表失败');
      }
      
    } catch (error) {
      console.error('[加载订单] API调用失败，使用备用数据:', error);
      
      // API失败时的备用处理
      this.setData({ loading: false });
      
      wx.showModal({
        title: '加载失败',
        content: error.message || '网络异常，请检查网络连接后重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试加载
            this.loadOrderList(reset);
          }
        }
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
      await confirmReceive(orderId);
      
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
      await cancelOrder(orderId, '用户主动取消');
      
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
      await urgeShipping(orderId);
      
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
      await deleteOrder(orderId);
      
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
      wx.showLoading({
        title: '正在获取支付参数...'
      });
      
      // 调用支付接口获取支付参数
      const payResult = await payOrder(orderId, 'wechat');
      
      wx.hideLoading();
      
      if (payResult.success && payResult.body && payResult.body.paymentParams) {
        const { paymentParams } = payResult.body;
        
        console.log('[支付订单] 获取支付参数成功：', paymentParams);
        
        // 调起微信支付
        wx.requestPayment({
          appId: paymentParams.appId,
          timeStamp: paymentParams.timeStamp,
          nonceStr: paymentParams.nonceStr,
          package: paymentParams.package,
          signType: paymentParams.signType,
          paySign: paymentParams.paySign,
          success: (res) => {
            console.log('[支付订单] 支付成功：', res);
            wx.showToast({
              title: '支付成功',
              icon: 'success'
            });
            
            // 刷新订单列表
            setTimeout(() => {
              this.loadOrderList(true);
            }, 1500);
          },
          fail: (err) => {
            console.error('[支付订单] 支付失败：', err);
            
            if (err.errMsg.includes('cancel')) {
              wx.showToast({
                title: '支付已取消',
                icon: 'none'
              });
            } else {
              wx.showToast({
                title: '支付失败，请重试',
                icon: 'none'
              });
            }
          }
        });
      } else {
        throw new Error(payResult.message || '获取支付参数失败');
      }
      
    } catch (error) {
      wx.hideLoading();
      console.error('[支付订单] 失败:', error);
      
      wx.showModal({
        title: '支付失败',
        content: error.message || '支付失败，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试支付
            this.onPayOrder(e);
          }
        }
      });
    }
  },

  /**
   * 查看退款详情
   */
  onRefundDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    
    // 根据订单ID生成退款编号（实际开发中应该从订单数据中获取真实的退款编号）
    const refundNo = `REFUND${orderId.replace('ORDER', '')}`;
    
    wx.navigateTo({
      url: `/pages/refund-detail/refund-detail?orderNo=${orderId}&refundNo=${refundNo}`
    });
  },
}); 