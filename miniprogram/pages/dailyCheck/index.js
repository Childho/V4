// 引入API接口
const userApi = require('../../api/userApi')
const { api } = require('../../api/utils/request')

// 获取积分信息
const getPoints = () => {
  return api.post('/api/points/info', {});
};

// 签到
const signIn = () => {
  return api.post('/api/points/signIn', {});
};

// 获取签到记录
const getSignInRecord = () => {
  return api.post('/api/points/signInRecord', {});
};

// 签到奖励配置 - 根据连续签到天数获得不同积分
const getSignInReward = (continuousDays) => {
  const rewards = {
    1: 5,   // 第1天：5积分
    2: 10,  // 第2天：10积分
    3: 15,  // 第3天：15积分
    4: 20,  // 第4天：20积分
    5: 25,  // 第5天：25积分
    6: 30,  // 第6天：30积分
    7: 50   // 第7天：50积分（大奖励）
  };
  return rewards[continuousDays] || 5; // 默认5积分
};

Page({
  data: {
    userInfo: {
      nickName: '微信用户',
      pointsBalance: 0
    },
    today: '',
    weekday: '',
    signedToday: false,
    continuousDays: 0,
    currentMonth: '',
    signDays: [], // 本月已签到的日期数组
    daysInMonth: [], // 本月的所有天数
    // 签到奖励展示
    signRewards: [
      { day: 1, reward: 5, status: 'pending' },
      { day: 2, reward: 10, status: 'pending' },
      { day: 3, reward: 15, status: 'pending' },
      { day: 4, reward: 20, status: 'pending' },
      { day: 5, reward: 25, status: 'pending' },
      { day: 6, reward: 30, status: 'pending' },
      { day: 7, reward: 50, status: 'pending' }
    ],
    loading: false,
    // 签到统计信息
    signStats: {
      totalDays: 0,      // 总签到天数
      maxContinuous: 0,  // 最大连续签到天数
      currentStreak: 0   // 当前连续签到天数
    },
    // 签到动画控制
    showSignAnimation: false,
    signAnimationReward: 0
  },

  onLoad() {
    this.initCalendar();
    this.getUserInfo();
    this.getSignInStatus();
    this.getSignInRecord();
  },

  // 页面显示时刷新数据
  onShow() {
    this.getSignInStatus();
    this.getSignInRecord();
  },

  // 初始化日历
  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
    
    this.setData({
      today: day,
      weekday: weekday,
      currentMonth: `${year}年${month}月`
    });
    
    // 获取本月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    this.setData({ daysInMonth: days });
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) return;
      
      const userInfo = await userApi.getUserInfo();
      if (userInfo) {
        this.setData({
          'userInfo.nickName': userInfo.nickName || '微信用户',
          'userInfo.pointsBalance': userInfo.pointsBalance || 0
        });
      }
    } catch (error) {
      console.error('[获取用户信息失败]', error);
    }
  },

  // 获取签到状态
  async getSignInStatus() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) return;
      
      const pointsInfo = await getPoints();
      if (pointsInfo) {
        this.setData({
          signedToday: pointsInfo.isSigned || false,
          'tasks[0].status': pointsInfo.isSigned ? 1 : 0
        });
      }
    } catch (error) {
      console.error('[获取签到状态失败]', error);
    }
  },

  // 获取签到记录
  async getSignInRecord() {
    try {
      this.setData({ loading: true });
      const token = wx.getStorageSync('token');
      if (!token) return;
      
      const record = await getSignInRecord();
      if (record) {
        const continuousDays = record.continuousDays || 0;
        const signDays = record.days || [];
        
        // 更新签到奖励状态
        const signRewards = this.data.signRewards.map(item => {
          const dayIndex = continuousDays >= item.day ? 1 : 0;
          return {
            ...item,
            status: dayIndex ? 'received' : 'pending'
          };
        });
        
        this.setData({
          signDays: signDays,
          continuousDays: continuousDays,
          signRewards: signRewards,
          signStats: {
            totalDays: record.totalDays || 0,
            maxContinuous: record.maxContinuous || 0,
            currentStreak: continuousDays
          }
        });
      }
    } catch (error) {
      console.error('[获取签到记录失败]', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 签到功能 - 增强版
  async handleSignIn() {
    if (this.data.signedToday) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }
    
    try {
      this.setData({ loading: true });
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
        return;
      }
      
      const result = await signIn();
      if (result && result.success) {
        const newContinuousDays = this.data.continuousDays + 1;
        const rewardPoints = result.points || getSignInReward(newContinuousDays);
        
        // 更新签到状态
        this.setData({
          signedToday: true,
          'tasks[0].status': 1,
          'userInfo.pointsBalance': this.data.userInfo.pointsBalance + rewardPoints,
          continuousDays: newContinuousDays,
          signAnimationReward: rewardPoints,
          showSignAnimation: true
        });
        
        // 更新签到记录
        const signDays = [...this.data.signDays];
        if (!signDays.includes(this.data.today)) {
          signDays.push(this.data.today);
        }
        this.setData({ signDays });
        
        // 更新签到奖励状态
        const signRewards = this.data.signRewards.map(item => {
          return {
            ...item,
            status: newContinuousDays >= item.day ? 'received' : 'pending'
          };
        });
        this.setData({ signRewards });
        
        // 显示签到成功动画
        this.showSignSuccess(rewardPoints, newContinuousDays);
        
        // 3秒后隐藏动画
        setTimeout(() => {
          this.setData({ showSignAnimation: false });
        }, 3000);
      }
    } catch (error) {
      console.error('[签到失败]', error);
      wx.showToast({
        title: '签到失败，请稍后重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 显示签到成功动画和提示
  showSignSuccess(points, continuousDays) {
    let title = `签到成功 +${points}积分`;
    
    // 连续签到特殊提示
    if (continuousDays === 7) {
      title = `连续签到7天！获得${points}积分大奖！`;
    } else if (continuousDays >= 3) {
      title = `连续签到${continuousDays}天！获得${points}积分`;
    }
    
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
    
    // 振动反馈
    wx.vibrateShort();
  },

  // 分享小程序
  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },
  
  // 邀请好友
  handleInvite() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },
  
  // 处理任务点击
  handleTaskClick(e) {
    const { id } = e.currentTarget.dataset;
    
    switch(parseInt(id)) {
      case 1: // 签到
        this.handleSignIn();
        break;
      case 2: // 分享
        this.handleShare();
        break;
      case 3: // 邀请
        this.handleInvite();
        break;
    }
  },
  
  // 分享小程序
  onShareAppMessage() {
    return {
      title: '一起来打卡，赚取积分换好礼！',
      path: '/pages/dailyCheck/index',
      imageUrl: '/assets/icons/share.svg'
    };
  },

  // 页面跳转处理
  navigateTo(e) {
    const url = e.currentTarget?.dataset?.url || e;
    
    if (!url) {
      wx.showToast({
        title: '页面路径无效',
        icon: 'none'
      });
      return;
    }
    
    // 特殊处理：如果是跳转到积分页面
    if (url.includes('/pages/myPoints/myPoints')) {
      const app = getApp();
      app.globalData = app.globalData || {};
      app.globalData.targetTab = 1; // 积分兑换tab
      
      wx.switchTab({
        url: '/pages/booking/index',
        success: () => {
          wx.showToast({
            title: '已跳转到积分兑换',
            icon: 'success'
          });
        },
        fail: (error) => {
          console.error('跳转失败：', error);
          wx.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      });
      return;
    }
    
    wx.navigateTo({
      url,
      success: () => {
        console.log('页面跳转成功：', url);
      },
      fail: (error) => {
        console.error('页面跳转失败：', error);
        wx.showToast({
          title: '页面跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  }
}); 