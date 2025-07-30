// 引入活动API接口 - 注意：使用编译后的JS文件
const { getActivityDetail, signupActivity } = require('../../api/activityApi');

Page({
  data: {
    // 初始化活动数据结构 - 严格按照接口文档定义
    activity: {
      id: '',                // 活动唯一ID
      title: '',             // 活动标题
      description: '',       // 活动详细描述
      startTime: '',         // 活动开始时间（格式化字符串）
      endTime: '',           // 活动结束时间（格式化字符串）
      location: '',          // 活动地点
      organizer: '',         // 主办方名称
      content: '',           // 活动内容（HTML格式）
      rules: '',             // 活动规则（换行符分隔）
      coverUrl: '',          // 活动封面图片URL
      isJoined: false        // 是否已报名
    },
    loading: false           // 加载状态
  },
  
  onLoad(options) {
    console.log('活动详情页面onLoad，接收到的参数：', options);
    
    const { id } = options;
    console.log('活动ID：', id);
    
    if (id) {
      this.setData({
        'activity.id': id
      });
      this.getActivityDetail(id);
    } else {
      console.error('未接收到活动ID参数');
      wx.showToast({
        title: '参数错误',
        icon: 'none',
        duration: 2000
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },
  
  // 获取活动详情 - 使用真实API接口
  async getActivityDetail(id) {
    console.log('开始获取活动详情，ID：', id);
    
    this.setData({ loading: true });
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    try {
      // 调用活动详情API - 严格按照接口文档规范
      const activityDetail = await getActivityDetail(id);
      
      console.log('API响应数据：', activityDetail);
      
      // 确保所有字段都有默认值，避免页面报错
      const safeActivityData = {
        id: activityDetail.id || '',
        title: activityDetail.title || '活动标题',
        description: activityDetail.description || '活动描述',
        startTime: activityDetail.startTime || '',
        endTime: activityDetail.endTime || '',
        location: activityDetail.location || '活动地点',
        organizer: activityDetail.organizer || '主办方',
        content: activityDetail.content || '<p>活动内容</p>',
        rules: activityDetail.rules || '活动规则',
        coverUrl: activityDetail.coverUrl || '',
        isJoined: activityDetail.isJoined || false
      };
      
      this.setData({
        activity: safeActivityData
      });
      
      console.log('活动数据设置完成：', safeActivityData);
      
    } catch (error) {
      console.error('[Get Activity Detail Error]', error);
      
      // 处理不同类型的错误
      let errorMessage = '获取活动详情失败';
      
      if (error.error === 401) {
        errorMessage = '请先登录';
        // 跳转到登录页面
        wx.navigateTo({
          url: '/pages/login/index'
        });
        return;
      } else if (error.error === 1004) {
        errorMessage = '活动不存在或已下线';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
      
      // 错误情况下延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },
  
  // 报名活动 - 使用真实API接口
  async handleJoin() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      });
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/index'
        });
      }, 1500);
      return;
    }
    
    // 检查是否已报名
    if (this.data.activity.isJoined) {
      wx.showToast({
        title: '你已报名此活动',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 确认报名弹窗
    const confirmResult = await new Promise(resolve => {
      wx.showModal({
        title: '确认报名',
        content: `确定要报名参加"${this.data.activity.title}"吗？`,
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
    
    if (!confirmResult) {
      return;
    }
    
    wx.showLoading({
      title: '报名中...',
      mask: true
    });
    
    try {
      // 调用报名API - 严格按照接口文档规范
      const signupResult = await signupActivity(this.data.activity.id);
      
      console.log('报名API响应：', signupResult);
      
      // 报名成功，更新页面状态
      this.setData({
        'activity.isJoined': true
      });
      
      wx.showToast({
        title: signupResult.message || '报名成功',
        icon: 'success',
        duration: 2000
      });
      
      // 轻微震动反馈
      wx.vibrateShort({
        type: 'light'
      });
      
    } catch (error) {
      console.error('[Join Activity Error]', error);
      
      // 处理各种业务错误码
      let errorMessage = '报名失败，请重试';
      
      if (error.error === 401) {
        errorMessage = '请先登录';
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else if (error.error === 1003) {
        errorMessage = '你已报名此活动';
        // 更新页面状态
        this.setData({
          'activity.isJoined': true
        });
      } else if (error.error === 1001) {
        errorMessage = '报名人数已满';
      } else if (error.error === 1002) {
        errorMessage = '报名已截止';
      } else if (error.error === 1004) {
        errorMessage = '活动不存在或已下线';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 分享活动
  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },
  
  // 转发给朋友
  onShareAppMessage() {
    return {
      title: this.data.activity.title || '精彩活动推荐',
      path: `/pages/activityDetail/index?id=${this.data.activity.id}`,
      imageUrl: this.data.activity.coverUrl
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.data.activity.title || '精彩活动推荐',
      query: `id=${this.data.activity.id}`,
      imageUrl: this.data.activity.coverUrl
    };
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 预览图片
  previewImage() {
    if (this.data.activity.coverUrl) {
      wx.previewImage({
        urls: [this.data.activity.coverUrl],
        current: this.data.activity.coverUrl
      });
    }
  }
}) 