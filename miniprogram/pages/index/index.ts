// index.ts
// 获取应用实例
const app = getApp()

// 引入系统信息工具函数
import { getStatusBarHeight } from '../../utils/systemInfo.js'

Page({
  data: {
    statusBarHeight: 0,
    notificationCount: 2,
    banners: [
      {
        id: 1,
        imageUrl: '/assets/images/banner1.jpg'
      },
      {
        id: 2,
        imageUrl: '/assets/images/banner2.jpg'
      },
      {
        id: 3,
        imageUrl: '/assets/images/banner3.jpg'
      }
    ],
    activities: [
      {
        id: 1,
        title: '门店限时活动',
        description: '全场消费满300元，享8折优惠。更多活动等你来参与...',
        time: '9月12日-9月24日',
        location: '深圳宝安区羽毛球馆',
        imageUrl: '/assets/images/activity1.jpg'
      },
      {
        id: 2,
        title: '羽毛球友谊赛',
        description: '周末相聚羽毛球馆，切磋球技，结交好友...',
        time: '每周六 13:00-16:00',
        location: '深圳罗湖区体育中心',
        imageUrl: '/assets/images/activity2.jpg'
      }
    ]
  },

  onLoad() {
    // 获取状态栏高度 - 使用新的API替代已弃用的wx.getSystemInfoSync
    try {
      const statusBarHeight = getStatusBarHeight();
      this.setData({
        statusBarHeight: statusBarHeight || 0
      });
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
    
    // 页面加载时获取数据
    this.fetchBanners()
    this.fetchActivities()
  },

  // 导航到指定页面
  navigateTo(e: any) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url
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

  // 点击轮播图
  onBannerTap(e: any) {
    const bannerId = e.currentTarget.dataset.id
    console.log('点击了轮播图', bannerId)
    // 根据轮播图ID进行跳转
    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?id=${bannerId}`
    })
  },

  // 导航到活动详情
  navigateToActivity(e: any) {
    const activityId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?id=${activityId}`
    })
  },

  onShareAppMessage() {
    return {
      title: '倍特爱小程序',
      path: '/pages/index/index'
    }
  }
})
