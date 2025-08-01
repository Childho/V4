// 引入API接口
import { getUserInfo } from '../../api/userApi'
import { api } from '../../api/utils/request'

const app = getApp()

// 定义获取积分的函数
const getPoints = () => {
  return api.post('/points/info', {});
};

// 定义签到的函数
const signIn = () => {
  return api.post('/points/signIn', {});
};

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
    coupons: 3,
    services: 1,
    // 添加订单红点数据
    paymentCount: 2,
    deliveryCount: 1,
    receiptCount: 0,
    commentCount: 3,
    refundCount: 0,
    isRefreshing: false
  },

  onLoad() {
    // 页面加载时执行一次
    this.checkSignInStatus()
  },

  onShow() {
    console.log('个人页面显示')
    // 每次页面显示都获取最新的用户信息
    this.refreshPageData()
  },

  // 下拉刷新处理函数
  onPullDownRefresh() {
    this.setData({
      isRefreshing: true
    })
    
    // 刷新页面数据
    this.refreshPageData(() => {
      // 刷新完成后停止下拉刷新动画
      setTimeout(() => {
        wx.stopPullDownRefresh()
        this.setData({
          isRefreshing: false
        })
        
        // 显示轻提示
        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 800
        })
      }, 800) // 延迟一段时间，让用户体验下拉刷新的感觉
    })
  },
  
  // 刷新页面所有数据
  refreshPageData(callback) {
    Promise.all([
      this.getUserInfo(),
      this.getPointsInfo(),
      this.getOrderBadgeCounts() // 获取订单红点数量
    ]).then(() => {
      if (typeof callback === 'function') {
        callback()
      }
    }).catch(error => {
      console.error('刷新数据失败:', error)
      if (typeof callback === 'function') {
        callback()
      }
    })
  },

  // 获取订单红点数量
  async getOrderBadgeCounts() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) return
      
      // 这里应该是实际的API调用，为了演示使用模拟数据
      /* 实际代码应该类似:
      const result = await api.get('/orders/badge-counts')
      if (result) {
        this.setData({
          paymentCount: result.paymentCount || 0,
          deliveryCount: result.deliveryCount || 0,
          receiptCount: result.receiptCount || 0,
          commentCount: result.commentCount || 0,
          refundCount: result.refundCount || 0
        })
      }
      */
      
      // 模拟随机数据
      this.setData({
        paymentCount: Math.floor(Math.random() * 5),
        deliveryCount: Math.floor(Math.random() * 3),
        receiptCount: Math.floor(Math.random() * 2),
        commentCount: Math.floor(Math.random() * 5),
        refundCount: Math.floor(Math.random() * 2)
      })
    } catch (error) {
      console.error('[获取订单红点数量失败]', error)
    }
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        // 未登录状态，使用默认测试数据
        return
      }
      
      // 调用API获取用户信息
      const userInfo = await getUserInfo()
      if (userInfo) {
        // 更新页面数据
        this.setData({ 
          userInfo: {
            avatarUrl: userInfo.avatarUrl || '/assets/icons/default-avatar.png',
            nickName: userInfo.nickName || '微信用户',
            level: this.getUserLevel(userInfo.pointsTotal || 0),
            id: userInfo.userId || '10086',
            pointsBalance: userInfo.pointsBalance || 280
          },
          coupons: userInfo.coupons || 3,
          services: userInfo.services || 1
        })
      }
    } catch (error) {
      console.error('[获取用户信息失败]', error)
    }
  },

  // 根据积分计算用户等级
  getUserLevel(points) {
    if (points >= 1000) return '高级会员'
    if (points >= 500) return '中级会员'
    return '初级会员'
  },

  // 获取积分信息
  async getPointsInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) return
      
      const pointsInfo = await getPoints()
      if (pointsInfo) {
        this.setData({
          'userInfo.pointsBalance': pointsInfo.balance || 280,
          'tasks[0].status': pointsInfo.isSigned ? 1 : 0
        })
      }
    } catch (error) {
      console.error('[获取积分信息失败]', error)
    }
  },
  
  // 检查签到状态
  checkSignInStatus() {
    const today = new Date().toDateString()
    const lastSignIn = wx.getStorageSync('lastSignIn')
    
    if (lastSignIn === today) {
      this.setData({
        'tasks[0].status': 1
      })
    }
  },

  // 签到功能
  async handleSignIn() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        this.navigateTo('/pages/login/index')
        return
      }
      
      if (this.data.tasks[0].status === 1) {
        wx.showToast({
          title: '今日已签到',
          icon: 'none'
        })
        return
      }
      
      // 显示加载中
      wx.showLoading({
        title: '签到中...',
        mask: true
      })
      
      // 调用签到API
      const result = await signIn()
      wx.hideLoading()
      
      if (result && result.success) {
        // 更新签到状态
        this.setData({
          'tasks[0].status': 1,
          'userInfo.pointsBalance': this.data.userInfo.pointsBalance + (result.points || 5)
        })
        
        // 保存签到日期到本地
        const today = new Date().toDateString()
        wx.setStorageSync('lastSignIn', today)
        
        // 显示签到成功动画
        this.showPointsAnimation(result.points || 5)
      }
    } catch (error) {
      wx.hideLoading()
      console.error('[签到失败]', error)
      wx.showToast({
        title: '签到失败，请重试',
        icon: 'none'
      })
    }
  },
  
  // 显示积分动画
  showPointsAnimation(points) {
    wx.showToast({
      title: `签到成功 +${points}积分`,
      icon: 'success',
      duration: 1500
    })
    
    // 这里可以添加更复杂的积分动画效果
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '积分商城 - 签到领好礼',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share.png'
    }
  },

  // 分享操作
  handleShare() {
    // 已由onShareAppMessage处理
    wx.showToast({
      title: '感谢分享',
      icon: 'success'
    })
    
    // 模拟分享后增加积分
    this.setData({
      'userInfo.pointsBalance': this.data.userInfo.pointsBalance + 5
    })
    
    this.showPointsAnimation(5)
  },

  // 邀请好友
  handleInvite() {
    wx.showToast({
      title: '邀请功能即将上线',
      icon: 'none'
    })
  },

  // 页面跳转
  navigateTo(e) {
    const url = e.currentTarget.dataset.url || e
    wx.navigateTo({
      url
    })
  },

  // 处理设置
  handleSetting() {
    this.navigateTo('/pages/setting/index')
  },

  // 处理登录按钮点击
  handleLogin() {
    this.navigateTo('/pages/login/index')
  },

  // 处理任务点击
  handleTaskClick(e) {
    const taskId = e.currentTarget.dataset.id
    
    switch (taskId) {
      case 1: // 每日签到
        this.handleSignIn()
        break
      case 2: // 分享小程序
        this.handleShare()
        break
      case 3: // 邀请好友
        this.handleInvite()
        break
    }
  },

  // 查看隐私政策
  handleViewPrivacy() {
    wx.navigateTo({
      url: '/pages/webview/index?type=privacy'
    })
  },

  // 查看用户协议
  handleViewTerms() {
    wx.navigateTo({
      url: '/pages/webview/index?type=terms'
    })
  },

  // 联系客服
  handleContact() {
    // 微信开放能力
  }
}) 