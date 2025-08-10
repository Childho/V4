// 每日签到页面逻辑 - 基于接口文档实现真实API调用
// 引入API接口 - 基于接口文档实现
const { 
  getPointsInfo, 
  signIn, 
  getSignInRecord 
} = require('../../api/dailyCheckApi');
const { getUserInfo } = require('../../api/userApi');

// 签到奖励配置 - 根据连续签到天数获得不同积分（与接口文档一致）
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

// 数据安全处理工具函数 - 确保API数据的安全性和一致性
const safeParseInt = (value, defaultValue = 0) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const safeParseArray = (value, defaultValue = []) => {
  return Array.isArray(value) ? value : defaultValue;
};

const safeParseBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  if (typeof value === 'number') return value === 1;
  return defaultValue;
};

Page({
  data: {
    // 用户信息 - 对应接口文档返回结构
    userInfo: {
      nickName: '微信用户',
      pointsBalance: 0
    },
    today: '',
    weekday: '',
    signedToday: false,          // 对应接口文档 isSigned
    continuousDays: 0,           // 对应接口文档 continuousDays
    currentMonth: '',
    signDays: [],                // 对应接口文档 days (本月已签到的日期数组)
    daysInMonth: [],             // 本月的所有天数
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
    // 签到统计信息 - 对应接口文档返回字段
    signStats: {
      totalDays: 0,             // 对应接口文档 totalDays
      maxContinuous: 0,         // 对应接口文档 maxContinuous
      currentStreak: 0          // 对应接口文档 continuousDays
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

  // 获取用户信息 - 基于接口文档实现
  async getUserInfo() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) {
        console.log('用户未登录，使用默认数据');
        return;
      }
      
      const response = await getUserInfo();
      if (response && response.userInfo) {
        // 安全处理用户信息数据 - 按照接口文档结构
        this.setData({
          'userInfo.nickName': response.userInfo.nickName || '微信用户',
          'userInfo.pointsBalance': response.userInfo.pointsBalance || 0
        });
        console.log('用户信息获取成功', response);
      }
    } catch (error) {
      console.error('[获取用户信息失败]', error);
      // 根据错误类型显示不同提示
      const errorMessage = (error)?.message || '未知错误';
      if (errorMessage === '未登录') {
        // 已在apiRequest中处理跳转
      } else {
        console.log('API失败，使用默认用户数据:', errorMessage);
      }
    }
  },

  // 获取签到状态 - 基于接口文档实现
  async getSignInStatus() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) {
        console.log('用户未登录，跳过积分信息获取');
        return;
      }
      
      const pointsInfo = await getPointsInfo();
      if (pointsInfo) {
        // 按照接口文档字段处理数据 - 使用安全解析函数
        const isSigned = safeParseBoolean(pointsInfo.isSigned, false);     // 对应接口文档 isSigned
        const balance = safeParseInt(pointsInfo.balance, 0);               // 对应接口文档 balance
        
        this.setData({
          signedToday: isSigned,
          'userInfo.pointsBalance': balance,
          'tasks[0].status': isSigned ? 1 : 0
        });
        console.log('积分信息获取成功', pointsInfo);
      }
    } catch (error) {
      console.error('[获取签到状态失败]', error);
      // 根据错误类型显示不同提示
      const errorMessage = (error)?.message || '未知错误';
      if (errorMessage === '未登录') {
        // 已在apiRequest中处理跳转
      } else {
        console.log('API失败，使用默认积分数据:', errorMessage);
      }
    }
  },

  // 获取签到记录 - 基于接口文档实现
  async getSignInRecord() {
    try {
      this.setData({ loading: true });
      const token = wx.getStorageSync('token');
      if (!token) {
        console.log('用户未登录，跳过签到记录获取');
        return;
      }
      
      const record = await getSignInRecord();
      if (record) {
        // 按照接口文档字段处理数据 - 使用安全解析函数
        const continuousDays = safeParseInt(record.continuousDays, 0);     // 对应接口文档 continuousDays
        const signDays = safeParseArray(record.days, []);                  // 对应接口文档 days
        const totalDays = safeParseInt(record.totalDays, 0);               // 对应接口文档 totalDays
        const maxContinuous = safeParseInt(record.maxContinuous, 0);       // 对应接口文档 maxContinuous
        
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
            totalDays: totalDays,
            maxContinuous: maxContinuous,
            currentStreak: continuousDays
          }
        });
        console.log('签到记录获取成功', record);
      }
    } catch (error) {
      console.error('[获取签到记录失败]', error);
      // 根据错误类型显示不同提示
      const errorMessage = (error)?.message || '未知错误';
      if (errorMessage === '未登录') {
        // 已在apiRequest中处理跳转
      } else {
        console.log('API失败，使用默认签到记录:', errorMessage);
        // 设置默认值避免页面报错
        this.setData({
          signDays: [],
          continuousDays: 0,
          signStats: {
            totalDays: 0,
            maxContinuous: 0,
            currentStreak: 0
          }
        });
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  // 签到功能 - 基于接口文档实现
  async handleSignIn() {
    if (this.data.signedToday) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }
    
    // 检查用户登录状态
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
    
    try {
      this.setData({ loading: true });
      
      const result = await signIn();
      console.log('[Sign In Success]', result);
      
      if (result && result.success) {
        // 按照接口文档处理返回数据 - 使用安全解析函数
        const rewardPoints = safeParseInt(result.points, 5);                    // 对应接口文档 points
        const newContinuousDays = safeParseInt(result.continuousDays, 1);       // 对应接口文档 continuousDays
        const totalPoints = safeParseInt(result.totalPoints, 0);               // 对应接口文档 totalPoints
        
        // 更新签到状态
        this.setData({
          signedToday: true,
          'tasks[0].status': 1,
          'userInfo.pointsBalance': totalPoints,                              // 使用API返回的总积分
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
        
        // 更新统计信息
        this.setData({
          'signStats.currentStreak': newContinuousDays,
          'signStats.totalDays': this.data.signStats.totalDays + 1,
          'signStats.maxContinuous': Math.max(this.data.signStats.maxContinuous, newContinuousDays)
        });
        
        // 显示签到成功动画
        this.showSignSuccess(rewardPoints, newContinuousDays);
        
        // 3秒后隐藏动画
        setTimeout(() => {
          this.setData({ showSignAnimation: false });
        }, 3000);
      }
    } catch (error) {
      console.error('[签到失败]', error);
      
      // 根据接口文档的错误码处理
      const errorCode = error?.error || error?.code || 0;
      const errorMessage = error?.message || '未知错误';
      
      switch (errorCode) {
        case 401:
          // 未登录 - 跳转到登录页面
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/index'
            });
          }, 1500);
          break;
          
        case 1001:
          // 今日已签到
          wx.showToast({
            title: '今日已签到',
            icon: 'none'
          });
          // 更新本地状态
          this.setData({ signedToday: true });
          break;
          
        case 1002:
          // 签到失败
          wx.showToast({
            title: '签到失败，请重试',
            icon: 'none'
          });
          break;
          
        case 500:
          // 系统异常
          wx.showToast({
            title: '系统异常，请稍后重试',
            icon: 'none'
          });
          break;
          
        default:
          // 其他错误
          if (errorMessage.includes('已签到')) {
            wx.showToast({
              title: '今日已签到',
              icon: 'none'
            });
            this.setData({ signedToday: true });
          } else {
            wx.showToast({
              title: errorMessage || '签到失败，请稍后重试',
              icon: 'none'
            });
          }
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  // 显示签到成功动画和提示 - 基于接口文档优化
  showSignSuccess(points, continuousDays) {
    let title = `签到成功 +${points}积分`;
    
    // 根据接口文档的奖励机制显示特殊提示
    if (continuousDays === 7) {
      title = `连续签到7天！获得${points}积分大奖！🎉`;
    } else if (continuousDays === 6) {
      title = `连续签到${continuousDays}天！获得${points}积分，明天可得大奖！`;
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
    
    // 特殊节点的额外反馈
    if (continuousDays === 7) {
      // 连续7天的特殊庆祝
      setTimeout(() => {
        wx.showModal({
          title: '恭喜您！',
          content: '连续签到7天达成！您是最棒的！明天开始新的签到周期。',
          showCancel: false,
          confirmText: '继续加油'
        });
      }, 2500);
    }
  },

  // 分享小程序 - 增强版功能
  async handleShare() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });

      // 这里可以调用分享任务完成接口（如果有的话）
      wx.showToast({
        title: '分享功能已开启',
        icon: 'success'
      });
    } catch (error) {
      console.error('[分享功能失败]', error);
      // 即使API失败，仍然显示分享菜单
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }
  },
  
  // 邀请好友 - 增强版功能
  async handleInvite() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });

      wx.showToast({
        title: '请将签到页面分享给好友',
        icon: 'none'
      });
    } catch (error) {
      console.error('[邀请功能失败]', error);
      // 即使出错，仍然显示分享菜单
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }
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