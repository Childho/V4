// 商城页面的主要逻辑文件
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
    
    // 秒杀商品列表（mock数据，后期替换为接口数据）
    seckillProducts: [
      {
        id: 1,
        title: 'YONEX尤尼克斯羽毛球拍',
        imageUrl: '/assets/images/racket1.jpg',
        originalPrice: 899,
        seckillPrice: 599
      },
      {
        id: 2,
        title: 'Victor胜利羽毛球鞋',
        imageUrl: '/assets/images/shoes1.jpg',
        originalPrice: 699,
        seckillPrice: 399
      },
      {
        id: 3,
        title: 'RSL亚狮龙羽毛球',
        imageUrl: '/assets/images/ball1.jpg',
        originalPrice: 89,
        seckillPrice: 59
      },
      {
        id: 4,
        title: 'MIZUNO美津浓运动服',
        imageUrl: '/assets/images/clothes1.jpg',
        originalPrice: 299,
        seckillPrice: 199
      },
      {
        id: 5,
        title: 'KAWASAKI川崎羽毛球包',
        imageUrl: '/assets/images/bag1.jpg',
        originalPrice: 189,
        seckillPrice: 129
      }
    ],
    
    // 轮播Banner数据（mock数据，后期替换为接口数据）
    bannerList: [
      {
        id: 1,
        imageUrl: '/assets/images/banner1.jpg',
        link: '/pages/activityDetail/index?id=1'
      },
      {
        id: 2,
        imageUrl: '/assets/images/banner2.jpg',
        link: '/pages/activityDetail/index?id=2'
      },
      {
        id: 3,
        imageUrl: '/assets/images/banner3.jpg',
        link: '/pages/productDetail/index?id=10'
      }
    ],
    
    // 商品分组数据（mock数据，后期替换为接口数据）
    productGroups: [
      {
        groupId: 'racket',
        groupName: '羽毛球拍',
        groupDesc: '专业球拍，助你提升球技',
        products: [
          {
            id: 101,
            name: 'YONEX尤尼克斯ARC-11羽毛球拍',
            imageUrl: '/assets/images/racket1.jpg',
            price: 899,
            salesCount: 268,
            tag: '热销'
          },
          {
            id: 102,
            name: 'Victor胜利挑战者9500羽毛球拍',
            imageUrl: '/assets/images/racket2.jpg',
            price: 599,
            salesCount: 156,
            tag: '新品'
          },
          {
            id: 103,
            name: 'KAWASAKI川崎EXPLORE 850羽毛球拍',
            imageUrl: '/assets/images/racket3.jpg',
            price: 459,
            salesCount: 89,
            tag: ''
          },
          {
            id: 104,
            name: 'MIZUNO美津浓FORTIUS 30羽毛球拍',
            imageUrl: '/assets/images/racket4.jpg',
            price: 1299,
            salesCount: 45,
            tag: '专业'
          }
        ]
      },
      {
        groupId: 'shoes',
        groupName: '羽毛球鞋',
        groupDesc: '专业球鞋，稳定支撑每一步',
        products: [
          {
            id: 201,
            name: 'YONEX尤尼克斯POWER CUSHION65Z2羽毛球鞋',
            imageUrl: '/assets/images/shoes1.jpg',
            price: 699,
            salesCount: 324,
            tag: '热销'
          },
          {
            id: 202,
            name: 'Victor胜利A922羽毛球鞋',
            imageUrl: '/assets/images/shoes2.jpg',
            price: 499,
            salesCount: 198,
            tag: ''
          },
          {
            id: 203,
            name: 'KAWASAKI川崎K-080羽毛球鞋',
            imageUrl: '/assets/images/shoes3.jpg',
            price: 359,
            salesCount: 167,
            tag: '性价比'
          },
          {
            id: 204,
            name: 'MIZUNO美津浓WAVE FANG ZERO羽毛球鞋',
            imageUrl: '/assets/images/shoes4.jpg',
            price: 899,
            salesCount: 76,
            tag: '专业'
          }
        ]
      },
      {
        groupId: 'accessories',
        groupName: '运动配件',
        groupDesc: '运动装备，提升运动体验',
        products: [
          {
            id: 301,
            name: 'RSL亚狮龙7号羽毛球',
            imageUrl: '/assets/images/ball1.jpg',
            price: 89,
            salesCount: 456,
            tag: '热销'
          },
          {
            id: 302,
            name: 'YONEX尤尼克斯羽毛球包',
            imageUrl: '/assets/images/bag1.jpg',
            price: 189,
            salesCount: 234,
            tag: ''
          },
          {
            id: 303,
            name: 'Victor胜利护腕套装',
            imageUrl: '/assets/images/wrist1.jpg',
            price: 59,
            salesCount: 189,
            tag: '实用'
          },
          {
            id: 304,
            name: 'KAWASAKI川崎运动毛巾',
            imageUrl: '/assets/images/towel1.jpg',
            price: 29,
            salesCount: 321,
            tag: ''
          }
        ]
      }
    ]
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
  },

  /**
   * 加载秒杀商品数据
   */
  loadSeckillProducts() {
    // TODO: 替换为真实的接口调用
    console.log('加载秒杀商品数据');
    // 示例接口调用（需要后期实现）
    // const seckillApi = require('../../api/seckillApi');
    // seckillApi.getSeckillProducts().then(data => {
    //   this.setData({ seckillProducts: data });
    // });
  },

  /**
   * 加载轮播Banner数据
   */
  loadBannerList() {
    // TODO: 替换为真实的接口调用
    console.log('加载轮播Banner数据');
    // 示例接口调用（需要后期实现）
    // const bannerApi = require('../../api/bannerApi');
    // bannerApi.getBannerList().then(data => {
    //   this.setData({ bannerList: data });
    // });
  },

  /**
   * 加载商品分组数据
   */
  loadProductGroups() {
    // TODO: 替换为真实的接口调用
    console.log('加载商品分组数据');
    // 示例接口调用（需要后期实现）
    // const productApi = require('../../api/productApi');
    // productApi.getProductGroups().then(data => {
    //   this.setData({ productGroups: data });
    // });
  },

  /**
   * 获取购物车商品数量
   */
  getCartCount() {
    // 从本地存储或接口获取购物车数量
    const cartCount = wx.getStorageSync('cartCount') || 0;
    this.setData({ cartCount });
    console.log('当前购物车商品数量：', cartCount);
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
  onSearchConfirm() {
    const { searchKeyword } = this.data;
    if (!searchKeyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    console.log('执行搜索，关键词：', searchKeyword);
    // TODO: 跳转到搜索结果页面或执行搜索逻辑
    wx.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(searchKeyword)}`
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
    
    // TODO: 跳转到商品列表页面
    wx.navigateTo({
      url: `/pages/productList/index?category=${groupId}`,
      fail: () => {
        wx.showToast({
          title: '页面暂未开放',
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
    
    // TODO: 跳转到购物车页面
    wx.navigateTo({
      url: '/pages/cart/index',
      fail: () => {
        wx.showToast({
          title: '购物车功能开发中',
          icon: 'none'
        });
      }
    });
  }
}); 