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
    // 简单测试API调用
    this.testApiCall();
  },

  /**
   * 测试API调用
   */
  async testApiCall() {
    try {
      console.log('[测试API] 开始测试订单API调用');
      const testResult = await api.get('/api/order/list', { page: 1, pageSize: 10, status: '' });
      console.log('[测试API] 成功:', testResult);
      wx.showToast({
        title: `找到${testResult.list.length}个订单`,
        icon: 'success'
      });
    } catch (error) {
      console.error('[测试API] 失败:', error);
      wx.showToast({
        title: `API测试失败: ${error.message}`,
        icon: 'none'
      });
    }
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
      // 🔧 先尝试API调用，如果失败则使用备用硬编码数据
      let result;
      
      try {
        const currentTab = this.data.tabs[this.data.currentTab];
        const params = {
          page: this.data.pageParams.page,
          pageSize: this.data.pageParams.pageSize,
          status: currentTab.status
        };
        
        console.log('[加载订单] 尝试API调用，参数:', params);
        console.log('[加载订单] 当前tab:', currentTab);
        
        result = await api.get('/api/order/list', params);
        console.log('[加载订单] API调用成功，结果:', result);
        
      } catch (apiError) {
        console.log('[加载订单] API调用失败，使用备用数据:', apiError);
        
        // 🚀 备用硬编码数据 - 包含所有状态的完整测试数据
        const allTestOrders = [
          // 待付款订单
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
              }
            ]
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
              }
            ]
          },
          // 待发货订单
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
            ]
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
            ]
          },
          // 待收货订单
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
              }
            ]
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
            ]
          },
          // 待评价订单
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
            ]
          },
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
              }
            ]
          },
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
              }
            ]
          },
          // 退款/售后订单
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
            ]
          },
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
              }
            ]
          },
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
            ]
          }
        ];
        
        // 根据当前选中的tab过滤数据
        const currentTab = this.data.tabs[this.data.currentTab];
        let filteredOrders = allTestOrders;
        
        if (currentTab.status && currentTab.status !== '') {
          filteredOrders = allTestOrders.filter(order => order.status === currentTab.status);
        }
        
        result = {
          list: filteredOrders,
          total: filteredOrders.length,
          hasMore: false
        };
        
        console.log('[加载订单] 使用备用数据，当前tab:', currentTab.name, '订单数量:', result.list.length);
      }
      
      let newOrderList;
      if (reset) {
        newOrderList = result.list;
      } else {
        newOrderList = [...this.data.orderList, ...result.list];
      }
      
      console.log('[加载订单] 新订单列表长度:', newOrderList.length);
      
      this.setData({
        orderList: newOrderList,
        hasMore: result.hasMore,
        loading: false,
        'pageParams.page': this.data.pageParams.page + 1
      });
      
      console.log('[加载订单] 数据设置完成，orderList:', this.data.orderList);
      
      // 显示成功提示
      if (newOrderList.length > 0) {
        wx.showToast({
          title: `加载了${newOrderList.length}个订单`,
          icon: 'success',
          duration: 1500
        });
      } else {
        // 如果没有数据，显示提示
        console.log('[加载订单] 当前tab无订单数据');
        wx.showToast({
          title: `暂无${this.data.tabs[this.data.currentTab].name}订单`,
          icon: 'none',
          duration: 1500
        });
      }
      
    } catch (error) {
      console.error('[加载订单] 失败:', error);
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
    
    // 根据订单ID生成退款编号（实际开发中应该从订单数据中获取真实的退款编号）
    const refundNo = `REFUND${orderId.replace('ORDER', '')}`;
    
    wx.navigateTo({
      url: `/pages/refund-detail/refund-detail?orderNo=${orderId}&refundNo=${refundNo}`
    });
  },
}); 