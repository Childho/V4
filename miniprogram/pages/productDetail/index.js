// 商品详情页面
import { 
  getProductDetail, 
  getProductComments, 
  getRelatedProducts, 
  addToCart, 
  getCartCount,
  buyNow 
} from '../../api/productApi';

// 引入优惠券相关API
import { 
  getCouponList, 
  getAvailableCouponCount 
} from '../../api/couponApi';

// 引入地址相关API
import { getAddressList } from '../../api/addressApi';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,               // 页面加载状态，默认false避免初始白屏
    cartCount: 0,                 // 购物车商品数量
    showSpecsPopup: false,        // 是否显示规格选择弹窗
    quantity: 1,                  // 选择的商品数量
    selectedSpecs: '',            // 已选择的规格文本显示
    selectedOptions: {},          // 已选择的规格选项数据
    currentAction: '',            // 当前操作：'cart'加入购物车 或 'buy'立即购买
    orderRemark: '',              // 订单备注信息
    
    // 优惠券相关数据
    availableCouponCount: 0,      // 可用优惠券数量
    selectedCoupon: null,         // 已选择的优惠券
    
    // 地址相关数据
    defaultAddress: null,        // 默认收货地址对象
    shippingFee: '包邮',         // 运费信息文本
    
    // 商品信息 - 设置默认值避免页面空白
    product: {
      id: '',
      name: '商品信息加载中...',
      price: '0.00',
      originalPrice: '',
      description: '商品描述加载中...',
      brand: '',
      salesCount: 0,
      shippingInfo: '24小时发货',
      images: [
        // 设置默认占位图，避免轮播图显示异常
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWVhuWTgeWbvueJh+WKoOi9veS4rS4uLjwvdGV4dD48L3N2Zz4='
      ],
      specs: [],
      detailContent: '<p style="text-align:center;color:#999;">详情加载中...</p>',
      optionGroups: []
    },
    
    // 评论数据
    comments: {
      total: 0,
      averageRating: 5.0,
      tags: [],
      list: []
    },
    
    // 相关推荐商品
    relatedProducts: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('[Product Detail] onLoad options:', options);
    
    const { id } = options;
    
    if (!id) {
      // 如果没有商品ID，显示错误并返回
      wx.showToast({
        title: '商品ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 设置商品ID
    this.setData({
      'product.id': id
    });
    
    // 延迟一小段时间再加载数据，确保页面已渲染
    setTimeout(() => {
      this.loadPageData(id);
    }, 100);
  },

  /**
   * 页面显示时的处理
   */
  onShow() {
    // 更新购物车数量
    this.updateCartCount();
    
    // 获取选中的优惠券（从优惠券页面返回时）
    const selectedCoupon = wx.getStorageSync('selectedCoupon');
    if (selectedCoupon) {
      this.setData({ selectedCoupon });
      // 清除本地存储中的优惠券数据，避免重复使用
      wx.removeStorageSync('selectedCoupon');
    }

    // 加载默认收货地址
    this.loadDefaultAddress();
  },

  /**
   * 并行加载页面所需的所有数据
   */
  async loadPageData(productId) {
    console.log('[Product Detail] 开始加载商品数据, productId:', productId);
    
    try {
      this.setData({ loading: true });
      
      // 先加载商品基本信息，再并行加载其他数据
      const productData = await this.getProductDetail(productId);
      
      if (productData) {
        this.setData({ product: productData });
        console.log('[Product Detail] 商品数据加载成功:', productData);
      }
      
      // 并行加载评论、购物车数量和优惠券数量
      const [commentsData, cartCountData, couponCountData] = await Promise.allSettled([
        this.getProductComments(productId),
        this.getCartCount(),
        this.getAvailableCouponCount()
      ]);

      // 处理评论数据
      if (commentsData.status === 'fulfilled' && commentsData.value) {
        this.setData({ comments: commentsData.value });
      }

      // 处理购物车数量
      if (cartCountData.status === 'fulfilled' && cartCountData.value !== undefined) {
        this.setData({ cartCount: cartCountData.value });
      }

      // 处理优惠券数量
      if (couponCountData.status === 'fulfilled' && couponCountData.value !== undefined) {
        this.setData({ availableCouponCount: couponCountData.value });
      }

      // 加载相关推荐
      this.getRelatedProducts(productId);

    } catch (error) {
      console.error('[Load Page Data Error]', error);
      wx.showToast({
        title: '页面加载失败',
        icon: 'none'
      });
    } finally {
      // 确保loading状态会被关闭
      this.setData({ loading: false });
    }
  },

  /**
   * 获取商品详情
   */
  async getProductDetail(productId) {
    try {
      console.log('[Product Detail] 获取商品详情，商品ID：', productId);
      
      const result = await getProductDetail(productId);
      
      if (result.success && result.body && result.body.product) {
        const productData = result.body.product;
        
        console.log('[Product Detail] 商品详情获取成功：', productData);
        
        // 确保必要字段存在，使用默认值
        return {
          id: productData.id || productId,
          name: productData.name || '商品名称',
          price: productData.price || '0.00',
          originalPrice: productData.originalPrice || '',
          description: productData.description || '暂无商品描述',
          brand: productData.brand || '',
          salesCount: productData.salesCount || 0,
          shippingInfo: productData.shippingInfo || '24小时发货',
          images: productData.images && productData.images.length > 0 ? productData.images : [
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWVhuWTgeWbvueJh+WKoOi9veS4rS4uLjwvdGV4dD48L3N2Zz4='
          ],
          specs: productData.specs || [],
          detailContent: productData.detailContent || '<p style="text-align:center;color:#999;">详情加载中...</p>',
          optionGroups: productData.optionGroups || []
        };
      } else {
        throw new Error(result.message || '获取商品详情失败');
      }
    } catch (error) {
      console.error('[Product Detail] 获取商品详情失败：', error);
      
      // 显示错误并返回默认数据结构
      wx.showToast({
        title: '商品详情加载失败',
        icon: 'none'
      });
      
      return {
        id: productId,
        name: '商品信息加载失败',
        price: '0.00',
        originalPrice: '',
        description: '网络异常，请重试',
        brand: '',
        salesCount: 0,
        shippingInfo: '24小时发货',
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWVhuWTgeWbvueJh+WKoOi9veS4rS4uLjwvdGV4dD48L3N2Zz4='
        ],
        specs: [],
        detailContent: '<p style="text-align:center;color:#999;">详情加载失败</p>',
        optionGroups: []
      };
    }
  },

  /**
   * 获取商品评论
   */
  async getProductComments(productId) {
    try {
      console.log('[Product Detail] 获取商品评论，商品ID：', productId);
      
      const result = await getProductComments(productId, 1, 10, 'all');
      
      if (result.success && result.body && result.body.comments) {
        const commentsData = result.body.comments;
        
        console.log('[Product Detail] 评论数据获取成功：', commentsData);
        
        // 确保必要字段存在，使用默认值
        return {
          total: commentsData.total || 0,
          averageRating: commentsData.averageRating || 5.0,
          tags: commentsData.tags || [],
          list: commentsData.list || []
        };
      } else {
        throw new Error(result.message || '获取评论失败');
      }
    } catch (error) {
      console.error('[Product Detail] 获取商品评论失败：', error);
      
      // 返回默认评论数据结构
      return {
        total: 0,
        averageRating: 5.0,
        tags: [],
        list: []
      };
    }
  },

  /**
   * 获取相关推荐商品
   */
  async getRelatedProducts(productId) {
    try {
      console.log('[Product Detail] 获取相关推荐商品，商品ID：', productId);
      
      const result = await getRelatedProducts(productId, 10);
      
      if (result.success && result.body && result.body.relatedProducts) {
        const relatedProducts = result.body.relatedProducts;
        
        console.log('[Product Detail] 推荐商品获取成功：', relatedProducts);
        
        this.setData({ relatedProducts: relatedProducts });
      } else {
        throw new Error(result.message || '获取推荐商品失败');
      }
    } catch (error) {
      console.error('[Product Detail] 获取相关推荐商品失败：', error);
      
      // 设置空数组，不显示推荐区域
      this.setData({ relatedProducts: [] });
    }
  },

  /**
   * 获取购物车数量
   */
  async getCartCount() {
    try {
      console.log('[Product Detail] 获取购物车数量');
      
      const result = await getCartCount();
      
      if (result.success && result.body && typeof result.body.cartCount === 'number') {
        console.log('[Product Detail] 购物车数量获取成功：', result.body.cartCount);
        return result.body.cartCount;
      } else {
        throw new Error(result.message || '获取购物车数量失败');
      }
    } catch (error) {
      console.error('[Product Detail] 获取购物车数量失败：', error);
      return 0; // 返回默认值
    }
  },

  /**
   * 获取可用优惠券数量
   */
  async getAvailableCouponCount() {
    try {
      console.log('[Product Detail] 获取可用优惠券数量');
      
      const result = await getAvailableCouponCount();
      
      if (result.success && result.body && typeof result.body.availableCount === 'number') {
        console.log('[Product Detail] 可用优惠券数量获取成功：', result.body.availableCount);
        return result.body.availableCount;
      } else {
        throw new Error(result.message || '获取优惠券数量失败');
      }
    } catch (error) {
      console.error('[Product Detail] 获取可用优惠券数量失败：', error);
      return 0; // 返回默认值
    }
  },

  /**
   * 显示规格选择弹窗
   */
  showSpecsPopup() {
    this.setData({ showSpecsPopup: true });
  },

  /**
   * 关闭规格选择弹窗
   */
  closeSpecsPopup() {
    this.setData({ 
      showSpecsPopup: false,
      orderRemark: '' // 关闭弹窗时清空备注
    });
  },

  /**
   * 选择规格选项
   */
  selectOption(e) {
    const { groupIndex, optionIndex } = e.currentTarget.dataset;
    const { product, selectedOptions } = this.data;
    
    // 更新选中状态
    const optionGroups = [...product.optionGroups];
    const group = optionGroups[groupIndex];
    
    // 清除该组的其他选项
    group.options.forEach(option => option.selected = false);
    // 选中当前选项
    group.options[optionIndex].selected = true;
    
    // 更新已选规格数据
    selectedOptions[group.name] = group.options[optionIndex].value;
    
    this.setData({
      'product.optionGroups': optionGroups,
      selectedOptions
    });
    
    // 更新规格显示文本
    this.updateSelectedSpecs();
  },

  /**
   * 更新已选择规格的显示文本
   */
  updateSelectedSpecs() {
    const { selectedOptions } = this.data;
    const specsArray = Object.values(selectedOptions);
    const specsText = specsArray.length > 0 ? specsArray.join(' ') : '';
    
    this.setData({ selectedSpecs: specsText });
  },

  /**
   * 减少数量
   */
  decreaseQuantity() {
    const quantity = Math.max(1, this.data.quantity - 1);
    this.setData({ quantity });
  },

  /**
   * 增加数量
   */
  increaseQuantity() {
    const quantity = this.data.quantity + 1;
    this.setData({ quantity });
  },

  /**
   * 添加到购物车按钮点击
   */
  handleAddToCart() {
    // 检查规格是否完整选择
    if (!this.checkAllSpecsSelected()) {
      this.setData({ 
        currentAction: 'cart',
        showSpecsPopup: true 
      });
      return;
    }
    
    // 直接添加到购物车
    this.confirmAddToCart();
  },

  /**
   * 立即购买按钮点击
   */
  handleBuyNow() {
    // 检查规格是否完整选择
    if (!this.checkAllSpecsSelected()) {
      this.setData({ 
        currentAction: 'buy',
        showSpecsPopup: true 
      });
      return;
    }
    
    // 直接购买
    this.confirmBuyNow();
  },

  /**
   * 确认添加到购物车
   */
  async confirmAddToCart() {
    const { product, quantity, selectedOptions, orderRemark } = this.data;
    
    try {
      wx.showLoading({ title: '添加中...' });
      
      console.log('[Product Detail] 添加到购物车，参数：', {
        productId: product.id,
        quantity,
        specs: selectedOptions,
        remark: orderRemark
      });
      
      const result = await addToCart({
        productId: product.id,
        quantity,
        specs: selectedOptions,
        remark: orderRemark
      });
      
      if (result.success) {
        wx.showToast({
          title: '已加入购物车',
          icon: 'success'
        });
        
        console.log('[Product Detail] 添加购物车成功');
        
        // 更新购物车数量
        this.updateCartCount();
        
        // 关闭弹窗并清空备注
        this.closeSpecsPopup();
        this.setData({ orderRemark: '' });
      } else {
        throw new Error(result.message || '添加到购物车失败');
      }
      
    } catch (error) {
      console.error('[Product Detail] 添加到购物车失败：', error);
      
      wx.showModal({
        title: '添加失败',
        content: error.message || '添加到购物车失败，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试添加
            this.confirmAddToCart();
          }
        }
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 确认立即购买
   */
  async confirmBuyNow() {
    const { product, quantity, selectedOptions, orderRemark } = this.data;
    
    try {
      wx.showLoading({ title: '正在跳转...' });
      
      console.log('[Product Detail] 立即购买，参数：', {
        productId: product.id,
        quantity,
        specs: selectedOptions,
        remark: orderRemark
      });
      
      const result = await buyNow({
        productId: product.id,
        quantity,
        specs: selectedOptions,
        remark: orderRemark
      });
      
      if (result.success && result.body && result.body.orderData) {
        const orderData = result.body.orderData;
        
        console.log('[Product Detail] 获取订单预览成功：', orderData);
        
        // 关闭弹窗并清空备注
        this.closeSpecsPopup();
        this.setData({ orderRemark: '' });
        
        // 跳转到订单确认页，传递订单数据
        const goodsData = [{
          id: orderData.product.productId,
          name: orderData.product.name,
          image: orderData.product.image,
          spec: orderData.product.spec,
          price: orderData.product.price,
          quantity: orderData.product.quantity
        }];
        
        wx.navigateTo({
          url: `/pages/order-confirm/order-confirm?goods=${encodeURIComponent(JSON.stringify(goodsData))}&source=detail`
        });
      } else {
        throw new Error(result.message || '获取订单预览失败');
      }
      
    } catch (error) {
      console.error('[Product Detail] 立即购买失败：', error);
      
      wx.showModal({
        title: '购买失败',
        content: error.message || '无法跳转到订单确认页，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试购买
            this.confirmBuyNow();
          }
        }
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 更新购物车数量
   */
  async updateCartCount() {
    try {
      const count = await this.getCartCount();
      this.setData({ cartCount: count });
    } catch (error) {
      console.error('[Update Cart Count Error]', error);
    }
  },

  /**
   * 检查是否所有规格都已选择
   */
  checkAllSpecsSelected() {
    const { product, selectedOptions } = this.data;
    
    if (!product.optionGroups || product.optionGroups.length === 0) {
      return true; // 没有规格选项，视为已完成选择
    }
    
    return product.optionGroups.every(group => 
      selectedOptions[group.name] !== undefined
    );
  },

  /**
   * 跳转到购物车
   */
  handleToCart() {
    console.log('[Product Detail] 点击购物车按钮，准备跳转到购物车页面');
    
    // 直接跳转到购物车页面 - 使用正确的路径
    wx.navigateTo({
      url: '/pages/cart/cart',  // 确认为实际的购物车页面路径
      success: () => {
        console.log('[Product Detail] 成功跳转到购物车页面');
      },
      fail: (error) => {
        console.error('[Product Detail] 跳转购物车页面失败:', error);
        wx.showToast({
          title: '购物车页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 跳转到评论详情页
   */
  navigateToComments() {
    const { product } = this.data;
    
    console.log('[Product Detail] 跳转到评论详情页，商品信息:', product);
    
    if (!product.id) {
      wx.showToast({
        title: '商品信息异常',
        icon: 'none'
      });
      return;
    }
    
    // 构建跳转URL
    const productName = product.name || '商品详情';
    const productImage = product.images && product.images[0] ? product.images[0] : '';
    const targetUrl = `/pages/comment-detail/index?productId=${product.id}&productName=${encodeURIComponent(productName)}&productImage=${encodeURIComponent(productImage)}`;
    
    console.log('[Product Detail] 跳转URL:', targetUrl);
    
    // 跳转到评论详情页，传递商品信息
    wx.navigateTo({
      url: targetUrl,
      success: () => {
        console.log('[Product Detail] 跳转成功');
      },
      fail: (error) => {
        console.error('[Product Detail] 跳转失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转到相关商品详情
   */
  navigateToProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.redirectTo({
      url: `/pages/productDetail/index?id=${id}`
    });
  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { product } = this.data;
    return {
      title: product.name || '精选好物推荐',
      path: `/pages/productDetail/index?id=${product.id}`,
      imageUrl: product.images[0] || ''
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { product } = this.data;
    return {
      title: `${product.name} - 仅需¥${product.price}`,
      imageUrl: product.images[0] || ''
    };
  },

  /**
   * 备注输入处理
   */
  onRemarkInput(e) {
    const remark = e.detail.value;
    this.setData({ orderRemark: remark });
  },

  /**
   * 选择优惠券
   */
  handleSelectCoupon() {
    const { product } = this.data;
    
    // 计算当前商品的预估订单金额
    const orderAmount = parseFloat(product.price) * this.data.quantity;
    
    // 跳转到优惠券选择页面
    wx.navigateTo({
      url: `/pages/coupon/index?from=order-confirm&orderAmount=${orderAmount}&tab=1`,
      success: () => {
        console.log('[Product Detail] 跳转到优惠券选择页面成功');
      },
      fail: (error) => {
        console.error('[Product Detail] 跳转优惠券页面失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转到地址管理/选择页面
   */
  navigateToAddress() {
    wx.navigateTo({
      url: '/pages/address-list/index?from=order-confirm',
      success: () => {
        console.log('[Product Detail] 跳转到地址列表页面成功');
      },
      fail: (error) => {
        console.error('[Product Detail] 跳转地址列表失败:', error);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /**
   * 加载默认收货地址
   */
  async loadDefaultAddress() {
    try {
      // 先尝试从本地缓存读取
      const cached = wx.getStorageSync('defaultAddress');
      if (cached) {
        this.setData({ defaultAddress: cached });
      }
      // 再从接口刷新，以确保数据最新
      const list = await getAddressList();
      if (Array.isArray(list) && list.length > 0) {
        const def = list.find(item => item.isDefault) || list[0];
        this.setData({ defaultAddress: def });
        wx.setStorageSync('defaultAddress', def);
      }
    } catch (error) {
      console.error('[Load Default Address Error]', error);
    }
  },
}); 