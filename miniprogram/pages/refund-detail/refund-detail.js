// 退款详情页面逻辑
// 导入退款相关API
import { getRefundDetail } from '../../api/refundApi.js';

/**
 * 退款详情页面
 * 功能：展示退款的详细信息、商品信息、退款进度等
 * 数据来源：真实API接口
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
   * 调用真实API获取退款详情数据
   */
  async loadRefundDetail() {
    this.setData({ loading: true, hasError: false });
    
    try {
      console.log('[退款详情] 开始加载数据, 订单号:', this.data.orderNo, '退款编号:', this.data.refundNo);
      
      // 调用真实API获取退款详情
      const result = await getRefundDetail({
        orderNo: this.data.orderNo,
        refundNo: this.data.refundNo
      });
      
      if (result.success && result.body) {
        console.log('[退款详情] API调用成功，数据：', result.body);
        
        // 处理数据并更新页面
        this.processRefundData(result.body);
      } else {
        throw new Error(result.message || '获取退款详情失败');
      }
      
    } catch (error) {
      console.error('[退款详情] 加载失败:', error);
      
      this.setData({
        loading: false,
        hasError: true,
        errorMessage: error.message || '加载退款详情失败'
      });
      
      // 显示友好的错误提示
      wx.showModal({
        title: '加载失败',
        content: error.message || '网络异常，请检查网络连接后重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试加载
            this.loadRefundDetail();
          }
        }
      });
    }
  },



  /**
   * 处理退款数据
   * 设置页面数据并停止加载状态，确保字段映射与接口文档一致
   */
  processRefundData(refundData) {
    if (!refundData) {
      throw new Error('退款数据为空');
    }
    
    // 处理商品信息，使用默认值避免页面报错
    const productInfo = {
      image: refundData.productInfo?.image || '',
      title: refundData.productInfo?.title || '商品信息缺失',
      spec: refundData.productInfo?.spec || '',
      quantity: refundData.productInfo?.quantity || 0,
      price: refundData.productInfo?.price || 0
    };
    
    // 处理退款信息，使用默认值避免页面报错
    const refundInfo = {
      amount: refundData.refundInfo?.amount || 0,
      status: refundData.refundInfo?.status || 'refunding',
      statusText: refundData.refundInfo?.statusText || '退款中',
      refundMethod: refundData.refundInfo?.refundMethod || 'original',
      refundMethodText: refundData.refundInfo?.refundMethodText || '原路退回',
      reason: refundData.refundInfo?.reason || '',
      applyTime: refundData.refundInfo?.applyTime || '',
      processTime: refundData.refundInfo?.processTime || '',
      completeTime: refundData.refundInfo?.completeTime || ''
    };
    
    // 处理进度列表，确保数组结构正确
    const progressList = Array.isArray(refundData.progressList) ? refundData.progressList : [];
    
    this.setData({
      productInfo: productInfo,
      refundInfo: refundInfo,
      progressList: progressList,
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
    
    // 重置错误状态
    this.setData({
      hasError: false,
      errorMessage: ''
    });
    
    this.loadRefundDetail();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('[下拉刷新] 用户下拉刷新');
    
    // 重置错误状态并重新加载
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