// 个人中心页面 - 测试版本
Page({
  data: {
    userInfo: {
      avatarUrl: '/assets/icons/default-avatar.png',
      nickName: '张小燕',
      level: '初级会员',
      id: '10086',
      pointsBalance: 280
    },
    tasks: [
      { id: 1, name: '每日签到', desc: '连续签到7天额外奖励30积分', icon: 'check-in', status: 0 },
      { id: 2, name: '分享小程序', desc: '分享给好友获得5积分', icon: 'share', status: 0 },
      { id: 3, name: '邀请好友', desc: '成功邀请1位好友获得30积分', icon: 'invite', status: 0 }
    ],
    tools: [
      {
        id: 1,
        name: '地址管理',
        icon: '/assets/icons/address.svg',
        url: '/pages/address-list/index'
      },
      {
        id: 2,
        name: '我的收藏',
        icon: '/assets/icons/favorite.svg',
        url: '/pages/favorites/favorites'
      },
      {
        id: 3,
        name: '我的足迹',
        icon: '/assets/icons/footprint.svg',
        url: '/pages/history/history'
      },
      {
        id: 4,
        name: '在线客服',
        icon: '/assets/icons/service.svg',
        url: '/pages/service/service'
      },
      {
        id: 5,
        name: '意见反馈',
        icon: '/assets/icons/feedback.svg',
        url: '/pages/feedback/feedback'
      },
      {
        id: 6,
        name: '关于我们',
        icon: '/assets/icons/about.svg',
        url: '/pages/about/about'
      }
    ],
    coupons: 3,
    services: 1,
    paymentCount: 2,
    deliveryCount: 1,
    receiptCount: 0,
    commentCount: 3,
    refundCount: 0
  },

  // 页面加载时执行
  onLoad: function() {
    console.log('个人页面加载')
  },

  // 页面显示时执行
  onShow: function() {
    console.log('个人页面显示')
  },

  // 积分按钮点击事件处理 - 跳转到积分兑换tab
  handlePointsClick: function() {
    console.log('积分按钮被点击，跳转到积分兑换tab')
    wx.showToast({
      title: '正在打开积分兑换',
      icon: 'loading',
      duration: 800
    })
    // 设置全局变量，告知服务页面切换到积分兑换tab
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.targetTab = 1 // 0:穿线服务 1:积分兑换 2:推广返佣 3:我的服务
    }
    // 跳转到底栏服务页面
    wx.switchTab({
      url: '/pages/booking/index',
      success: function() {
        console.log('成功跳转到服务页面，将显示积分兑换tab')
      },
      fail: function(err) {
        console.log('跳转失败:', err)
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 通用跳转方法
  navigateTo: function(e) {
    var url = e.currentTarget.dataset.url
    console.log('点击跳转，目标页面:', url)  // 添加调试信息，方便查看点击是否生效
    if (url) {
      console.log('准备跳转到:', url)  // 确认跳转路径
      wx.navigateTo({
        url: url,
        success: function() {
          console.log('跳转成功')  // 跳转成功的提示
        },
        fail: function(err) {
          console.log('跳转失败:', err)  // 跳转失败的错误信息
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    } else {
      console.log('错误：没有找到跳转链接')  // 如果没有url的错误提示
    }
  },

  // 任务点击
  handleTaskClick: function(e) {
    var taskId = e.currentTarget.dataset.id
    console.log('任务ID:', taskId)
    wx.showToast({
      title: '任务' + taskId,
      icon: 'none'
    })
  },

  // 签到
  handleSignIn: function() {
    console.log('处理签到')
    wx.showToast({
      title: '签到成功',
      icon: 'success'
    })
  },

  // 分享
  handleShare: function() {
    wx.showToast({
      title: '分享成功',
      icon: 'success'
    })
  },

  // 邀请
  handleInvite: function() {
    wx.showToast({
      title: '邀请功能即将上线',
      icon: 'none'
    })
  }
})