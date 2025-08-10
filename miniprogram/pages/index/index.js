// index.js
// 获取应用实例
const app = getApp()

// 引入系统信息工具函数
import { getStatusBarHeight } from '../../utils/systemInfo.js'

// 引入常量配置
const { API_CONSTANTS } = require('../../config/constants.js')

// 引入统一请求工具
const { get, post } = require('../../utils/request.js')
const request = require('../../utils/request.js')
console.log('get',get)
console.log('reqeust',request)

Page({
  data: {
    statusBarHeight: 0,
    searchKeyword: '', // 搜索关键词数据
    // 轮播图数据 - 将通过API获取
    banners: [],
    // 活动数据 - 将通过API获取
    activities: [],
    // 精选装备数据 - 将通过API获取
    featuredEquipment: [],
    // 用户信息数据
    userInfo: null,
    // 加载状态
    isLoading: {
      banners: false,
      activities: false,
      featuredEquipment: false,
      userInfo: false
    }
  },

  onLoad() {
    console.log('🏠 ===========================================')
    console.log('🏠 首页开始加载')
    console.log('🏠 ===========================================')
    
    // 获取系统状态栏高度 - 使用新的API替代已弃用的wx.getSystemInfoSync
    try {
      const statusBarHeight = getStatusBarHeight()
      // 增加更多额外边距，确保banner完全显示不被遮挡
      this.setData({
        statusBarHeight: statusBarHeight + 20
      })
      console.log('📐 状态栏高度+安全边距:', statusBarHeight + 20)
    } catch (e) {
      // 使用固定的安全值，兼容旧设备
      this.setData({
        statusBarHeight: 64  // 增加默认安全高度
      })
      console.error('❌ 获取系统信息失败', e)
    }
    
    console.log('🚀 开始获取首页数据...')
    
    // 页面加载时获取数据
    console.log('1️⃣ 准备获取轮播图数据...')
    this.fetchBanners()        // 获取轮播图数据
    
    console.log('2️⃣ 准备获取活动数据...')
    this.fetchActivities()     // 获取活动数据  
    
    console.log('3️⃣ 准备获取精选装备数据...')
    this.fetchFeaturedEquipment() // 获取精选装备数据
    
    console.log('4️⃣ 准备检查登录状态...')
    this.checkLoginStatus()    // 检查登录状态并获取用户信息
    
    console.log('🏠 ===========================================')
  },

  // 页面显示时也检查数据，确保数据完整性
  onShow() {
    console.log('页面onShow - 检查数据完整性')
    // 如果关键数据为空，重新获取
    if (!this.data.banners || this.data.banners.length === 0) {
      console.log('轮播图数据为空，重新获取')
      this.fetchBanners()
    }
    if (!this.data.activities || this.data.activities.length === 0) {
      console.log('活动数据为空，重新获取')
      this.fetchActivities()
    }
    if (!this.data.featuredEquipment || this.data.featuredEquipment.length === 0) {
      console.log('精选装备数据为空，重新获取')
      this.fetchFeaturedEquipment()
    }
  },

  // 检查登录状态并获取会员信息
  checkLoginStatus() {
    const token = wx.getStorageSync(API_CONSTANTS.STORAGE_KEYS.TOKEN)
    if (token) {
      // 获取用户信息、会员等级
      this.fetchUserInfo()
    } else {
      // 未登录，清空用户信息
      console.log('用户未登录')
      this.setData({
        userInfo: null
      })
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

  // 获取轮播图数据 - 使用新的请求工具
  fetchBanners() {
    console.log('🎠 开始获取轮播图数据...')
    
    // 设置加载状态
    this.setData({
      [API_CONSTANTS.LOADING_FIELDS.BANNERS]: true
    })
    console.log('⏳ 轮播图加载状态已设置为true')
    
    // 使用统一请求工具
    get('/api/banners', {}, {
      showLoading: false  // 使用自己的加载状态，不显示系统loading
    })
    .then((data) => {
      console.log('✅ 轮播图数据获取成功!')
      console.log('🎠 轮播图原始数据:', data)
      
      // 解析响应数据，符合接口文档格式
      const banners = data.banners || []
      console.log('🎠 解析后的轮播图数据:', banners)
      console.log('🎠 轮播图数量:', banners.length)
      
      this.setData({
        banners: banners
      })
      console.log('✅ 轮播图数据已更新到页面')
    })
    .catch((error) => {
      console.error('❌ 获取轮播图失败:', error)
      // 错误处理已在request工具中统一处理
    })
    .finally(() => {
      // 取消加载状态
      this.setData({
        [API_CONSTANTS.LOADING_FIELDS.BANNERS]: false
      })
      console.log('⏳ 轮播图加载状态已设置为false')
    })
  },

  // 获取活动数据 - 使用新的请求工具
  fetchActivities() {
    console.log('🎉 开始获取热门活动数据...')
    
    // 设置加载状态
    this.setData({
      [API_CONSTANTS.LOADING_FIELDS.ACTIVITIES]: true
    })
    console.log('⏳ 活动加载状态已设置为true')
    
    // 使用统一请求工具
    get('/api/activities', {
      limit: 2,           // 首页只显示2个活动
      isRecommended: true, // 只获取推荐到首页的活动
      featured: true      // 只获取精选活动
    }, {
      showLoading: false
    })
    .then((data) => {
      console.log('✅ 活动数据获取成功!')
      console.log('🎉 活动原始数据:', data)
      
      // 解析响应数据，符合接口文档格式
      const activities = data.activities || []
      console.log('🎉 解析后的活动数据:', activities)
      console.log('🎉 活动数量:', activities.length)
      console.log('🎉 精选活动总数:', data.totalFeaturedCount)
      console.log('🎉 所有活动总数:', data.totalActivitiesCount)
      
      this.setData({
        activities: activities
      })
      console.log('✅ 活动数据已更新到页面')
    })
    .catch((error) => {
      console.error('❌ 获取活动失败:', error)
      // 错误处理已在request工具中统一处理
    })
    .finally(() => {
      // 取消加载状态
      this.setData({
        [API_CONSTANTS.LOADING_FIELDS.ACTIVITIES]: false
      })
      console.log('⏳ 活动加载状态已设置为false')
    })
  },

  // 获取精选装备数据 - 使用新的请求工具
  fetchFeaturedEquipment() {
    console.log('🏸 开始获取精选装备数据...')
    
    // 设置加载状态
    this.setData({
      [API_CONSTANTS.LOADING_FIELDS.FEATURED_EQUIPMENT]: true
    })
    console.log('⏳ 精选装备加载状态已设置为true')
    
    // 使用统一请求工具
    get('/api/featured-equipment', {
      limit: 4,         // 首页显示4个精选装备
      isFeatured: true  // 只获取精选商品
    }, {
      showLoading: false
    })
    .then((data) => {
      console.log('✅ 精选装备数据获取成功!')
      console.log('🏸 精选装备原始数据:', data)
      
      // 解析响应数据，符合接口文档格式
      const featuredEquipment = data.featuredEquipment || []
      console.log('🏸 解析后的精选装备数据:', featuredEquipment)
      console.log('🏸 精选装备数量:', featuredEquipment.length)
      
      this.setData({
        featuredEquipment: featuredEquipment
      })
      console.log('✅ 精选装备数据已更新到页面')
    })
    .catch((error) => {
      console.error('❌ 获取精选装备失败:', error)
      // 错误处理已在request工具中统一处理
    })
    .finally(() => {
      // 取消加载状态
      this.setData({
        [API_CONSTANTS.LOADING_FIELDS.FEATURED_EQUIPMENT]: false
      })
      console.log('⏳ 精选装备加载状态已设置为false')
    })
  },

  // 获取用户基本信息 - 使用新的请求工具
  fetchUserInfo() {
    console.log('👤 开始获取用户信息...')
    
    // 设置加载状态
    this.setData({
      [API_CONSTANTS.LOADING_FIELDS.USER_INFO]: true
    })
    console.log('⏳ 用户信息加载状态已设置为true')
    
    // 使用统一请求工具，需要认证
    get('/api/user/info', {}, {
      needAuth: true,     // 需要认证
      showLoading: false
    })
    .then((data) => {
      console.log('✅ 用户信息获取成功!')
      console.log('👤 用户信息原始数据:', data)
      
      this.setData({
        userInfo: data
      })
      console.log('✅ 用户信息已更新到页面')
      
      // 保存用户ID到本地存储
      if (data.userId) {
        wx.setStorageSync(API_CONSTANTS.STORAGE_KEYS.USER_ID, data.userId)
        console.log('💾 用户ID已保存到本地存储:', data.userId)
      }
    })
    .catch((error) => {
      console.error('❌ 获取用户信息失败:', error)
      
      // 如果是认证失败，清空用户信息
      if (error.error === API_CONSTANTS.UNAUTHORIZED) {
        this.setData({
          userInfo: null
        })
        console.log('🔐 认证失败，已清空用户信息')
      }
    })
    .finally(() => {
      // 取消加载状态
      this.setData({
        [API_CONSTANTS.LOADING_FIELDS.USER_INFO]: false
      })
      console.log('⏳ 用户信息加载状态已设置为false')
    })
  },

  // 记录客服使用统计 - 使用新的请求工具
  recordCustomerServiceUsage(logData) {
    console.log('记录客服使用统计:', logData)
    
    // 使用统一请求工具
    post('/api/analytics/customer-service', {
      userId: logData.userId,
      timestamp: logData.timestamp,
      source: logData.source,
      action: logData.action,
      sessionId: logData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }, {
      showLoading: false  // 统计不显示loading
    })
    .then((data) => {
      console.log('客服使用统计记录成功:', data)
    })
    .catch((error) => {
      console.error('记录客服统计失败:', error)
      // 统计失败不影响用户体验，静默处理
    })
  },

  // 处理轮播图点击
  handleBannerClick(e) {
    const { id, type } = e.currentTarget.dataset
    const banner = this.data.banners.find(item => item.id === id)
    
    if (!banner) return
    
    if (type === API_CONSTANTS.BANNER.TYPE_ACTIVITY) {
      wx.navigateTo({
        url: `/pages/activityDetail/index?id=${banner.linkId}`
      })
    } else if (type === API_CONSTANTS.BANNER.TYPE_PRODUCT) {
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

  // 搜索确认处理（点击键盘搜索按钮）- 根据接口文档实现
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
    
    // 允许空关键词搜索，根据接口文档兜底逻辑
    console.log('首页 - 准备跳转到搜索结果页，关键词：', keyword || '(空)');
    
    // 跳转到搜索结果页面，符合接口文档参数格式
    wx.navigateTo({
      url: `/pages/search-result/search-result?keyword=${encodeURIComponent(keyword)}&type=${API_CONSTANTS.SEARCH.TYPE_PRODUCT}&page=${API_CONSTANTS.SEARCH.DEFAULT_PAGE}&pageSize=${API_CONSTANTS.SEARCH.DEFAULT_PAGE_SIZE}&sortBy=${API_CONSTANTS.SEARCH.DEFAULT_SORT}`,
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

  /**
   * 客服会话回调 - 用户点击客服按钮时触发，根据接口文档实现
   */
  onContactButton(e) {
    console.log('[首页] 用户点击客服按钮，准备进入客服会话');
    console.log('[首页] 客服事件详情:', e.detail);
    
    // 记录客服使用统计，符合接口文档格式
    try {
      const customerServiceLog = {
        userId: wx.getStorageSync(API_CONSTANTS.STORAGE_KEYS.USER_ID) || 'guest',
        timestamp: Date.now(),
        source: API_CONSTANTS.CUSTOMER_SERVICE.SOURCE_INDEX,
        action: API_CONSTANTS.CUSTOMER_SERVICE.ACTION_START
      };
      
      console.log('[首页] 客服使用统计:', customerServiceLog);
      
      // 调用后端API记录统计
      this.recordCustomerServiceUsage(customerServiceLog);
      
    } catch (error) {
      console.error('[首页] 记录客服统计失败:', error);
    }
  },

  onShareAppMessage() {
    return {
      title: '倍特爱小程序',
      path: '/pages/index/index'
    }
  }
})