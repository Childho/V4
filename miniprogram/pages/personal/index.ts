// 引入API接口 - 用于获取用户信息和积分相关数据
import { getUserInfo, UserInfo as ApiUserInfo } from '../../api/userApi'
import { api } from '../../api/utils/request'

// 移除未使用的app变量声明，如果后续需要可以再加回来
// const app = getApp()

// 定义页面级用户信息接口（重命名避免与API接口冲突）
// 这个接口定义了页面中显示的用户信息字段
interface PageUserInfo {
  avatarUrl?: string;    // 头像地址
  nickName?: string;     // 用户昵称
  pointsTotal?: number;  // 总积分
  userId?: number;       // 用户ID
  pointsBalance?: number; // 当前积分余额
  coupons?: number;      // 优惠券数量
  services?: number;     // 服务数量
  level?: string;        // 会员等级
  id?: string;           // 用户编号（字符串格式）
}

// 积分信息接口
interface PointsInfo {
  balance?: number;   // 积分余额
  isSigned?: boolean; // 是否已签到
}

// 签到结果接口
interface SignInResult {
  success: boolean;  // 签到是否成功
  points?: number;   // 获得的积分数
}

// 订单统计数据接口
interface OrderCounts {
  unpaid?: number;      // 待付款订单数
  unshipped?: number;   // 待发货订单数
  shipped?: number;     // 待收货订单数
  uncommented?: number; // 待评价订单数
  refunding?: number;   // 退款/售后订单数
}

// 定义获取积分信息的API函数
const getPoints = () => {
  return api.post('/api/points/info', {});
};

// 定义签到的API函数
const signIn = () => {
  return api.post('/api/points/signIn', {});
};

Page({
  data: {
    // 用户信息 - 初始化为默认值，实际数据从API获取
    userInfo: {
      avatarUrl: '/assets/icons/default-avatar.png',
      nickName: '微信用户',
      level: '初级会员',
      id: '未登录',
      pointsBalance: 0
    } as PageUserInfo,
    // 任务列表数据 - 每日任务信息
    tasks: [
      { id: 1, name: '每日签到', desc: '连续签到7天额外奖励30积分', icon: 'check-in', status: 0 },
      { id: 2, name: '分享小程序', desc: '分享给好友获得5积分', icon: 'share', status: 0 },
      { id: 3, name: '邀请好友', desc: '成功邀请1位好友获得30积分', icon: 'invite', status: 0 }
    ],
    // 统计数据 - 初始值为0，从API获取实际数据
    coupons: 0,        // 优惠券数量
    services: 0,       // 服务数量
    paymentCount: 0,   // 待付款订单数
    deliveryCount: 0,  // 待发货订单数
    receiptCount: 0,   // 待收货订单数
    commentCount: 0,   // 待评价订单数
    refundCount: 0,    // 退款/售后订单数
    // 常用工具数据 - 固定的功能入口
    tools: [
      { id: 1, name: '地址管理', icon: '/assets/icons/address.svg', url: '/pages/address-list/index' }
    ]
  },

  // 页面加载时执行 - 生命周期函数
  onLoad() {
    console.log('个人中心页面开始加载')
    this.checkSignInStatus() // 检查签到状态
  },

  // 页面显示时执行 - 生命周期函数
  onShow() {
    console.log('个人中心页面显示')
    // 每次页面显示都获取最新的用户信息和数据
    this.getUserInfo()      // 获取用户基本信息
    this.getPointsInfo()    // 获取积分信息
    this.getOrderCounts()   // 获取订单统计数据

    // 调试信息 - 检查页面数据是否正常
    console.log('当前页面数据:', this.data)
    
    // 确保DOM元素已渲染完成后再进行后续操作
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('.page-container')
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

  // 获取用户信息 - 从API获取真实数据
  async getUserInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        console.log('用户未登录，使用默认数据')
        // 未登录状态，保持默认值
        return
      }
      
      // 调用API获取用户信息
      const userInfo = await getUserInfo() as ApiUserInfo
      if (userInfo) {
        // 更新页面数据 - 使用API返回的真实数据
        this.setData({ 
          userInfo: {
            avatarUrl: userInfo.avatarUrl || '/assets/icons/default-avatar.png',
            nickName: userInfo.nickName || '微信用户',
            level: this.getUserLevel(userInfo.pointsTotal || 0),
            id: String(userInfo.userId) || '10086',
            pointsBalance: userInfo.pointsBalance || 0
          },
          coupons: userInfo.coupons || 0,
          services: userInfo.services || 0
        })
        console.log('用户信息获取成功', userInfo)
      }
    } catch (error) {
      console.error('[获取用户信息失败]', error)
      // 失败时使用默认数据，不影响页面显示
    }
  },

  // 根据积分计算用户等级 - 业务逻辑函数
  getUserLevel(points: number): string {
    if (points >= 1000) return '高级会员'
    if (points >= 500) return '中级会员'
    return '初级会员'
  },

  // 获取积分信息 - 从API获取积分相关数据
  async getPointsInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        console.log('用户未登录，跳过积分信息获取')
        return
      }
      
      const pointsInfo = await getPoints() as PointsInfo
      if (pointsInfo) {
        this.setData({
          'userInfo.pointsBalance': pointsInfo.balance || 0,
          'tasks[0].status': pointsInfo.isSigned ? 1 : 0
        })
        console.log('积分信息获取成功', pointsInfo)
      }
    } catch (error) {
      console.error('[获取积分信息失败]', error)
    }
  },

  // 获取订单统计数据 - 从API获取各类订单数量
  async getOrderCounts() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        console.log('用户未登录，跳过订单统计获取')
        return
      }
      
      // 调用订单统计API
      const orderCounts = await api.post('/api/order/counts', {}) as OrderCounts
      if (orderCounts) {
        this.setData({
          paymentCount: orderCounts.unpaid || 0,      // 待付款
          deliveryCount: orderCounts.unshipped || 0,  // 待发货
          receiptCount: orderCounts.shipped || 0,     // 待收货
          commentCount: orderCounts.uncommented || 0, // 待评价
          refundCount: orderCounts.refunding || 0     // 退款/售后
        })
        console.log('订单统计获取成功', orderCounts)
      }
    } catch (error) {
      console.error('[获取订单统计失败]', error)
      // 失败时保持默认值0，不影响页面显示
    }
  },
  
  // 检查签到状态 - 从本地存储检查今日是否已签到
  checkSignInStatus() {
    const today = new Date().toDateString()
    const lastSignIn = wx.getStorageSync('lastSignIn')
    
    if (lastSignIn === today) {
      // 今日已签到，更新状态
      this.setData({
        'tasks[0].status': 1
      })
      console.log('今日已签到')
    } else {
      console.log('今日未签到')
    }
  },

  // 签到功能 - 处理用户签到操作
  async handleSignIn() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        // 未登录，跳转到登录页
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        this.navigateTo('/pages/login/index')
        return
      }
      
      if (this.data.tasks[0].status === 1) {
        // 今日已签到
        wx.showToast({
          title: '今日已签到',
          icon: 'none'
        })
        return
      }
      
      // 调用签到API
      const result = await signIn() as SignInResult
      if (result && result.success) {
        // 签到成功，更新页面数据
        const currentPoints = this.data.userInfo.pointsBalance || 0
        this.setData({
          'tasks[0].status': 1,
          'userInfo.pointsBalance': currentPoints + (result.points || 5)
        })
        
        // 保存签到日期到本地存储
        const today = new Date().toDateString()
        wx.setStorageSync('lastSignIn', today)
        
        // 显示签到成功提示
        wx.showToast({
          title: `签到成功 +${result.points || 5}积分`,
          icon: 'success'
        })
        console.log('签到成功，获得积分:', result.points || 5)
      }
    } catch (error) {
      console.error('[签到失败]', error)
      wx.showToast({
        title: '签到失败，请重试',
        icon: 'none'
      })
    }
  },

  // 分享小程序 - 微信原生分享功能
  onShareAppMessage() {
    return {
      title: '发现一个非常好用的服务平台，推荐给你！',
      path: '/pages/index/index',
      imageUrl: '/assets/icons/share.svg'
    }
  },
  
  // 立即分享 - 显示分享菜单
  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  
  // 立即邀请 - 显示分享菜单邀请好友
  handleInvite() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 点击积分卡片 - 跳转到积分兑换tab页面
  handlePointsClick() {
    console.log('积分按钮被点击，跳转到积分兑换tab')
    wx.showToast({
      title: '正在打开积分兑换',
      icon: 'loading',
      duration: 800
    })
    // 通过全局变量告知 booking 页面切换到特定 tab
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.targetTab = 1; // 0:穿线服务 1:积分兑换 2:推广返佣 3:我的服务
    }
    // 切换到底栏"服务"页面
    wx.switchTab({
      url: '/pages/booking/index',
      success: () => {
        console.log('成功跳转到服务页面，将显示积分兑换tab')
      },
      fail: (err) => {
        console.error('跳转失败', err)
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 页面跳转 - 通用的页面导航方法
  navigateTo(e: any) {
    // 处理直接传递URL字符串的情况
    let url;
    if (typeof e === 'string') {
      url = e;
    } else if (e && e.currentTarget && e.currentTarget.dataset) {
      url = e.currentTarget.dataset.url;
    } else {
      console.error('跳转参数无效', e);
      return;
    }

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
  
  // 处理任务点击 - 根据任务ID执行不同操作
  handleTaskClick(e: any) {
    const { id } = e.currentTarget.dataset
    
    switch(parseInt(id)) {
      case 1: // 签到任务
        this.handleSignIn()
        break
      case 2: // 分享任务
        this.handleShare()
        break
      case 3: // 邀请任务
        this.handleInvite()
        break
      default:
        console.log('未知任务ID:', id)
    }
  },

  // 查看隐私政策 - 跳转到隐私政策页面
  handleViewPrivacy() {
    wx.navigateTo({
      url: '/pages/webview/index?type=privacy'
    })
  },

  // 查看用户协议 - 跳转到用户协议页面
  handleViewTerms() {
    wx.navigateTo({
      url: '/pages/webview/index?type=terms'
    })
  },

  // 联系客服 - 拨打客服电话
  handleContact() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    })
  }
}) 