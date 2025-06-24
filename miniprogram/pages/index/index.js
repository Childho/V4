// index.js
// 获取应用实例
const app = getApp()

// 引入系统信息工具函数
import { getStatusBarHeight } from '../../utils/systemInfo.js'

Page({
  data: {
    statusBarHeight: 0,
    searchKeyword: '', // 搜索关键词数据
    // 优化后的轮播图数据 - 添加更美观的图片和文案
    banners: [
      {
        id: 'banner_1',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800', // 网球主题图片
        type: 'activity',
        linkId: 'activity_1',
        title: '夏季网球训练营',
        subtitle: '专业教练指导，提升你的网球技能'
      },
      {
        id: 'banner_2', 
        imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800', // 网球装备图片
        type: 'product',
        linkId: 'product_1',
        title: '精选网球装备',
        subtitle: '专业器材，助力你的运动表现'
      },
      {
        id: 'banner_3',
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800', // 运动场地图片
        type: 'activity',
        linkId: 'activity_2',
        title: '会员专享福利',
        subtitle: '全场8折优惠，更多惊喜等你发现'
      }
    ],
    // 活动数据 - 使用更美观的图片
    activities: [
      {
        id: 'activity_1',
        title: '门店周年庆活动',
        description: '全场商品8折，会员额外95折，还有精美礼品赠送。专业网球装备一应俱全，品质保证。',
        coverUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400', // 庆祝活动图片
        timeRange: '6月18日-6月24日',
        location: '滨顺店'
      },
      {
        id: 'activity_2',
        title: '实体店免费体验课',
        description: '专业教练指导，提升你的网球技能，适合各年龄段球友。小班授课，个性化指导。',
        coverUrl: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc42?w=400', // 网球教学图片
        timeRange: '6月25日-7月15日',
        location: '中心店'
      }
    ],
    // 精选装备数据 - 使用更美观的商品图片
    featuredEquipment: [
      {
        id: 'equipment_1',
        name: 'YONEX尤尼克斯ARC-11羽毛球拍',
        tag: '热销',
        price: '899',
        sales: '销量268',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300' // 网球拍图片
      },
      {
        id: 'equipment_2',
        name: 'Victor胜利挑战者9500羽毛球拍',
        tag: '新品',
        price: '599',
        sales: '销量156',
        imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=300' // 网球拍图片
      },
      {
        id: 'equipment_3',
        name: 'LI-NING李宁风动9000超轻球拍',
        tag: '爆款',
        price: '1280',
        sales: '销量189',
        imageUrl: 'https://images.unsplash.com/photo-1544963150-889b086b6cb5?w=300' // 网球拍图片
      },
      {
        id: 'equipment_4',
        name: 'KAWASAKI川崎羽毛球拍碳纤维',
        tag: '推荐',
        price: '458',
        sales: '销量342',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300' // 网球拍图片
      }
    ]
  },

  onLoad() {
    // 获取系统状态栏高度 - 使用新的API替代已弃用的wx.getSystemInfoSync
    try {
      const statusBarHeight = getStatusBarHeight()
      // 增加更多额外边距，确保banner完全显示不被遮挡
      this.setData({
        statusBarHeight: statusBarHeight + 20
      })
      console.log('状态栏高度+安全边距:', statusBarHeight + 20)
    } catch (e) {
      // 使用固定的安全值，兼容旧设备
      this.setData({
        statusBarHeight: 64  // 增加默认安全高度
      })
      console.error('获取系统信息失败', e)
    }
    
    // 打印初始数据状态，便于调试
    console.log('页面onLoad - 初始精选装备数据:', this.data.featuredEquipment)
    
    // 页面加载时获取数据
    this.fetchBanners()
    this.fetchActivities()
    this.fetchFeaturedEquipment() // 获取精选装备数据
    this.checkLoginStatus()
  },

  // 页面显示时也检查数据，确保数据完整性
  onShow() {
    console.log('页面onShow - 当前精选装备数据:', this.data.featuredEquipment)
    // 如果数据为空，重新设置
    if (!this.data.featuredEquipment || this.data.featuredEquipment.length === 0) {
      console.log('数据为空，重新初始化')
      this.testRefreshEquipment()
    }
  },

  // 检查登录状态并获取会员信息
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (token) {
      // 获取用户信息、会员等级
      // 实际开发中这里应该调用API获取数据
      console.log('获取用户信息')
    } else {
      // 未登录，可以展示默认信息或引导登录
      console.log('用户未登录')
    }
  },

  // 导航到指定页面 - 修复tab跳转问题
  navigateTo(e) {
    const { url } = e.currentTarget.dataset
    
    // 处理功能页面的跳转
    if (url === '/pages/promotion/index') {
      // 推广返佣功能，跳转到服务页面的推广返佣tab
      this.switchToServiceTab(2, '推广返佣')
    } else if (url === '/pages/pointsExchange/index') {
      // 积分兑换功能，跳转到服务页面的积分兑换tab
      this.switchToServiceTab(1, '积分兑换')
    } else if (url === '/pages/stringing/index') {
      // 穿线服务功能，跳转到服务页面的穿线服务tab
      this.switchToServiceTab(0, '穿线服务')
    } else if (url === '/pages/booking/index') {
      // 客服服务功能 - 暂时不跳转，显示开发中提示
      wx.showToast({
        title: '客服功能开发中，敬请期待',
        icon: 'none',
        duration: 2000
      })
      console.log('首页客服服务 - 暂时不跳转，后续对接微信客服')
    } else if (url === '/pages/activity/index') {
      // 热门活动查看全部，跳转到活动页面的全部tab
      this.switchToActivityTab(0, '全部活动')  // 假设全部tab是第一个tab，索引为0
    } else if (url.includes('/pages/mall/index')) {
      // 精选装备查看全部，跳转到商场页面
      console.log('首页精选装备 - 准备跳转到商场页面:', url)
      
      // 商场页面是tab页面，使用switchTab跳转
      wx.switchTab({
        url: '/pages/mall/index',
        success: () => {
          console.log('首页精选装备 - 成功跳转到商场页面')
          
          // 如果URL包含category参数，可以通过全局数据传递
          if (url.includes('category=featured')) {
            const app = getApp()
            app.globalData = app.globalData || {}
            app.globalData.mallCategory = 'featured'
            app.globalData.fromIndex = true
            console.log('首页精选装备 - 设置商场分类为featured')
          }
        },
        fail: (error) => {
          console.error('首页精选装备 - 跳转商场页面失败:', error)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    } else {
      // 其他已存在的页面正常跳转
      wx.navigateTo({ 
        url,
        fail: (error) => {
          console.error('页面跳转失败:', error)
          wx.showToast({
            title: '页面不存在或跳转失败',
            icon: 'none'
          })
        }
      })
    }
  },

  // 统一处理跳转到服务页面指定tab的方法
  switchToServiceTab(targetTab, serviceName) {
    console.log(`首页${serviceName} - 准备跳转到服务页面tab ${targetTab}`)
    
    // 先设置全局数据
    const app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.targetTab = targetTab
    app.globalData.fromIndex = true  // 标记来源于首页
    
    wx.switchTab({
      url: '/pages/booking/index',
      success: () => {
        console.log(`首页${serviceName} - 成功跳转到服务页面`)
        
        // 延迟触发tab切换，确保服务页面已经加载完成
        setTimeout(() => {
          // 通过事件系统通知服务页面切换tab
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          
          if (currentPage && currentPage.route === 'pages/booking/index') {
            // 如果当前页面是服务页面，直接调用切换方法
            if (typeof currentPage.switchToTab === 'function') {
              currentPage.switchToTab(targetTab)
              console.log(`首页${serviceName} - 延迟切换到tab ${targetTab}成功`)
            } else {
              // 如果方法不存在，再次设置全局数据并尝试触发onShow
              app.globalData.targetTab = targetTab
              app.globalData.needSwitchTab = true
              console.log(`首页${serviceName} - 设置全局数据等待服务页面处理`)
            }
          }
        }, 100) // 延迟100ms确保页面加载完成
      },
      fail: (error) => {
        console.error(`首页${serviceName} - 跳转失败:`, error)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 统一处理跳转到活动页面指定tab的方法
  switchToActivityTab(targetTab, tabName) {
    console.log(`首页${tabName} - 准备跳转到活动页面tab ${targetTab}`)
    
    // 先设置全局数据
    const app = getApp()
    app.globalData = app.globalData || {}
    app.globalData.activityTargetTab = targetTab  // 使用不同的键名避免冲突
    app.globalData.fromIndex = true  // 标记来源于首页
    
    wx.switchTab({
      url: '/pages/activity/index',
      success: () => {
        console.log(`首页${tabName} - 成功跳转到活动页面`)
        
        // 延迟触发tab切换，确保活动页面已经加载完成
        setTimeout(() => {
          // 通过事件系统通知活动页面切换tab
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          
          if (currentPage && currentPage.route === 'pages/activity/index') {
            // 如果当前页面是活动页面，直接调用切换方法
            if (typeof currentPage.switchToTab === 'function') {
              currentPage.switchToTab(targetTab)
              console.log(`首页${tabName} - 延迟切换到tab ${targetTab}成功`)
            } else {
              // 如果方法不存在，再次设置全局数据并尝试触发onShow
              app.globalData.activityTargetTab = targetTab
              app.globalData.needSwitchActivityTab = true
              console.log(`首页${tabName} - 设置全局数据等待活动页面处理`)
            }
          }
        }, 100) // 延迟100ms确保页面加载完成
      },
      fail: (error) => {
        console.error(`首页${tabName} - 跳转失败:`, error)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 获取轮播图数据
  fetchBanners() {
    // 实际开发中这里应该调用API获取数据
    console.log('获取轮播图数据')
    // 模拟API请求
    /*
    wx.request({
      url: 'https://api.example.com/banners',
      success: (res) => {
        this.setData({
          banners: res.data.banners
        })
      }
    })
    */
  },

  // 获取活动数据
  fetchActivities() {
    // 实际开发中这里应该调用API获取数据
    console.log('获取活动数据')
    // 模拟API请求
    /*
    wx.request({
      url: 'https://api.example.com/activities',
      success: (res) => {
        this.setData({
          activities: res.data.activities
        })
      }
    })
    */
  },

  // 获取精选装备数据 - 新增方法
  fetchFeaturedEquipment() {
    // 实际开发中这里应该调用API获取数据
    console.log('获取精选装备数据')
    
    // 当前使用本地数据，确保数据正确设置
    // 重新设置精选装备数据，确保渲染
    this.setData({
      featuredEquipment: this.data.featuredEquipment
    }, () => {
      console.log('精选装备数据设置完成:', this.data.featuredEquipment)
      console.log('精选装备数量:', this.data.featuredEquipment ? this.data.featuredEquipment.length : 0)
    })
    
    // 模拟API请求
    /*
    wx.request({
      url: 'https://api.example.com/featured-equipment',
      success: (res) => {
        this.setData({
          featuredEquipment: res.data.equipment
        })
      }
    })
    */
  },

  // 处理轮播图点击
  handleBannerClick(e) {
    const { id, type } = e.currentTarget.dataset
    const banner = this.data.banners.find(item => item.id === id)
    
    if (!banner) return
    
    if (type === 'activity') {
      wx.navigateTo({
        url: `/pages/activityDetail/index?id=${banner.linkId}`
      })
    } else if (type === 'product') {
      wx.navigateTo({
        url: `/pages/productDetail/index?id=${banner.linkId}`
      })
    }
  },

  // 导航到详情页
  navigateToDetail(e) {
    const { id, type } = e.currentTarget.dataset
    
    if (type === 'activity') {
      wx.navigateTo({
        url: `/pages/activityDetail/index?id=${id}`
      })
    } else if (type === 'product') {
      wx.navigateTo({
        url: `/pages/productDetail/index?id=${id}`
      })
    }
  },

  // 搜索输入处理
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索确认处理（点击键盘搜索按钮）
  onSearchConfirm(e) {
    console.log('首页 - 搜索确认事件触发', e);
    
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
      console.log('首页 - 搜索关键词为空');
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    console.log('首页 - 准备跳转到搜索结果页，关键词：', keyword);
    
    // 跳转到搜索结果页面，注明搜索类型为商品
    wx.navigateTo({
      url: `/pages/search-result/search-result?keyword=${encodeURIComponent(keyword)}&type=product`,
      success: (res) => {
        console.log('首页 - 成功跳转到搜索结果页', res);
        // 清空搜索框
        this.setData({
          searchKeyword: ''
        });
      },
      fail: (error) => {
        console.error('首页 - 跳转搜索结果页失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '倍特爱小程序',
      path: '/pages/index/index'
    }
  },

  // 测试方法 - 重新设置精选装备数据（调试用）
  testRefreshEquipment() {
    console.log('测试刷新精选装备数据')
    
    // 重新设置数据
    this.setData({
      featuredEquipment: [
        {
          id: 'equipment_1',
          name: 'YONEX尤尼克斯ARC-11羽毛球拍',
          tag: '热销',
          price: '899',
          sales: '销量268',
          imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300'
        },
        {
          id: 'equipment_2',
          name: 'Victor胜利挑战者9500羽毛球拍',
          tag: '新品',
          price: '599',
          sales: '销量156',
          imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=300'
        },
        {
          id: 'equipment_3',
          name: 'LI-NING李宁风动9000超轻球拍',
          tag: '爆款',
          price: '1280',
          sales: '销量189',
          imageUrl: 'https://images.unsplash.com/photo-1544963150-889b086b6cb5?w=300'
        },
        {
          id: 'equipment_4',
          name: 'KAWASAKI川崎羽毛球拍碳纤维',
          tag: '推荐',
          price: '458',
          sales: '销量342',
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300'
        }
      ]
    })
    
    console.log('精选装备数据已刷新:', this.data.featuredEquipment)
  }
}) 