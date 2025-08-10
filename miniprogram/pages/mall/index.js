// 商城页面的主要逻辑文件
// 引入商城API接口
const mallApi = require('../../api/mallApi');

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    // 搜索关键词
    searchKeyword: '',
    
    // 购物车商品数量
    cartCount: 0,
    
    // 秒杀倒计时数据
    countdown: {
      hours: '12',
      minutes: '34',
      seconds: '56'
    },
    
    // 秒杀商品列表（使用API获取，不再使用静态数据）
    seckillProducts: [],
    
    // 轮播Banner数据（使用API获取，不再使用静态数据）
    bannerList: [],
    
    // 商品分组数据（使用API获取，不再使用静态数据）
    productGroups: [],
    
    // 活动列表数据（使用API获取）
    activityList: [],
    
    // 热门活动数据（使用API获取）
    hotActivities: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('商城页面加载完成');
    // 初始化数据
    this.initPageData();
    // 启动秒杀倒计时
    this.startCountdown();
    // 获取购物车数量
    this.getCartCount();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('商城页面显示');
    // 每次显示页面时更新购物车数量
    this.getCartCount();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('商城页面隐藏');
    // 清除倒计时定时器，节省资源
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('商城页面卸载');
    // 清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('用户下拉刷新商城页面');
    // 重新加载页面数据
    this.initPageData();
    // 停止下拉刷新动画
    wx.stopPullDownRefresh();
  },

  /**
   * 初始化页面数据
   */
  initPageData() {
    console.log('初始化商城页面数据');
    // 这里可以调用接口获取最新的商品数据
    // 目前使用mock数据，后期替换为真实接口
    this.loadSeckillProducts();
    this.loadBannerList();
    this.loadProductGroups();
    this.loadActivityList();
    this.loadHotActivities();
  },

  /**
   * 加载秒杀商品数据
   */
  loadSeckillProducts() {
    console.log('加载秒杀商品数据');
    
    // 显示加载状态
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 调用真实API获取秒杀商品数据
    mallApi.getSeckillProducts()
      .then(data => {
        console.log('获取秒杀商品成功：', data);
        
        // 确保数据结构正确，使用接口文档定义的字段名
        const seckillProducts = data.products || [];
        
        // 设置秒杀商品数据
        this.setData({ 
          seckillProducts: seckillProducts 
        });
        
        wx.hideLoading();
      })
      .catch(error => {
        console.error('获取秒杀商品失败：', error);
        
        // 设置默认空数据，避免页面报错
        this.setData({ 
          seckillProducts: [] 
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '获取秒杀商品失败',
          icon: 'none',
          duration: 2000
        });
      });
  },

  /**
   * 加载轮播Banner数据
   */
  loadBannerList() {
    console.log('加载轮播Banner数据');
    
    // 调用真实API获取Banner数据
    mallApi.getBannerList()
      .then(data => {
        console.log('获取Banner数据成功：', data);
        
        // 确保数据结构正确，使用接口文档定义的字段名
        const bannerList = data.bannerList || [];
        
        // 设置Banner数据
        this.setData({ 
          bannerList: bannerList 
        });
      })
      .catch(error => {
        console.error('获取Banner数据失败：', error);
        
        // 设置默认空数据，避免页面报错
        this.setData({ 
          bannerList: [] 
        });
        
        wx.showToast({
          title: '获取轮播图失败',
          icon: 'none',
          duration: 2000
        });
      });
  },

  /**
   * 加载商品分组数据
   */
  loadProductGroups() {
    console.log('加载商品分组数据');
    
    // 调用真实API获取商品分组数据
    mallApi.getProductGroups()
      .then(data => {
        console.log('获取商品分组数据成功：', data);
        
        // 兼容后端返回 body.groups 与 mock 的 productGroups
        const groups = data.productGroups || data.groups || [];

        // 归一化为前端使用的结构：groupId/groupName/groupDesc/products
        const normalizedGroups = groups.map(g => ({
          groupId: g.groupId || g.id,
          groupName: g.groupName,
          groupDesc: g.groupDesc || '',
          products: (g.products || []).map(p => ({
            id: p.id,
            name: p.name || p.title || p.product_name,
            imageUrl: p.imageUrl,
            price: p.price || p.salePrice || p.originalPrice || p.seckillPrice || 0,
            salesCount: p.salesCount || p.sales || 0,
            tag: p.tag || ''
          }))
        }));

        // 设置商品分组数据
        this.setData({ 
          productGroups: normalizedGroups 
        });
      })
      .catch(error => {
        console.error('获取商品分组数据失败：', error);
        
        // 设置默认空数据，避免页面报错
        this.setData({ 
          productGroups: [] 
        });
        
        wx.showToast({
          title: '获取商品数据失败',
          icon: 'none',
          duration: 2000
        });
      });
  },

  /**
   * 加载活动列表数据
   */
  loadActivityList() {
    console.log('加载活动列表数据');
    
    // 调用真实API获取活动列表数据
    mallApi.getActivityList()
      .then(data => {
        console.log('获取活动列表数据成功：', data);
        
        // 确保数据结构正确，使用接口文档定义的字段名
        const activityList = data.activities || [];
        
        // 设置活动列表数据
        this.setData({ 
          activityList: activityList 
        });
      })
      .catch(error => {
        console.error('获取活动列表数据失败：', error);
        
        // 设置默认空数据，避免页面报错
        this.setData({ 
          activityList: [] 
        });
        
        wx.showToast({
          title: '获取活动数据失败',
          icon: 'none',
          duration: 2000
        });
      });
  },

  /**
   * 加载热门活动数据
   */
  loadHotActivities() {
    console.log('加载热门活动数据');
    
    // 调用真实API获取热门活动数据
    mallApi.getHotActivities()
      .then(data => {
        console.log('获取热门活动数据成功：', data);
        
        // 确保数据结构正确，使用接口文档定义的字段名
        const hotActivities = data.activities || [];
        
        // 设置热门活动数据
        this.setData({ 
          hotActivities: hotActivities 
        });
      })
      .catch(error => {
        console.error('获取热门活动数据失败：', error);
        
        // 设置默认空数据，避免页面报错
        this.setData({ 
          hotActivities: [] 
        });
        
        // 热门活动加载失败不影响主要流程，只记录日志
        console.log('使用默认空数据作为热门活动');
      });
  },

  /**
   * 获取购物车商品数量
   */
  getCartCount() {
    console.log('获取购物车商品数量');
    
    // 调用真实API获取购物车数量
    mallApi.getCartCount()
      .then(data => {
        console.log('获取购物车数量成功：', data);
        
        // 确保数据结构正确，使用接口文档定义的字段名
        const cartCount = data.cartCount || 0;
        
        // 设置购物车数量
        this.setData({ cartCount });
        
        // 同步到本地存储，用作备用
        wx.setStorageSync('cartCount', cartCount);
      })
      .catch(error => {
        console.error('获取购物车数量失败：', error);
        
        // 尝试从本地存储获取作为备用
    const cartCount = wx.getStorageSync('cartCount') || 0;
    this.setData({ cartCount });
        
        // 不显示错误提示，购物车数量不是关键功能
        console.log('使用本地存储的购物车数量：', cartCount);
      });
  },

  /**
   * 启动秒杀倒计时
   */
  startCountdown() {
    console.log('启动秒杀倒计时');
    // 设置秒杀结束时间（示例：当前时间 + 2小时）
    const endTime = new Date().getTime() + 2 * 60 * 60 * 1000;
    
    this.countdownTimer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      if (distance > 0) {
        // 计算剩余时间
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // 更新倒计时显示
        this.setData({
          countdown: {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0')
          }
        });
      } else {
        // 倒计时结束
        clearInterval(this.countdownTimer);
        this.setData({
          countdown: { hours: '00', minutes: '00', seconds: '00' }
        });
        console.log('秒杀活动结束');
        // 可以在这里刷新秒杀商品列表
        this.loadSeckillProducts();
      }
    }, 1000);
  },

  /**
   * 搜索输入事件处理
   */
  onSearchInput(event) {
    const searchKeyword = event.detail.value;
    this.setData({ searchKeyword });
    console.log('用户输入搜索关键词：', searchKeyword);
  },

  /**
   * 搜索确认事件处理
   */
  onSearchConfirm(e) {
    console.log('商城首页 - 搜索确认事件触发', e);
    
    let keyword = '';
    
    // 从事件对象获取关键词
    if (e && e.detail && e.detail.value !== undefined) {
      keyword = e.detail.value.trim();
      console.log('从事件对象获取关键词:', keyword);
    } else {
      // 如果事件对象没有值，使用当前数据中的关键词
      keyword = this.data.searchKeyword.trim();
      console.log('从数据对象获取关键词:', keyword);
    }
    
    if (!keyword) {
      console.log('商城首页 - 搜索关键词为空');
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    console.log('商城首页 - 准备跳转到搜索结果页，关键词：', keyword);
    
    // 跳转到搜索结果页面
    wx.navigateTo({
      url: `/pages/search-result/search-result?keyword=${encodeURIComponent(keyword)}`,
      success: (res) => {
        console.log('商城首页 - 成功跳转到搜索结果页', res);
      },
      fail: (error) => {
        console.error('商城首页 - 跳转搜索结果页失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 快速搜索商品（可选：在当前页面显示简单搜索结果）
   */
  quickSearchProducts(keyword) {
    console.log('商城页面快速搜索:', keyword);
    
    // 调用真实API进行搜索
    mallApi.searchProducts({ keyword })
      .then(data => {
        console.log('搜索商品成功：', data);
        
        // 可以在这里处理搜索结果，比如显示在搜索建议中
        const products = data.products || [];
        
        // 这里可以根据需求处理搜索结果
        // 比如显示搜索建议、自动补全等
        console.log('搜索到', products.length, '个商品');
      })
      .catch(error => {
        console.error('搜索商品失败：', error);
        // 搜索失败不影响主要流程，只记录日志
    });
  },

  /**
   * Banner点击事件处理
   */
  onBannerTap(event) {
    const { id, link } = event.currentTarget.dataset;
    console.log('用户点击Banner，ID：', id, '链接：', link);
    
    if (link) {
      wx.navigateTo({
        url: link,
        fail: () => {
          wx.showToast({
            title: '页面暂未开放',
            icon: 'none'
          });
        }
      });
    }
  },

  /**
   * 商品详情跳转
   */
  goToProductDetail(event) {
    const productId = event.currentTarget.dataset.id;
    console.log('跳转到商品详情页，商品ID：', productId);
    
    wx.navigateTo({
      url: `/pages/productDetail/index?id=${productId}`
    });
  },

  /**
   * 查看更多商品
   */
  viewAllProducts(event) {
    const groupId = event.currentTarget.dataset.groupId;
    console.log('查看更多商品，分组ID：', groupId);
    
    // 跳转到搜索结果页面，并传递分类参数
    wx.navigateTo({
      url: `/pages/search-result/search-result?category=${groupId}`,
      success: () => {
        console.log('成功跳转到搜索结果页，分类：', groupId);
      },
      fail: (error) => {
        console.error('跳转搜索结果页失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转到购物车页面
   */
  goToCart() {
    console.log('用户点击购物车按钮');
    
    // 跳转到购物车页面
    wx.navigateTo({
      url: '/pages/cart/cart', // 修正购物车页面路径
      success: () => {
        console.log('成功跳转到购物车页面');
      },
      fail: (error) => {
        console.error('跳转购物车页面失败:', error);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转到限时秒杀页面
   */
  goToSeckillPage(event) {
    console.log('用户点击秒杀模块');
    
    // 获取品牌参数（如果有的话）
    const brand = event.currentTarget.dataset.brand;
    
    let url = '/pages/seckill/index';
    if (brand) {
      // 如果点击的是具体商品，传递品牌参数
      url += `?brand=${encodeURIComponent(brand)}`;
    }
    
    wx.navigateTo({
      url: url,
      success: () => {
        console.log('成功跳转到秒杀页面');
      },
      fail: (error) => {
        console.error('跳转秒杀页面失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转到活动详情页面
   */
  goToActivityDetail(event) {
    const activityId = event.currentTarget.dataset.id;
    console.log('跳转到活动详情页，活动ID：', activityId);
    
    wx.navigateTo({
      url: `/pages/activityDetail/index?id=${activityId}`,
      success: () => {
        console.log('成功跳转到活动详情页');
      },
      fail: (error) => {
        console.error('跳转活动详情页失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转到活动列表页面
   */
  goToActivityList() {
    console.log('用户点击查看更多活动');
    
    wx.navigateTo({
      url: '/pages/activity/index',
      success: () => {
        console.log('成功跳转到活动列表页');
      },
      fail: (error) => {
        console.error('跳转活动列表页失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  }
}); 