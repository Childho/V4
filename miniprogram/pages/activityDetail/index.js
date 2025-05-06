Page({
  data: {
    activity: {
      id: '',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      organizer: '',
      content: '',
      rules: '',
      coverUrl: '',
      isJoined: false,
      participants: []
    }
  },
  
  onLoad(options) {
    const { id } = options
    
    if (id) {
      this.setData({
        'activity.id': id
      })
      this.getActivityDetail(id)
    }
  },
  
  // 获取活动详情
  async getActivityDetail(id) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    try {
      // 模拟API请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            error: 0,
            body: {
              id,
              title: '门店限时活动',
              description: '参与活动即可获得积分奖励，还有机会获得限量版球拍！',
              startTime: '2023-08-01 10:00',
              endTime: '2023-08-15 18:00',
              location: '北京市朝阳区网球馆',
              organizer: '倍特爱运动',
              content: '<p>活动期间，凡在本店购买任意商品即可参与抽奖，有机会获得限量版网球拍！</p><p>同时，活动期间每消费100元即可获得10积分，积分可在商城兑换礼品。</p>',
              rules: '1. 每人每天限参与一次抽奖\n2. 积分有效期为3个月\n3. 活动最终解释权归商家所有',
              coverUrl: '/assets/images/activity1.jpg',
              isJoined: Math.random() > 0.5,
              participants: [
                {
                  id: 'user_1',
                  nickName: '用户1',
                  avatarUrl: '/assets/images/default-avatar.png'
                },
                {
                  id: 'user_2',
                  nickName: '用户2',
                  avatarUrl: '/assets/images/default-avatar.png'
                },
                {
                  id: 'user_3',
                  nickName: '用户3',
                  avatarUrl: '/assets/images/default-avatar.png'
                }
              ]
            },
            message: ''
          })
        }, 500)
      })
      
      if (response.error === 0) {
        this.setData({
          activity: response.body
        })
      } else {
        wx.showToast({
          title: '获取活动详情失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('[Get Activity Detail Error]', error)
      wx.showToast({
        title: '获取活动详情失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },
  
  // 报名活动
  async handleJoin() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    if (this.data.activity.isJoined) {
      wx.showToast({
        title: '你已报名此活动',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '报名中...',
      mask: true
    })
    
    try {
      // 模拟API请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            error: 0,
            body: {},
            message: ''
          })
        }, 500)
      })
      
      if (response.error === 0) {
        this.setData({
          'activity.isJoined': true
        })
        
        wx.showToast({
          title: '报名成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '报名失败，请重试',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('[Join Activity Error]', error)
      wx.showToast({
        title: '报名失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },
  
  // 分享活动
  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  
  onShareAppMessage() {
    return {
      title: this.data.activity.title,
      path: `/pages/activityDetail/index?id=${this.data.activity.id}`,
      imageUrl: this.data.activity.coverUrl
    }
  },
  
  onShareTimeline() {
    return {
      title: this.data.activity.title,
      query: `id=${this.data.activity.id}`,
      imageUrl: this.data.activity.coverUrl
    }
  }
}) 