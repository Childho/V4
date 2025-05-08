// 引入API接口
const userApi = require('../../api/userApi')
const { api } = require('../../api/utils/request')

// 获取积分信息
const getPoints = () => {
  return api.post('/points/info', {});
};

// 签到
const signIn = () => {
  return api.post('/points/signIn', {});
};

// 获取签到记录
const getSignInRecord = () => {
  return api.post('/points/signInRecord', {});
};

Page({
  data: {
    userInfo: {
      nickName: '张小燕',
      pointsBalance: 280
    },
    today: '',
    weekday: '',
    signedToday: false,
    continuousDays: 7,
    currentMonth: '',
    signDays: [], // 本月已签到的日期数组
    daysInMonth: [], // 本月的所有天数
    tasks: [
      { id: 1, name: '每日签到', desc: '连续签到7天额外奖励30积分', icon: 'check-in', status: 0 },
      { id: 2, name: '分享小程序', desc: '分享给好友获得5积分', icon: 'share', status: 0 },
      { id: 3, name: '邀请好友', desc: '成功邀请1位好友获得30积分', icon: 'invite', status: 0 }
    ],
    loading: false
  },

  onLoad() {
    this.initCalendar();
    this.getUserInfo();
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
      if (record && record.days) {
        this.setData({
          signDays: record.days || [], // 已签到的日期
          continuousDays: record.continuousDays || 0
        });
      }
    } catch (error) {
      console.error('[获取签到记录失败]', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 签到功能
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
        wx.navigateTo({
          url: '/pages/login/index'
        });
        return;
      }
      
      const result = await signIn();
      if (result && result.success) {
        // 更新签到状态
        this.setData({
          signedToday: true,
          'tasks[0].status': 1,
          'userInfo.pointsBalance': this.data.userInfo.pointsBalance + (result.points || 5)
        });
        
        // 更新签到记录
        const signDays = [...this.data.signDays];
        if (!signDays.includes(this.data.today)) {
          signDays.push(this.data.today);
        }
        this.setData({ 
          signDays,
          continuousDays: this.data.continuousDays + 1
        });
        
        wx.showToast({
          title: `签到成功 +${result.points || 5}积分`,
          icon: 'success'
        });
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
      path: '/pages/index/index',
      imageUrl: '/assets/icons/share.svg'
    };
  }
}); 