// 引入API接口
import { getUserInfo } from '../../api/userApi'
import { api } from '../../api/utils/request'

const app = getApp()

// 定义接口
interface UserInfo {
  avatarUrl?: string;
  nickName?: string;
  pointsTotal?: number;
  userId?: string;
  pointsBalance?: number;
  coupons?: number;
  services?: number;
}

interface PointsInfo {
  balance?: number;
  isSigned?: boolean;
}

interface SignInResult {
  success: boolean;
  points?: number;
}

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
    services: 1
  },

  onLoad() {
    // 页面加载时执行一次
    this.checkSignInStatus()
  },

  onShow() {
    console.log('个人页面显示')
    // 每次页面显示都获取最新的用户信息
    this.getUserInfo()
    this.getPointsInfo()
    
    // 添加调试信息
    wx.showToast({
      title: '页面已显示',
      icon: 'none',
      duration: 2000
    })

    // 调试信息 - 检查元素是否正常渲染
    console.log('当前页面数据:', this.data)
    
    // 确保DOM元素已渲染，给一些时间让视图更新
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('.personal-container')
        .boundingClientRect(function(rect) {
          if (rect) {
            console.log('个人页面容器尺寸:', rect.width, rect.height)
          } else {
            console.error('未找到个人页面容器元素')
          }
        })
        .exec()
    }, 500);
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
      const userInfo = await getUserInfo() as UserInfo
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
  getUserLevel(points: number): string {
    if (points >= 1000) return '高级会员'
    if (points >= 500) return '中级会员'
    return '初级会员'
  },

  // 获取积分信息
  async getPointsInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) return
      
      const pointsInfo = await getPoints() as PointsInfo
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
      
      // 调用签到API
      const result = await signIn() as SignInResult
      if (result && result.success) {
        // 更新签到状态
        this.setData({
          'tasks[0].status': 1,
          'userInfo.pointsBalance': this.data.userInfo.pointsBalance + (result.points || 5)
        })
        
        // 保存签到日期到本地
        const today = new Date().toDateString()
        wx.setStorageSync('lastSignIn', today)
        
        wx.showToast({
          title: `签到成功 +${result.points || 5}积分`,
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('[签到失败]', error)
    }
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '发现一个非常好用的服务平台，推荐给你！',
      path: '/pages/index/index',
      imageUrl: '/assets/icons/share.svg'
    }
  },
  
  // 立即分享
  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  
  // 立即邀请
  handleInvite() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 页面跳转
  navigateTo(e: any) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      console.error('跳转链接不存在');
      return;
    }
    wx.navigateTo({
      url,
      fail: (err) => {
        console.error('页面跳转失败', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 设置
  handleSetting() {
    this.navigateTo('/pages/setting/index')
  },
  
  // 处理任务点击
  handleTaskClick(e: any) {
    const { id } = e.currentTarget.dataset
    
    switch(parseInt(id)) {
      case 1: // 签到
        this.handleSignIn()
        break
      case 2: // 分享
        this.handleShare()
        break
      case 3: // 邀请
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
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    })
  }
}) 