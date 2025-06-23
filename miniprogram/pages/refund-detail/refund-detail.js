// 退款详情页面逻辑
// 遵循API规范：后续接入真实API时header中设置auth，参数使用json格式

/**
 * 退款详情页面
 * 功能：展示退款的详细信息、商品信息、退款进度等
 * 数据来源：目前使用mock数据，后续替换为真实API
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面加载状态
    loading: true,
    
    // 基本参数（从页面跳转参数获取）
    orderNo: '', // 订单号
    refundNo: '', // 退款编号
    
    // 订单和退款基本信息
    orderInfo: {
      orderNo: '',
      refundNo: ''
    },
    
    // 商品信息
    productInfo: {
      image: '', // 商品主图
      title: '', // 商品标题
      spec: '', // 商品规格
      quantity: 0, // 数量
      price: 0 // 单价
    },
    
    // 退款信息
    refundInfo: {
      amount: 0, // 退款金额
      status: '', // 退款状态：refunding-退款中，completed-已完成，rejected-已驳回
      statusText: '', // 状态文字描述
      refundMethod: '', // 退款方式：original-原路退回，wechat-微信零钱
      refundMethodText: '', // 退款方式文字
      reason: '', // 退款原因
      applyTime: '', // 申请时间
      processTime: '', // 处理时间
      completeTime: '' // 完成时间
    },
    
    // 退款进度时间线
    progressList: [
      // {
      //   step: 1,
      //   title: '申请提交',
      //   desc: '您已提交退款申请',
      //   time: '2024-01-16 10:30:25',
      //   status: 'completed' // completed-已完成，current-当前步骤，pending-待处理
      // }
    ],
    
    // 错误状态
    hasError: false,
    errorMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   * 获取页面参数并加载退款详情数据
   */
  onLoad(options) {
    console.log('[退款详情页面] 页面加载，参数:', options);
    
    // 获取订单号和退款编号参数
    const orderNo = options.orderNo || options.order_no || '';
    const refundNo = options.refundNo || options.refund_no || '';
    
    if (!orderNo || !refundNo) {
      console.error('[退款详情页面] 缺少必要参数');
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      return;
    }
    
    // 设置基本信息
    this.setData({
      orderNo: orderNo,
      refundNo: refundNo,
      'orderInfo.orderNo': orderNo,
      'orderInfo.refundNo': refundNo
    });
    
    // 加载退款详情数据
    this.loadRefundDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('[退款详情页面] 页面显示');
  },

  /**
   * 加载退款详情信息
   * 目前使用mock数据，后续替换为真实API调用
   */
  async loadRefundDetail() {
    this.setData({ loading: true, hasError: false });
    
    try {
      console.log('[退款详情] 开始加载数据, 订单号:', this.data.orderNo, '退款编号:', this.data.refundNo);
      
      // 🔧 目前使用Mock数据，后续替换为真实API
      // const refundData = await apiRequest('/api/refund/detail', {
      //   orderNo: this.data.orderNo,
      //   refundNo: this.data.refundNo
      // }, 'POST');
      
      const refundData = this.getMockRefundData();
      
      // 处理数据并更新页面
      this.processRefundData(refundData);
      
    } catch (error) {
      console.error('[退款详情] 加载失败:', error);
      this.setData({
        loading: false,
        hasError: true,
        errorMessage: error.message || '加载退款详情失败'
      });
      
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 获取Mock退款数据
   * 模拟不同退款状态的数据
   */
  getMockRefundData() {
    // 根据退款编号模拟不同状态的数据
    const refundNo = this.data.refundNo;
    const mockDataSets = [
      // Mock数据集1：退款中状态
      {
        productInfo: {
          image: 'https://img.alicdn.com/tfs/TB1V4g3d.H1gK0jSZSyXXXtlpXa-400-400.png',
          title: '苹果iPhone 15 Pro Max 1TB 天然钛金色',
          spec: '天然钛金色 1TB',
          quantity: 1,
          price: 9999.00
        },
        refundInfo: {
          amount: 9999.00,
          status: 'refunding',
          statusText: '退款中',
          refundMethod: 'original',
          refundMethodText: '原路退回',
          reason: '不想要了',
          applyTime: '2024-01-16 10:30:25',
          processTime: '2024-01-16 14:20:30',
          completeTime: ''
        },
        progressList: [
          {
            step: 1,
            title: '申请提交',
            desc: '您已提交退款申请',
            time: '2024-01-16 10:30:25',
            status: 'completed'
          },
          {
            step: 2,
            title: '商家处理',
            desc: '商家正在审核您的退款申请',
            time: '2024-01-16 14:20:30',
            status: 'current'
          },
          {
            step: 3,
            title: '退款完成',
            desc: '退款将原路返回您的支付账户',
            time: '',
            status: 'pending'
          }
        ]
      },
      // Mock数据集2：已完成状态
      {
        productInfo: {
          image: 'https://img.alicdn.com/tfs/TB1KQ.4d.Y1gK0jSZFMXXaWcVXa-400-400.png',
          title: '华为Mate 60 Pro 12GB+512GB 雅川青',
          spec: '雅川青 12GB+512GB',
          quantity: 1,
          price: 6999.00
        },
        refundInfo: {
          amount: 6999.00,
          status: 'completed',
          statusText: '已完成',
          refundMethod: 'wechat',
          refundMethodText: '微信零钱',
          reason: '商品有瑕疵',
          applyTime: '2024-01-15 09:15:20',
          processTime: '2024-01-15 15:30:45',
          completeTime: '2024-01-16 09:20:10'
        },
        progressList: [
          {
            step: 1,
            title: '申请提交',
            desc: '您已提交退款申请',
            time: '2024-01-15 09:15:20',
            status: 'completed'
          },
          {
            step: 2,
            title: '商家处理',
            desc: '商家已同意退款申请',
            time: '2024-01-15 15:30:45',
            status: 'completed'
          },
          {
            step: 3,
            title: '退款完成',
            desc: '退款已到账，请查收',
            time: '2024-01-16 09:20:10',
            status: 'completed'
          }
        ]
      },
      // Mock数据集3：已驳回状态
      {
        productInfo: {
          image: 'https://img.alicdn.com/tfs/TB1mg.7d7Y2gK0jSZFgXXc5OFXa-400-400.png',
          title: '小米14 Ultra 16GB+1TB 黑色 徕卡光学镜头',
          spec: '黑色 16GB+1TB',
          quantity: 1,
          price: 6499.00
        },
        refundInfo: {
          amount: 6499.00,
          status: 'rejected',
          statusText: '已驳回',
          refundMethod: 'original',
          refundMethodText: '原路退回',
          reason: '尺寸不合适',
          applyTime: '2024-01-14 16:45:30',
          processTime: '2024-01-15 10:20:15',
          completeTime: ''
        },
        progressList: [
          {
            step: 1,
            title: '申请提交',
            desc: '您已提交退款申请',
            time: '2024-01-14 16:45:30',
            status: 'completed'
          },
          {
            step: 2,
            title: '商家处理',
            desc: '商家已驳回退款申请，原因：商品无质量问题',
            time: '2024-01-15 10:20:15',
            status: 'rejected'
          }
        ]
      }
    ];
    
    // 根据退款编号的最后一位数字选择Mock数据
    const dataIndex = parseInt(refundNo.slice(-1)) % mockDataSets.length;
    const selectedMockData = mockDataSets[dataIndex];
    
    console.log('[Mock数据] 选择数据集:', dataIndex, selectedMockData);
    
    return selectedMockData;
  },

  /**
   * 处理退款数据
   * 设置页面数据并停止加载状态
   */
  processRefundData(refundData) {
    if (!refundData) {
      throw new Error('退款数据为空');
    }
    
    this.setData({
      productInfo: refundData.productInfo,
      refundInfo: refundData.refundInfo,
      progressList: refundData.progressList,
      loading: false,
      hasError: false
    });
    
    console.log('[退款数据] 处理完成:', {
      productInfo: this.data.productInfo,
      refundInfo: this.data.refundInfo,
      progressList: this.data.progressList
    });
  },

  /**
   * 复制订单号
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
   * 复制退款编号
   */
  copyRefundNo() {
    const refundNo = this.data.orderInfo.refundNo;
    wx.setClipboardData({
      data: refundNo,
      success: () => {
        wx.showToast({
          title: '退款编号已复制',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('[复制失败] 退款编号:', error);
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
   * 重新加载数据
   */
  reloadData() {
    console.log('[退款详情] 重新加载数据');
    this.loadRefundDetail();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('[下拉刷新] 用户下拉刷新');
    this.reloadData();
    
    // 停止下拉刷新动画
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const orderNo = this.data.orderInfo.orderNo;
    const refundNo = this.data.orderInfo.refundNo;
    return {
      title: '退款详情',
      path: `/pages/refund-detail/refund-detail?orderNo=${orderNo}&refundNo=${refundNo}`,
      imageUrl: '' // 可以设置分享图片
    };
  },

  /**
   * 页面卸载时的清理工作
   */
  onUnload() {
    console.log('[退款详情页面] 页面卸载');
  }
}); 