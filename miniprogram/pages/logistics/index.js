// 物流查询页面逻辑 - 基于接口文档logistics.md实现
// 遵循API规范：header中设置auth，参数使用json格式

/**
 * 导入物流查询API函数 - 基于接口文档实现
 * 根据@api.mdc规范，后端返回统一格式：{error, body, message}
 */
const { queryLogistics } = require('../../api/logisticsApi');

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
    
    // 物流信息（完全按照接口文档字段定义）
    logisticsInfo: {
      // 物流状态：pending-待发货，shipping-运输中，delivered-已签收，exception-异常
      status: 'pending',                    // 对应接口文档 status
      statusText: '待发货',                 // 对应接口文档 statusText
      companyName: '',                      // 对应接口文档 companyName
      trackingNo: '',                       // 对应接口文档 trackingNo
      tracks: [],                           // 对应接口文档 tracks 数组
      companyInfo: {                        // 对应接口文档 companyInfo 对象
        name: '',                           // 对应接口文档 companyInfo.name
        phone: '',                          // 对应接口文档 companyInfo.phone
        logo: ''                            // 对应接口文档 companyInfo.logo
      }
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
   * 加载物流信息 - 基于接口文档实现
   * 使用真实API调用，不再依赖Mock数据
   */
  async loadLogisticsInfo() {
    this.setData({ loading: true, hasError: false });
    
    // 检查用户登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      console.log('用户未登录，跳过物流查询');
      this.setData({
        loading: false,
        hasError: true,
        errorMessage: '请先登录'
      });
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    try {
      console.log('[物流查询] 开始查询物流信息, 订单ID:', this.data.orderInfo.orderId);
      
      // 调用真实API - 按照接口文档实现
      const logisticsData = await queryLogistics(this.data.orderInfo.orderId);
      
      console.log('[物流查询] API调用成功:', logisticsData);
      
      // 处理物流数据
      this.processLogisticsData(logisticsData);
      
    } catch (error) {
      console.error('[物流查询] 加载失败:', error);
      
      // 根据接口文档的错误码处理
      const errorCode = error?.error || error?.code || 0;
      const errorMessage = error?.message || '查询物流信息失败';
      
      this.handleLogisticsError(errorCode, errorMessage);
    }
  },



  /**
   * 处理物流数据 - 按照接口文档字段安全处理
   * 设置页面数据并停止加载状态
   */
  processLogisticsData(logisticsData) {
    if (!logisticsData) {
      throw new Error('物流数据为空');
    }
    
    // 按照接口文档安全处理各字段 - 提供默认值避免页面报错
    const safeLogisticsInfo = {
      status: logisticsData.status || 'pending',                             // 对应接口文档 status
      statusText: logisticsData.statusText || '待发货',                       // 对应接口文档 statusText
      companyName: logisticsData.companyName || '',                          // 对应接口文档 companyName
      trackingNo: logisticsData.trackingNo || '',                            // 对应接口文档 trackingNo
      tracks: Array.isArray(logisticsData.tracks) ? logisticsData.tracks : [], // 对应接口文档 tracks 数组
      companyInfo: {                                                          // 对应接口文档 companyInfo 对象
        name: logisticsData.companyInfo?.name || logisticsData.companyName || '',     // 对应接口文档 companyInfo.name
        phone: logisticsData.companyInfo?.phone || '',                                // 对应接口文档 companyInfo.phone
        logo: logisticsData.companyInfo?.logo || ''                                   // 对应接口文档 companyInfo.logo
      }
    };
    
    this.setData({
      logisticsInfo: safeLogisticsInfo,
      loading: false,
      hasError: false
    });
    
    console.log('[物流数据] 处理完成:', this.data.logisticsInfo);
  },

  /**
   * 错误处理函数 - 根据接口文档错误码处理
   * @param {number} errorCode - 错误码
   * @param {string} errorMessage - 错误信息
   */
  handleLogisticsError(errorCode, errorMessage) {
    console.error('[物流查询错误] 错误码:', errorCode, '错误信息:', errorMessage);
    
    this.setData({
      loading: false,
      hasError: true,
      errorMessage: errorMessage
    });
    
    // 根据接口文档的错误码显示不同提示
    switch (errorCode) {
      case 401:
        // 未登录，需要重新登录
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
        break;
        
      case 1001:
        // 参数错误，订单ID不能为空
        wx.showToast({
          title: '订单参数错误',
          icon: 'none'
        });
        break;
        
      case 1002:
        // 订单不存在
        wx.showToast({
          title: '订单不存在',
          icon: 'none'
        });
        break;
        
      case 1003:
        // 该订单暂无物流信息
        wx.showToast({
          title: '暂无物流信息',
          icon: 'none'
        });
        // 设置默认状态为待发货
        this.setData({
          logisticsInfo: {
            ...this.data.logisticsInfo,
            status: 'pending',
            statusText: '待发货',
            tracks: []
          }
        });
        break;
        
      case 500:
        // 系统异常，请稍后重试
        wx.showToast({
          title: '系统异常，请稍后重试',
          icon: 'none'
        });
        break;
        
      default:
        // 其他错误
        wx.showToast({
          title: errorMessage || '查询失败，请重试',
          icon: 'none'
        });
    }
  },

  /**
   * 刷新物流信息 - 基于真实API
   * 用户主动刷新或重新查询时调用
   */
  refreshLogistics() {
    console.log('[物流刷新] 用户触发刷新，使用真实API');
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
   * 拨打物流公司电话 - 使用接口返回的真实数据
   */
  callCompany() {
    const companyPhone = this.data.logisticsInfo.companyInfo?.phone;
    const companyName = this.data.logisticsInfo.companyInfo?.name || this.data.logisticsInfo.companyName;
    
    if (!companyPhone) {
      wx.showToast({
        title: '暂无物流公司电话',
        icon: 'none'
      });
      return;
    }
    
    // 显示确认对话框
    wx.showModal({
      title: '拨打电话',
      content: `确定要拨打${companyName}客服电话：${companyPhone}吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: companyPhone,
            success: () => {
              console.log('[电话] 拨打物流公司电话成功:', companyPhone);
            },
            fail: (error) => {
              console.error('[电话] 拨打物流公司电话失败:', error);
              wx.showToast({
                title: '拨打失败',
                icon: 'none'
              });
            }
          });
        }
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