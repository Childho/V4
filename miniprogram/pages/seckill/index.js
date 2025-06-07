// 限时秒杀页面逻辑
const { formatCountdown, getRemainingTime, generateRandomEndTime } = require('../../utils/countdown.js');

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
    
    // 品牌列表数据（默认显示的品牌）
    defaultBrands: [
      { key: 'all', name: '全部' },
      { key: 'beta', name: '倍特爱' },
      { key: 'lining', name: '李宁' },
      { key: 'victor', name: '威克多' },
      { key: 'super', name: '超牌' }
    ],
    
    // 额外的品牌（点击"全部"展开显示）
    extraBrands: [
      { key: 'lingmei', name: '翎美' },
      { key: 'yashilong', name: '亚狮龙' },
      { key: 'weiken', name: '威肯' },
      { key: 'taiang', name: '泰昂' }
    ],
    
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
    
    // 初始化品牌列表
    this.initBrandList();
    
    // 加载商品数据
    this.loadProductData();
    
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
   * 初始化品牌列表
   */
  initBrandList() {
    this.setData({
      displayBrands: this.data.defaultBrands
    });
  },

  /**
   * 加载商品数据（这里使用mock数据，实际项目中应该调用API）
   */
  loadProductData() {
    this.setData({ isLoading: true });
    
    // 模拟API请求延迟
    setTimeout(() => {
      const mockProducts = this.generateMockProducts();
      this.setData({
        allProducts: mockProducts,
        isLoading: false
      }, () => {
        // 数据加载完成后进行筛选
        this.filterProducts();
      });
    }, 1000);
  },

  /**
   * 生成mock商品数据
   */
  generateMockProducts() {
    const brands = ['beta', 'lining', 'victor', 'super', 'lingmei', 'yashilong', 'weiken', 'taiang'];
    const brandNames = {
      'beta': '倍特爱',
      'lining': '李宁',
      'victor': '威克多',
      'super': '超牌',
      'lingmei': '翎美',
      'yashilong': '亚狮龙',
      'weiken': '威肯',
      'taiang': '泰昂'
    };
    
    const products = [];
    
    // 生成20个mock商品
    for (let i = 1; i <= 20; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const endTime = generateRandomEndTime(1, 24); // 使用工具类生成随机结束时间
      
      products.push({
        id: i,
        brand: brandNames[brand],
        brandKey: brand,
        title: `${brandNames[brand]}羽毛球拍碳纤维单拍超轻进攻型专业比赛拍子${i}`,
        imageUrl: `https://picsum.photos/400/400?random=${i}`, // 使用随机图片服务
        seckillPrice: (Math.random() * 200 + 50).toFixed(2), // 秒杀价格：50-250
        originalPrice: (Math.random() * 300 + 200).toFixed(2), // 原价：200-500
        stock: Math.floor(Math.random() * 100) + 1, // 库存：1-100
        soldCount: Math.floor(Math.random() * 500), // 已售数量
        endTime: endTime,
        countdownText: formatCountdown(getRemainingTime(endTime)), // 使用工具类格式化倒计时
        tags: this.getRandomTags()
      });
    }
    
    return products;
  },

  /**
   * 获取随机标签
   */
  getRandomTags() {
    const allTags = ['包邮', '正品', '现货', '热销', '新品', '特价'];
    const tagCount = Math.floor(Math.random() * 3) + 1; // 1-3个标签
    const tags = [];
    
    for (let i = 0; i < tagCount; i++) {
      const tag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    return tags;
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
    console.log('选择品牌:', brand);
    
    this.setData({
      selectedBrand: brand
    }, () => {
      this.filterProducts();
    });
  },

  /**
   * 切换品牌列表展开/收起
   */
  onToggleBrands() {
    const expanded = !this.data.brandsExpanded;
    let displayBrands = [];
    
    if (expanded) {
      // 展开：显示所有品牌
      displayBrands = [...this.data.defaultBrands, ...this.data.extraBrands];
    } else {
      // 收起：只显示默认品牌
      displayBrands = this.data.defaultBrands;
    }
    
    this.setData({
      brandsExpanded: expanded,
      displayBrands: displayBrands
    });
  },

  /**
   * 过滤商品列表
   */
  filterProducts() {
    let filtered = [...this.data.allProducts];
    
    // 按品牌筛选
    if (this.data.selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brandKey === this.data.selectedBrand);
    }
    
    // 按搜索关键词筛选
    if (this.data.searchKeyword.trim()) {
      const keyword = this.data.searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(keyword) ||
        product.brand.toLowerCase().includes(keyword)
      );
    }
    
    console.log('过滤后的商品数量:', filtered.length);
    
    this.setData({
      filteredProducts: filtered
    });
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
  onBuyNow(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.filteredProducts.find(p => p.id === productId);
    
    if (!product || product.stock <= 0) {
      wx.showToast({
        title: '商品已售罄',
        icon: 'none'
      });
      return;
    }
    
    console.log('立即购买商品:', product);
    
    // 这里可以跳转到订单确认页面或者加入购物车
    wx.showModal({
      title: '确认购买',
      content: `确定要购买 ${product.title} 吗？`,
      success: (res) => {
        if (res.confirm) {
          // 模拟购买成功
          wx.showToast({
            title: '购买成功！',
            icon: 'success'
          });
          
          // 更新购物车数量
          this.setData({
            cartCount: this.data.cartCount + 1
          });
          
          // 减少商品库存
          const updatedProducts = this.data.filteredProducts.map(p => {
            if (p.id === productId) {
              p.stock = Math.max(0, p.stock - 1);
              p.soldCount += 1;
            }
            return p;
          });
          
          this.setData({
            filteredProducts: updatedProducts
          });
        }
      }
    });
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
      url: '/pages/cart/index'
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
  updateCartCount() {
    // 这里从缓存或API获取购物车数量
    // 模拟获取购物车数量
    const cartCount = wx.getStorageSync('cartCount') || 0;
    this.setData({
      cartCount: cartCount
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadProductData();
    wx.stopPullDownRefresh();
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