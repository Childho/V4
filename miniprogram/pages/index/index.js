// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    statusBarHeight: 0,
    notificationCount: 2,
    banners: [
      {
        id: 'banner_1',
        imageUrl: '/assets/icons/home.png',
        type: 'activity',
        linkId: 'activity_1'
      },
      {
        id: 'banner_2',
        imageUrl: '/assets/icons/activity.png',
        type: 'product',
        linkId: 'product_1'
      }
    ],
    activities: [
      {
        id: 'activity_1',
        title: '门店周年庆活动',
        description: '全场商品8折，会员额外95折，还有精美礼品赠送',
        coverUrl: '/assets/icons/activity.png',
        timeRange: '6月18日-6月24日',
        location: '滨顺店'
      },
      {
        id: 'activity_2',
        title: '实体店免费体验课',
        description: '专业教练指导，提升你的网球技能，适合各年龄段球友',
        coverUrl: '/assets/icons/activity_active.png',
        timeRange: '6月25日-7月15日',
        location: '中心店'
      }
    ],
    products: [
      {
        id: 'product_1',
        name: 'YONEX 网球拍 VR-800',
        price: '899.00',
        imageUrl: '/assets/icons/mall.png'
      },
      {
        id: 'product_2',
        name: 'VICTOR 专业球鞋',
        price: '499.00',
        imageUrl: '/assets/icons/mall_active.png'
      },
      {
        id: 'product_3',
        name: '高弹性网球 8只装',
        price: '129.00',
        imageUrl: '/assets/icons/mall.png'
      },
      {
        id: 'product_4',
        name: '专业运动护腕',
        price: '69.00',
        imageUrl: '/assets/icons/mall_active.png'
      }
    ]
  },

  onLoad() {
    // 获取系统状态栏高度
    try {
      const systemInfo = wx.getSystemInfoSync()
      // 添加更大的安全边距（额外增加20px）
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight + 20
      })
      console.log('状态栏高度+额外边距:', systemInfo.statusBarHeight + 20)
    } catch (e) {
      // 使用固定的安全值
      this.setData({
        statusBarHeight: 64  // 更大的默认值
      })
      console.error('获取系统信息失败', e)
    }
    
    // 页面加载时获取数据
    this.fetchBanners()
    this.fetchActivities()
    this.checkLoginStatus()
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

  // 导航到指定页面
  navigateTo(e) {
    const { url } = e.currentTarget.dataset
    wx.navigateTo({ url })
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

  // 处理搜索栏点击
  onSearchTap() {
    // 如果有单独的搜索页面，可以跳转过去
    // wx.navigateTo({
    //   url: '/pages/search/index'
    // })

    // 如果没有搜索页面，可以使用微信小程序内置的搜索组件
    wx.showActionSheet({
      itemList: ['搜索活动', '搜索商品'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 跳转到活动搜索
          wx.navigateTo({
            url: '/pages/activity/index?mode=search'
          })
        } else if (res.tapIndex === 1) {
          // 跳转到商品搜索
          wx.navigateTo({
            url: '/pages/mall/index?mode=search'
          })
        }
      }
    })
  },

  // 处理通知图标点击
  onNotificationTap() {
    // TODO: 跳转到通知页面或显示通知列表
    wx.showToast({
      title: '通知功能开发中',
      icon: 'none'
    })
  },

  onShareAppMessage() {
    return {
      title: '倍特爱小程序',
      path: '/pages/index/index'
    }
  }
}) 