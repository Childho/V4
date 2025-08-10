// 订单确认页面逻辑
// 导入订单相关API
import { 
  getOrderPreview, 
  checkStock, 
  calculateOrderAmount, 
  getUserDefaultAddress, 
  getAvailableCoupons, 
  createOrder 
} from '../../api/orderApi.js';

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
    submitting: false,
    
    // 页面加载状态
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('订单确认页面加载，参数：', options);
    
    // 获取传递的商品数据并加载订单预览
    this.initOrderData(options);
  },

  /**
   * 初始化订单数据 - 调用订单预览接口
   */
  async initOrderData(options) {
    try {
      // 设置加载状态
      this.setData({
        loading: true
      });

      // 准备商品数据
      let goods = [];
      
      if (options.goods) {
        // 从页面参数获取商品数据
        goods = JSON.parse(decodeURIComponent(options.goods));
        // 转换为API需要的格式 { id, quantity }
        goods = goods.map(item => ({
          id: item.id,
          quantity: item.quantity
        }));
      } else {
        // 如果没有传递商品数据，使用模拟数据（开发阶段）
        goods = [
          { id: 1, quantity: 1 },
          { id: 2, quantity: 2 }
        ];
      }

      console.log('调用订单预览接口，商品数据：', goods);

      // 调用订单预览接口
      const previewResult = await getOrderPreview({
        goods: goods,
        source: options.source || 'cart'
      });

      if (previewResult.success && previewResult.body) {
        const { orderGoods, addressInfo, availableCoupons, totalGoodsAmount, shippingFee, finalAmount } = previewResult.body;
        
        // 更新页面数据
        this.setData({
          orderGoods: orderGoods || [],
          addressInfo: addressInfo || null,
          availableCoupons: availableCoupons || 0,
          totalGoodsAmount: totalGoodsAmount || 0,
          shippingFee: shippingFee || 0,
          finalAmount: finalAmount || 0,
          loading: false
        });

        console.log('订单预览数据加载成功：', previewResult.body);

        // 检查商品库存
        if (orderGoods && orderGoods.length > 0) {
          this.checkGoodsStock(orderGoods);
        }
      } else {
        throw new Error(previewResult.message || '获取订单预览失败');
      }
    } catch (error) {
      console.error('初始化订单数据失败：', error);
      
      // 设置默认数据，避免页面报错
      this.setData({
        orderGoods: [],
        addressInfo: null,
        availableCoupons: 0,
        totalGoodsAmount: 0,
        shippingFee: 0,
        finalAmount: 0,
        loading: false
      });

      wx.showModal({
        title: '加载失败',
        content: error.message || '获取订单数据失败，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 重试加载
            this.initOrderData(options);
          } else {
            // 返回上一页
            wx.navigateBack();
          }
        }
      });
    }
  },

  /**
   * 检查商品库存
   */
  async checkGoodsStock(orderGoods) {
    try {
      // 转换为库存检查接口需要的格式 { goodsId, quantity }
      const stockData = orderGoods.map(item => ({
        goodsId: item.id,
        quantity: item.quantity
      }));
      
      console.log('检查商品库存，数据：', stockData);

      // 调用库存检查接口
      const stockResult = await checkStock(stockData);
      
      if (stockResult.success && stockResult.body) {
        const { allInStock, details } = stockResult.body;
        
        if (!allInStock) {
          console.warn('部分商品库存不足：', details);
          
          // 找出库存不足的商品
          const outOfStockItems = details.filter(item => !item.inStock);
          const itemNames = outOfStockItems.map(item => {
            const goods = orderGoods.find(g => g.id === item.id);
            return goods ? goods.name : `商品${item.id}`;
          }).join('、');

          wx.showModal({
            title: '库存不足',
            content: `${itemNames} 库存不足，请重新选择商品`,
            showCancel: false,
            success: () => {
              wx.navigateBack();
            }
          });
          return;
        }
        
        console.log('库存检查通过');
      } else {
        throw new Error(stockResult.message || '库存检查失败');
      }
    } catch (error) {
      console.error('库存检查失败：', error);
      // 库存检查失败不阻断流程，只记录日志
      wx.showToast({
        title: '库存检查异常',
        icon: 'none'
      });
    }
  },

  /**
   * 获取用户收货地址
   */
  async getUserAddress() {
    try {
      console.log('获取用户默认收货地址');

      const addressResult = await getUserDefaultAddress();
      
      if (addressResult.success && addressResult.body && addressResult.body.address) {
        const addressInfo = addressResult.body.address;
        
        // 转换字段名以匹配页面使用的格式
        const formattedAddress = {
          id: addressInfo.addressId,
          name: addressInfo.name,
          phone: addressInfo.phone,
          address: addressInfo.address
        };
        
        this.setData({
          addressInfo: formattedAddress
        });
        
        console.log('获取到用户地址：', formattedAddress);
      } else {
        console.log('用户暂未设置收货地址');
        this.setData({
          addressInfo: null
        });
      }
    } catch (error) {
      console.error('获取用户地址失败：', error);
      // 获取地址失败不阻断流程，用户可以手动选择
      this.setData({
        addressInfo: null
      });
    }
  },

  /**
   * 获取可用优惠券数量
   */
  async getAvailableCoupons() {
    try {
      const orderAmount = parseFloat(this.data.totalGoodsAmount);
      const goodsIds = this.data.orderGoods.map(item => item.id);
      
      if (orderAmount <= 0 || goodsIds.length === 0) {
        console.log('订单金额为0或无商品，跳过优惠券查询');
        return;
      }

      console.log('获取可用优惠券数量，订单金额：', orderAmount, '商品ID：', goodsIds);

      const couponResult = await getAvailableCoupons({
        orderAmount: orderAmount,
        goodsIds: goodsIds
      });
      
      if (couponResult.success && couponResult.body) {
        const { availableCount } = couponResult.body;
        
        this.setData({
          availableCoupons: availableCount || 0
        });
        
        console.log('获取到可用优惠券数量：', availableCount);
      } else {
        throw new Error(couponResult.message || '获取优惠券失败');
      }
    } catch (error) {
      console.error('获取优惠券数据失败：', error);
      // 设置默认值，不阻断流程
      this.setData({
        availableCoupons: 0
      });
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
      url: `/pages/coupon/index?from=order-confirm&orderAmount=${orderAmount}&tab=1`,
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
   * 备注输入处理 - 用户输入订单备注信息
   * @param {Event} e - 输入事件对象
   */
  onRemarkInput(e) {
    const remark = e.detail.value;
    // 更新页面数据中的备注内容
    this.setData({
      remark: remark
    });
    console.log('用户输入备注内容：', remark);
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
        console.log('无收货地址，跳过服务端金额计算');
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
      
      console.log('调用服务端金额计算，参数：', params);

      // 调用服务端计算接口
      const result = await calculateOrderAmount(params);
      
      if (result.success && result.body && result.body.amounts) {
        const { goodsAmount, shippingFee, finalAmount } = result.body.amounts;
        
        console.log('服务端计算结果：', result.body);
        
        // 更新金额数据
        this.setData({
          totalGoodsAmount: goodsAmount.toFixed(2),
          shippingFee: shippingFee.toFixed(2),
          finalAmount: finalAmount.toFixed(2)
        });
      } else {
        throw new Error(result.message || '服务端金额计算失败');
      }
      
    } catch (error) {
      console.error('服务端金额计算失败：', error);
      // 计算失败时使用本地计算结果，不阻断流程
      wx.showToast({
        title: '金额计算异常',
        icon: 'none'
      });
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
      // 构建订单数据，严格按照接口文档格式
      const orderData = {
        goods: this.data.orderGoods,
        address: this.data.addressInfo,
        coupon: this.data.selectedCoupon,
        remark: this.data.remark,
        amounts: {
          goodsAmount: parseFloat(this.data.totalGoodsAmount),
          shippingFee: parseFloat(this.data.shippingFee),
          finalAmount: parseFloat(this.data.finalAmount)
        }
      };
      
      console.log('提交的订单数据：', orderData);
      
      // 调用后端接口提交订单
      const result = await createOrder(orderData);
      
      if (result.success && result.body && result.body.order) {
        const { orderId, orderNo } = result.body.order;
        
        console.log('订单创建成功：', result.body);
        
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
            url: `/pages/payment/payment?orderId=${orderId}&orderNo=${orderNo}`,
            fail: () => {
              // 如果支付页面不存在，跳转到订单列表
              wx.redirectTo({
                url: '/pages/order-list/index'
              });
            }
          });
        }, 1500);
      } else {
        throw new Error(result.message || '订单创建失败');
      }
      
    } catch (error) {
      console.error('提交订单失败：', error);
      wx.showModal({
        title: '提交失败',
        content: error.message || '订单提交失败，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试提交
            this.submitOrder();
          }
        }
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
    this.checkAddressUpdate();
    
    // 检查是否有优惠券选择更新
    this.checkCouponUpdate();
  },

  /**
   * 检查地址更新
   */
  checkAddressUpdate() {
    try {
      const selectedAddress = wx.getStorageSync('selectedAddress');
      if (selectedAddress) {
        this.setData({
          addressInfo: selectedAddress
        });
        
        // 地址更新后重新计算金额（可能影响运费）
        this.calculateOrderAmountFromServer();
        
        // 清除临时存储
        wx.removeStorageSync('selectedAddress');
        
        console.log('地址选择已更新：', selectedAddress);
      }
    } catch (error) {
      console.error('检查地址更新失败：', error);
    }
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
        
        // 也可以调用服务端重新计算
        this.calculateOrderAmountFromServer();
        
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