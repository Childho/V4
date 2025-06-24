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
  },

  // 页面跳转处理（新增）
  navigateTo(e) {
    // 获取跳转URL，可能来自事件对象的dataset或直接传入的字符串
    const url = e.currentTarget?.dataset?.url || e;
    
    console.log('准备跳转到页面：', url); // 添加调试信息
    
    // 检查URL是否有效
    if (!url) {
      console.error('跳转URL无效：', url);
      wx.showToast({
        title: '页面路径无效',
        icon: 'none'
      });
      return;
    }
    
    // 特殊处理：如果是跳转到积分页面，改为跳转到服务页面的积分兑换tab
    if (url.includes('/pages/myPoints/myPoints')) {
      console.log('检测到积分页面跳转，转向服务页面的积分兑换tab');
      
      // 使用全局变量传递目标tab信息
      const app = getApp();
      app.globalData = app.globalData || {};
      app.globalData.targetTab = 1; // 1对应积分兑换tab
      
      // 跳转到服务页面
      wx.switchTab({
        url: '/pages/booking/index',
        success: () => {
          console.log('成功跳转到服务页面，目标tab: 积分兑换');
          wx.showToast({
            title: '已跳转到积分兑换',
            icon: 'success'
          });
        },
        fail: (error) => {
          console.error('跳转到服务页面失败：', error);
          wx.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '正在跳转...',
      mask: true
    });
    
    // 执行页面跳转
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url,
        success: () => {
          console.log('页面跳转成功：', url); // 跳转成功的调试信息
        },
        fail: (error) => {
          console.error('页面跳转失败：', url, error); // 跳转失败的调试信息
          wx.showToast({
            title: '页面跳转失败，请重试',
            icon: 'none'
          });
        }
      });
    }, 300);
  }
}); 