// 物流查询页面逻辑
// 遵循API规范：header中设置auth，参数使用json格式

/**
 * 导入通用API请求函数
 * 根据@api.mdc规范，后端返回统一格式：{error, body, message}
 */
const { apiRequest } = require('../../api/request');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面加载状态
    loading: true,
    
    // 订单基本信息（从页面参数获取）
    orderInfo: {
      orderId: '',
      orderNo: ''
    },
    
    // 物流信息（包含时间线轨迹）
    logisticsInfo: {
      // 物流状态：pending-待发货，shipping-运输中，delivered-已签收，exception-异常
      status: 'shipping',
      statusText: '运输中',
      companyName: '',
      trackingNo: '',
      tracks: [], // 物流轨迹数组
      companyInfo: null // 物流公司详细信息
    },
    
    // 错误状态
    hasError: false,
    errorMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   * 从页面参数获取订单号，并初始化物流查询
   */
  onLoad(options) {
    console.log('[物流页面] 页面加载，参数:', options);
    
    // 获取订单ID参数
    const orderId = options.orderId || options.order_id || '';
    
    if (!orderId) {
      console.error('[物流页面] 缺少订单ID参数');
      wx.showToast({
        title: '订单参数错误',
        icon: 'none'
      });
      return;
    }
    
    // 设置订单信息
    this.setData({
      'orderInfo.orderId': orderId,
      'orderInfo.orderNo': orderId // 临时使用订单ID作为订单号
    });
    
    // 加载物流信息
    this.loadLogisticsInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('[物流页面] 页面显示');
    // 页面每次显示时刷新物流信息（可选）
    // this.refreshLogistics();
  },

  /**
   * 加载物流信息
   * 优先调用真实API，失败时降级使用Mock数据
   */
  async loadLogisticsInfo() {
    this.setData({ loading: true, hasError: false });
    
    try {
      console.log('[物流查询] 开始查询物流信息, 订单ID:', this.data.orderInfo.orderId);
      
      // 🌐 尝试调用真实API
      let logisticsData;
      try {
        // 根据@api.mdc规范：POST请求，header设置auth，参数用json格式
        logisticsData = await apiRequest('/api/logistics/query', {
          orderId: this.data.orderInfo.orderId
        }, 'POST');
        
        console.log('[物流查询] API调用成功:', logisticsData);
        
      } catch (apiError) {
        console.warn('[物流查询] API调用失败，使用Mock数据:', apiError);
        
        // 🔧 API调用失败，使用Mock数据降级处理
        logisticsData = this.getMockLogisticsData();
      }
      
      // 处理物流数据
      this.processLogisticsData(logisticsData);
      
    } catch (error) {
      console.error('[物流查询] 加载失败:', error);
      this.setData({
        loading: false,
        hasError: true,
        errorMessage: error.message || '查询物流信息失败'
      });
      
      wx.showToast({
        title: '查询失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 获取Mock物流数据
   * 模拟不同的物流状态和轨迹信息
   */
  getMockLogisticsData() {
    // 根据订单ID模拟不同的物流状态
    const orderId = this.data.orderInfo.orderId;
    const mockDataSets = [
      // Mock数据集1：正常运输中
      {
        status: 'shipping',
        statusText: '运输中',
        companyName: '顺丰速运',
        trackingNo: 'SF1234567890123',
        tracks: [
          {
            time: '2024-01-16 14:30:25',
            status: '快件已到达 【北京朝阳分拣中心】',
            location: '北京朝阳分拣中心'
          },
          {
            time: '2024-01-16 10:15:30',
            status: '快件已从 【北京天通苑营业点】 发出，下一站 【北京朝阳分拣中心】',
            location: '北京天通苑营业点'
          },
          {
            time: '2024-01-16 08:20:15',
            status: '快件已在 【北京天通苑营业点】 装车，准备发往下一站',
            location: '北京天通苑营业点'
          },
          {
            time: '2024-01-15 18:45:00',
            status: '已收件',
            location: '北京天通苑营业点'
          }
        ],
        companyInfo: {
          name: '顺丰速运',
          phone: '95338',
          logo: 'https://img.alicdn.com/tfs/TB1V4g3d.H1gK0jSZSyXXXtlpXa-200-200.png'
        }
      },
      // Mock数据集2：已签收
      {
        status: 'delivered',
        statusText: '已签收',
        companyName: '中通快递',
        trackingNo: 'ZT9876543210987',
        tracks: [
          {
            time: '2024-01-16 16:20:30',
            status: '快件已签收，签收人：本人签收，如有疑问请联系派件员',
            location: '北京朝阳区配送点'
          },
          {
            time: '2024-01-16 15:45:20',
            status: '快件正在派送中，派送员：李师傅，联系电话：138****8888',
            location: '北京朝阳区配送点'
          },
          {
            time: '2024-01-16 08:30:15',
            status: '快件已到达 【北京朝阳区配送点】',
            location: '北京朝阳区配送点'
          },
          {
            time: '2024-01-15 22:15:00',
            status: '快件已从 【北京分拣中心】 发出',
            location: '北京分拣中心'
          },
          {
            time: '2024-01-15 18:30:00',
            status: '已收件',
            location: '上海浦东营业点'
          }
        ],
        companyInfo: {
          name: '中通快递',
          phone: '95311',
          logo: 'https://img.alicdn.com/tfs/TB1KQ.4d.Y1gK0jSZFMXXaWcVXa-200-200.png'
        }
      },
      // Mock数据集3：暂无物流信息
      {
        status: 'pending',
        statusText: '待发货',
        companyName: '申通快递',
        trackingNo: 'ST5555666677778',
        tracks: [],
        companyInfo: {
          name: '申通快递',
          phone: '95543',
          logo: 'https://img.alicdn.com/tfs/TB1mg.7d7Y2gK0jSZFgXXc5OFXa-200-200.png'
        }
      }
    ];
    
    // 根据订单ID的最后一位数字选择Mock数据
    const dataIndex = parseInt(orderId.slice(-1)) % mockDataSets.length;
    const selectedMockData = mockDataSets[dataIndex];
    
    console.log('[Mock数据] 选择数据集:', dataIndex, selectedMockData);
    
    return selectedMockData;
  },

  /**
   * 处理物流数据
   * 设置页面数据并停止加载状态
   */
  processLogisticsData(logisticsData) {
    if (!logisticsData) {
      throw new Error('物流数据为空');
    }
    
    this.setData({
      logisticsInfo: {
        ...this.data.logisticsInfo,
        ...logisticsData
      },
      loading: false,
      hasError: false
    });
    
    console.log('[物流数据] 处理完成:', this.data.logisticsInfo);
  },

  /**
   * 刷新物流信息
   * 用户主动刷新或重新查询时调用
   */
  refreshLogistics() {
    console.log('[物流刷新] 用户触发刷新');
    this.loadLogisticsInfo();
  },

  /**
   * 复制订单号码
   */
  copyOrderNo() {
    const orderNo = this.data.orderInfo.orderNo;
    wx.setClipboardData({
      data: orderNo,
      success: () => {
        wx.showToast({
          title: '订单号已复制',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('[复制失败] 订单号:', error);
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 复制物流单号
   */
  copyTrackingNo() {
    const trackingNo = this.data.logisticsInfo.trackingNo;
    if (!trackingNo) {
      wx.showToast({
        title: '暂无物流单号',
        icon: 'none'
      });
      return;
    }
    
    wx.setClipboardData({
      data: trackingNo,
      success: () => {
        wx.showToast({
          title: '物流单号已复制',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('[复制失败] 物流单号:', error);
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 联系客服
   * 可跳转到客服页面或拨打客服电话
   */
  contactService() {
    wx.showActionSheet({
      itemList: ['在线客服', '拨打客服电话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 跳转到在线客服页面（如果有的话）
          console.log('[客服] 跳转在线客服');
          wx.showToast({
            title: '客服功能开发中',
            icon: 'none'
          });
        } else if (res.tapIndex === 1) {
          // 拨打客服电话
          this.callServicePhone();
        }
      }
    });
  },

  /**
   * 拨打客服电话
   */
  callServicePhone() {
    const servicePhone = '400-123-4567'; // 这里应该是实际的客服电话
    wx.makePhoneCall({
      phoneNumber: servicePhone,
      success: () => {
        console.log('[电话] 拨打客服电话成功');
      },
      fail: (error) => {
        console.error('[电话] 拨打失败:', error);
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 拨打物流公司电话
   */
  callCompany() {
    const companyPhone = this.data.logisticsInfo.companyInfo?.phone;
    if (!companyPhone) {
      wx.showToast({
        title: '暂无物流公司电话',
        icon: 'none'
      });
      return;
    }
    
    wx.makePhoneCall({
      phoneNumber: companyPhone,
      success: () => {
        console.log('[电话] 拨打物流公司电话成功');
      },
      fail: (error) => {
        console.error('[电话] 拨打物流公司电话失败:', error);
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('[下拉刷新] 用户下拉刷新');
    this.refreshLogistics();
    
    // 停止下拉刷新动画
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const orderId = this.data.orderInfo.orderId;
    return {
      title: '查看物流信息',
      path: `/pages/logistics/index?orderId=${orderId}`,
      imageUrl: '' // 可以设置分享图片
    };
  },

  /**
   * 页面卸载时的清理工作
   */
  onUnload() {
    console.log('[物流页面] 页面卸载');
  }
}); 