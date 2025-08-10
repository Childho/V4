// 限时秒杀页面逻辑
const { formatCountdown, getRemainingTime } = require('../../utils/countdown.js');

// 引入秒杀相关API
import { getSeckillProducts, seckillBuyNow, getCartCount } from '../../api/seckillApi.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 搜索关键词
    searchKeyword: '',
    
    // 品牌筛选相关
    selectedBrand: 'all', // 当前选中的品牌
    brandsExpanded: false, // 品牌列表是否展开
    
    // 品牌列表数据（动态从API加载）
    defaultBrands: [],
    
    // 额外的品牌（动态从API加载）
    extraBrands: [],
    
    // 当前显示的品牌列表
    displayBrands: [],
    
    // 商品列表原始数据
    allProducts: [],
    
    // 过滤后的商品列表
    filteredProducts: [],
    
    // 购物车商品数量
    cartCount: 0,
    
    // 加载状态
    isLoading: false,
    
    // 倒计时定时器
    countdownTimer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('秒杀页面加载，参数：', options);
    
    // 处理页面传参（如从商城首页跳转过来的品牌参数）
    if (options.brand) {
      this.setData({
        selectedBrand: options.brand
      });
    }
    
    // 处理搜索关键词参数
    if (options.keyword) {
      this.setData({
        searchKeyword: options.keyword
      });
    }
    
    // 加载秒杀数据
    this.loadSeckillData();
    
    // 启动倒计时定时器
    this.startCountdown();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 更新购物车数量
    this.updateCartCount();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 清除倒计时定时器
    this.clearCountdown();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清除倒计时定时器
    this.clearCountdown();
  },

  /**
   * 加载秒杀数据（商品列表、品牌数据、购物车数量）
   */
  async loadSeckillData() {
    this.setData({ isLoading: true });
    
    try {
      console.log('[秒杀数据] 开始加载秒杀商品和相关数据');
      
      // 构建请求参数
      const params = {
        page: 1,
        pageSize: 20,
        brand: this.data.selectedBrand,
        keyword: this.data.searchKeyword
      };
      
      // 调用秒杀商品API
      const result = await getSeckillProducts(params);
      
      if (result.success && result.body) {
        console.log('[秒杀数据] API调用成功，返回数据：', result.body);
        
        const { products, defaultBrands, extraBrands, cartCount } = result.body;
        
        // 处理商品数据，确保字段映射正确
        const processedProducts = this.processProductData(products || []);
        
        // 更新页面数据
        this.setData({
          allProducts: processedProducts,
          filteredProducts: processedProducts,
          defaultBrands: defaultBrands || [],
          extraBrands: extraBrands || [],
          cartCount: cartCount || 0,
          isLoading: false
        });
        
        console.log(`[秒杀数据] 成功加载 ${processedProducts.length} 个商品`);
        
      } else {
        throw new Error(result.message || '获取秒杀商品列表失败');
      }
      
    } catch (error) {
      console.error('[秒杀数据] 加载失败:', error);
      
      this.setData({
        isLoading: false
      });
      
      // 显示错误提示并提供重试选项
      wx.showModal({
        title: '加载失败',
        content: error.message || '网络异常，请检查网络连接后重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试加载
            this.loadSeckillData();
          } else {
            // 设置默认数据避免页面空白
            this.setDefaultData();
          }
        }
      });
    }
  },

  /**
   * 处理商品数据，确保字段映射与接口文档一致
   */
  processProductData(products) {
    return products.map(product => ({
      id: product.id || 0,
      brand: product.brand || '',
      brandKey: product.brandKey || '',
      title: product.title || '商品信息缺失',
      imageUrl: product.imageUrl || '',
      seckillPrice: product.seckillPrice || '0.00',
      originalPrice: product.originalPrice || '0.00',
      stock: product.stock || 0,
      soldCount: product.soldCount || 0,
      endTime: product.endTime || '',
      countdownText: product.countdownText || '已结束',
      tags: Array.isArray(product.tags) ? product.tags : []
    }));
  },

  /**
   * 设置默认数据（API失败时的降级处理）
   */
  setDefaultData() {
    const defaultBrands = [
      { key: 'beta', name: '倍特爱' },
      { key: 'lining', name: '李宁' },
      { key: 'victor', name: '威克多' },
      { key: 'super', name: '超牌' }
    ];
    
    const extraBrands = [
      { key: 'lingmei', name: '翎美' },
      { key: 'yashilong', name: '亚狮龙' },
      { key: 'weiken', name: '威肯' },
      { key: 'taiang', name: '泰昂' }
    ];
    
    this.setData({
      allProducts: [],
      filteredProducts: [],
      defaultBrands: defaultBrands,
      extraBrands: extraBrands,
      cartCount: 0
    });
    
    console.log('[秒杀数据] 使用默认数据');
  },



  /**
   * 搜索输入处理
   */
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 搜索确认处理
   */
  onSearchConfirm() {
    console.log('搜索关键词:', this.data.searchKeyword);
    this.filterProducts();
  },

  /**
   * 品牌选择处理
   */
  onBrandSelect(e) {
    const brand = e.currentTarget.dataset.brand;
    console.log('选择品牌：', brand);
    
    this.setData({
      selectedBrand: brand
    }, () => {
      // 重新筛选商品
      this.filterProducts();
    });
  },

  /**
   * 点击"全部"按钮处理（展开/收起 + 选择全部品牌）
   */
  onAllBrandToggle() {
    const { selectedBrand, brandsExpanded } = this.data;
    
    // 如果当前选中的不是"全部"，先选中"全部"
    if (selectedBrand !== 'all') {
      this.setData({
        selectedBrand: 'all'
      }, () => {
        // 重新筛选商品
        this.filterProducts();
      });
    } else {
      // 如果已经选中"全部"，则切换展开/收起状态
      this.setData({
        brandsExpanded: !brandsExpanded
      });
    }
  },

  /**
   * 展开/收起品牌列表（保留原方法，但现在由onAllBrandToggle替代）
   */
  onToggleBrands() {
    this.setData({
      brandsExpanded: !this.data.brandsExpanded
    });
  },

  /**
   * 过滤商品列表（重新调用API获取最新数据）
   */
  filterProducts() {
    console.log('[商品筛选] 筛选条件变更，重新加载数据');
    
    // 重新调用API获取筛选后的数据
    this.loadSeckillData();
  },

  /**
   * 启动倒计时定时器
   */
  startCountdown() {
    this.updateCountdown();
    
    // 每秒更新一次倒计时
    this.setData({
      countdownTimer: setInterval(() => {
        this.updateCountdown();
      }, 1000)
    });
  },

  /**
   * 更新倒计时显示
   */
  updateCountdown() {
    const now = Date.now();
    const products = this.data.filteredProducts.map(product => {
      const remainingTime = getRemainingTime(product.endTime); // 使用工具类获取剩余时间
      
      if (remainingTime > 0) {
        product.countdownText = formatCountdown(remainingTime); // 使用工具类格式化倒计时
        product.stock = product.stock > 0 ? product.stock : 0; // 确保库存不为负数
      } else {
        product.countdownText = '已结束';
        product.stock = 0; // 倒计时结束，库存设为0
      }
      
      return product;
    });
    
    this.setData({
      filteredProducts: products
    });
  },

  /**
   * 清除倒计时定时器
   */
  clearCountdown() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({
        countdownTimer: null
      });
    }
  },

  /**
   * 立即购买处理
   */
  async onBuyNow(e) {
    const productId = parseInt(e.currentTarget.dataset.id);
    const product = this.data.filteredProducts.find(p => p.id === productId);
    
    if (!product || product.stock <= 0) {
      wx.showToast({
        title: '商品已售罄',
        icon: 'none'
      });
      return;
    }
    
    console.log('[秒杀购买] 商品信息:', product);
    
    // 确认购买对话框
    wx.showModal({
      title: '确认秒杀',
      content: `确定要秒杀 ${product.title} 吗？\n秒杀价：¥${product.seckillPrice}`,
      success: async (res) => {
        if (res.confirm) {
          await this.processSeckillBuy(productId, product);
        }
      }
    });
  },

  /**
   * 处理秒杀购买
   */
  async processSeckillBuy(productId, product) {
    try {
      wx.showLoading({ title: '正在抢购...' });
      
      console.log('[秒杀购买] 开始处理购买请求，商品ID:', productId);
      
      // 调用秒杀购买API
      const result = await seckillBuyNow({
        productId: productId,
        quantity: 1
      });
      
      wx.hideLoading();
      
      if (result.success && result.body && result.body.success) {
        console.log('[秒杀购买] 购买成功，返回数据:', result.body);
        
        const { message, orderId, productInfo, remainingStock } = result.body;
        
        // 显示购买成功信息
        wx.showModal({
          title: '秒杀成功！',
          content: `${message}\n订单号：${orderId}`,
          showCancel: false,
          confirmText: '确定',
          success: () => {
            // 更新商品库存
            this.updateProductStock(productId, remainingStock);
            
            // 更新购物车数量
            this.updateCartCount();
          }
        });
        
      } else {
        throw new Error(result.body?.message || result.message || '秒杀失败');
      }
      
    } catch (error) {
      wx.hideLoading();
      console.error('[秒杀购买] 购买失败:', error);
      
      // 处理不同类型的错误
      let errorMessage = '秒杀失败，请重试';
      
      if (error.message) {
        if (error.message.includes('库存不足')) {
          errorMessage = '商品已被抢完，下次要更快哦！';
        } else if (error.message.includes('重复购买')) {
          errorMessage = '您已购买过此商品，每人限购1件';
        } else if (error.message.includes('秒杀结束')) {
          errorMessage = '秒杀活动已结束';
        } else if (error.message.includes('未登录')) {
          errorMessage = '请先登录再进行秒杀';
        } else {
          errorMessage = error.message;
        }
      }
      
      wx.showModal({
        title: '秒杀失败',
        content: errorMessage,
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试购买
            this.processSeckillBuy(productId, product);
          }
        }
      });
    }
  },

  /**
   * 更新商品库存
   */
  updateProductStock(productId, remainingStock) {
    const updatedAllProducts = this.data.allProducts.map(p => {
      if (p.id === productId) {
        p.stock = remainingStock;
        p.soldCount = p.soldCount + 1;
      }
      return p;
    });
    
    const updatedFilteredProducts = this.data.filteredProducts.map(p => {
      if (p.id === productId) {
        p.stock = remainingStock;
        p.soldCount = p.soldCount + 1;
      }
      return p;
    });
    
    this.setData({
      allProducts: updatedAllProducts,
      filteredProducts: updatedFilteredProducts
    });
    
    console.log(`[库存更新] 商品${productId}库存更新为: ${remainingStock}`);
  },

  /**
   * 跳转到商品详情页
   */
  goToProductDetail(e) {
    const productId = e.currentTarget.dataset.id;
    console.log('跳转到商品详情页:', productId);
    
    // 这里跳转到商品详情页
    wx.navigateTo({
      url: `/pages/productDetail/index?id=${productId}&from=seckill`
    });
  },

  /**
   * 跳转到购物车页面
   */
  goToCart() {
    console.log('跳转到购物车页面');
    
    // 这里跳转到购物车页面
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 更新购物车数量
   */
  async updateCartCount() {
    try {
      console.log('[购物车数量] 开始获取购物车数量');
      
      // 调用购物车数量API
      const result = await getCartCount();
      
      if (result.success && result.body) {
        const cartCount = result.body.cartCount || 0;
        
        this.setData({
          cartCount: cartCount
        });
        
        console.log('[购物车数量] 获取成功，数量:', cartCount);
      } else {
        throw new Error(result.message || '获取购物车数量失败');
      }
      
    } catch (error) {
      console.error('[购物车数量] 获取失败:', error);
      
      // 获取失败时从本地缓存读取，或设为0
      const localCartCount = wx.getStorageSync('cartCount') || 0;
      this.setData({
        cartCount: localCartCount
      });
      
      console.log('[购物车数量] 使用本地缓存数量:', localCartCount);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('[下拉刷新] 用户下拉刷新');
    
    // 重新加载秒杀数据
    this.loadSeckillData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('上拉加载更多');
    // 这里可以实现分页加载更多商品
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '限时秒杀 - 羽毛球装备特价促销',
      path: '/pages/seckill/index',
      imageUrl: '/assets/images/share-seckill.jpg'
    };
  }
}); 