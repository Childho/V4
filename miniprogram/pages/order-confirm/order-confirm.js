// 订单确认页面逻辑
// 导入订单相关API
import { createOrder, calculateOrderAmount, checkStock } from '../../api/orderApi.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 收货地址信息
    addressInfo: null,
    
    // 订单商品列表 - 从购物车传递过来的商品数据
    orderGoods: [],
    
    // 优惠券相关
    availableCoupons: 0, // 可用优惠券数量
    selectedCoupon: null, // 已选择的优惠券
    
    // 备注信息
    remark: '',
    
    // 金额相关
    totalGoodsAmount: 0, // 商品总金额
    shippingFee: 0, // 运费，默认免运费
    finalAmount: 0, // 最终实付金额
    
    // 提交状态
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('订单确认页面加载，参数：', options);
    
    // 获取传递的商品数据
    this.getOrderData(options);
    
    // 获取用户收货地址
    this.getUserAddress();
    
    // 获取可用优惠券数量
    this.getAvailableCoupons();
  },

  /**
   * 获取订单数据 - 从购物车或商品详情页传递过来
   */
  getOrderData(options) {
    try {
      // 从页面参数获取商品数据，实际应用中可能从全局数据或接口获取
      let goods = [];
      
      // 如果有传递商品数据（JSON字符串格式）
      if (options.goods) {
        goods = JSON.parse(decodeURIComponent(options.goods));
      } else {
        // 模拟商品数据，实际开发中应该从购物车获取
        goods = [
          {
            id: 1,
            name: 'NCS#75速【多啦A梦黄】【3只装】',
            image: 'https://via.placeholder.com/120x120/ff9800/fff?text=商品',
            spec: '黄色 3只装',
            price: 15.00,
            quantity: 1
          },
          {
            id: 2,
            name: '示例商品2',
            image: 'https://via.placeholder.com/120x120/2196f3/fff?text=商品2',
            spec: '蓝色 1只装',
            price: 25.00,
            quantity: 2
          }
        ];
      }
      
      // 计算商品总金额
      const totalAmount = goods.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      // 更新页面数据
      this.setData({
        orderGoods: goods,
        totalGoodsAmount: totalAmount.toFixed(2),
        finalAmount: totalAmount.toFixed(2)
      });
      
      console.log('订单商品数据设置完成：', goods);
      
      // 检查商品库存
      this.checkGoodsStock(goods);
    } catch (error) {
      console.error('获取订单数据失败：', error);
      wx.showToast({
        title: '获取订单数据失败',
        icon: 'none'
      });
    }
  },

  /**
   * 检查商品库存
   */
  async checkGoodsStock(goods) {
    try {
      const stockData = goods.map(item => ({
        goodsId: item.id,
        quantity: item.quantity
      }));
      
      // 调用库存检查接口
      // const stockResult = await checkStock(stockData);
      // console.log('库存检查结果：', stockResult);
      
      // 模拟库存检查（实际项目中使用上面的接口调用）
      console.log('模拟库存检查通过');
    } catch (error) {
      console.error('库存检查失败：', error);
      wx.showModal({
        title: '提示',
        content: '部分商品库存不足，请重新选择',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }
  },

  /**
   * 获取用户收货地址
   */
  getUserAddress() {
    try {
      // 从本地存储获取用户地址信息
      const addressInfo = wx.getStorageSync('selectedAddress');
      
      if (addressInfo) {
        this.setData({
          addressInfo: addressInfo
        });
        console.log('获取到用户地址：', addressInfo);
      } else {
        console.log('用户暂未设置收货地址');
      }
    } catch (error) {
      console.error('获取用户地址失败：', error);
    }
  },

  /**
   * 获取可用优惠券数量
   */
  getAvailableCoupons() {
    try {
      // 实际开发中应该调用接口获取用户可用优惠券
      // 这里模拟数据
      const coupons = 3; // 假设有3张可用优惠券
      
      this.setData({
        availableCoupons: coupons
      });
      
      console.log('获取到可用优惠券数量：', coupons);
    } catch (error) {
      console.error('获取优惠券数据失败：', error);
    }
  },

  /**
   * 选择收货地址
   */
  selectAddress() {
    console.log('跳转到地址选择页面');
    wx.navigateTo({
      url: '/pages/address-list/index?from=order-confirm',
      fail: (error) => {
        console.error('跳转地址页面失败：', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 选择优惠券
   */
  selectCoupon() {
    console.log('跳转到优惠券选择页面');
    
    // 传递当前订单金额，用于筛选可用优惠券
    const orderAmount = this.data.totalGoodsAmount;
    
    wx.navigateTo({
      url: `/pages/coupon-list/coupon-list?orderAmount=${orderAmount}&from=order-confirm`,
      fail: (error) => {
        console.error('跳转优惠券页面失败：', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 备注输入处理
   */
  onRemarkInput(e) {
    const remark = e.detail.value;
    this.setData({
      remark: remark
    });
    console.log('备注内容：', remark);
  },

  /**
   * 计算最终金额
   */
  calculateFinalAmount() {
    const goodsAmount = parseFloat(this.data.totalGoodsAmount);
    const shippingFee = parseFloat(this.data.shippingFee);
    const couponDiscount = this.data.selectedCoupon ? parseFloat(this.data.selectedCoupon.discount) : 0;
    
    // 计算最终金额：商品金额 + 运费 - 优惠券优惠
    const finalAmount = Math.max(0, goodsAmount + shippingFee - couponDiscount);
    
    this.setData({
      finalAmount: finalAmount.toFixed(2)
    });
    
    console.log('重新计算最终金额：', finalAmount);
  },

  /**
   * 调用接口计算订单金额（可选，用于服务端验证）
   */
  async calculateOrderAmountFromServer() {
    try {
      if (!this.data.addressInfo) {
        return;
      }
      
      const params = {
        goods: this.data.orderGoods.map(item => ({
          goodsId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        addressId: this.data.addressInfo.id,
        couponId: this.data.selectedCoupon ? this.data.selectedCoupon.id : null
      };
      
      // 调用服务端计算接口
      // const result = await calculateOrderAmount(params);
      // console.log('服务端计算结果：', result);
      
      // 更新金额数据
      // this.setData({
      //   totalGoodsAmount: result.goodsAmount.toFixed(2),
      //   shippingFee: result.shippingFee.toFixed(2),
      //   finalAmount: result.finalAmount.toFixed(2)
      // });
      
    } catch (error) {
      console.error('服务端金额计算失败：', error);
    }
  },

  /**
   * 提交订单
   */
  async submitOrder() {
    console.log('开始提交订单');
    
    // 验证必填信息
    if (!this.data.addressInfo) {
      wx.showToast({
        title: '请先选择收货地址',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.orderGoods.length === 0) {
      wx.showToast({
        title: '订单商品不能为空',
        icon: 'none'
      });
      return;
    }
    
    // 设置提交状态
    this.setData({
      submitting: true
    });
    
    try {
      // 构建订单数据
      const orderData = {
        goods: this.data.orderGoods,
        address: this.data.addressInfo,
        coupon: this.data.selectedCoupon,
        remark: this.data.remark,
        amounts: {
          goodsAmount: this.data.totalGoodsAmount,
          shippingFee: this.data.shippingFee,
          finalAmount: this.data.finalAmount
        }
      };
      
      console.log('提交的订单数据：', orderData);
      
      // 调用后端接口提交订单
      // const result = await createOrder(orderData);
      // console.log('订单创建成功：', result);
      
      // 模拟接口调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 提交成功
      wx.showToast({
        title: '订单提交成功',
        icon: 'success'
      });
      
      // 清除购物车相关数据（如果是从购物车进入的）
      wx.removeStorageSync('cartSelectedItems');
      
      // 跳转到支付页面或订单详情页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/payment/payment?orderId=mock123456'
        });
      }, 1500);
      
    } catch (error) {
      console.error('提交订单失败：', error);
      wx.showModal({
        title: '提交失败',
        content: error.message || '订单提交失败，请重试',
        showCancel: false
      });
    } finally {
      // 重置提交状态
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   * 用于接收从其他页面返回的数据
   */
  onShow() {
    // 检查是否有地址更新
    this.getUserAddress();
    
    // 检查是否有优惠券选择更新
    this.checkCouponUpdate();
  },

  /**
   * 检查优惠券选择更新
   */
  checkCouponUpdate() {
    try {
      const selectedCoupon = wx.getStorageSync('selectedCoupon');
      if (selectedCoupon) {
        this.setData({
          selectedCoupon: selectedCoupon
        });
        
        // 重新计算金额
        this.calculateFinalAmount();
        
        // 清除临时存储
        wx.removeStorageSync('selectedCoupon');
        
        console.log('优惠券选择已更新：', selectedCoupon);
      }
    } catch (error) {
      console.error('检查优惠券更新失败：', error);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏时的处理
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时的处理
    console.log('订单确认页面卸载');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('用户下拉刷新');
    
    // 重新获取数据
    this.getUserAddress();
    this.getAvailableCoupons();
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 此页面一般不需要分页加载
  }
}); 