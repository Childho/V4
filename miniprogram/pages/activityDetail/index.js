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
      isJoined: false
    }
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
  
  // 获取活动详情
  async getActivityDetail(id) {
    console.log('开始获取活动详情，ID：', id);
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    try {
      // 模拟API请求 - 根据ID返回对应的活动数据
      const response = await new Promise(resolve => {
        setTimeout(() => {
          // 模拟不同的活动数据
          const mockActivities = {
            '1': {
              id: '1',
              title: '门店周年庆活动',
              description: '羽你同行实体店两周年店庆，全场商品8折，会员额外95折，还有精美礼品赠送！快来参与我们的庆典活动吧！',
              startTime: '2024年12月18日 10:00',
              endTime: '2024年12月24日 18:00',
              location: '倍特爱运动专卖店',
              organizer: '倍特爱运动专卖店',
              content: '<p>🎉 为庆祝倍特爱运动专卖店周年庆，我们特举办盛大庆典活动！</p><p><strong>活动亮点：</strong></p><p>• 全场商品8折优惠</p><p>• 会员额外享受95折</p><p>• 购物满299元送精美礼品</p><p>• 现场抽奖有机会获得专业球拍</p><p><strong>活动地址：</strong>倍特爱运动专卖店</p>',
              rules: '1. 活动期间每天限量100份礼品，先到先得\n2. 会员折扣与商品折扣可叠加使用\n3. 抽奖活动每人每天限参与一次\n4. 活动最终解释权归商家所有',
              coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
              isJoined: false
            },
            '2': {
              id: '2',
              title: '每周日BUFF头巾定制',
              description: '每周日购买指定号码加价15元定制BUFF头巾，个性化运动装备等你来！',
              startTime: '每周日 09:00',
              endTime: '每周日 17:00',
              location: '倍特爱运动专卖店',
              organizer: '倍特爱运动专卖店',
              content: '<p>🧢 专业运动头巾定制服务！</p><p><strong>定制说明：</strong></p><p>• 选择喜欢的号码图案</p><p>• 加价仅需15元</p><p>• 材质透气舒适</p><p>• 专业运动设计</p><p>• 一周内制作完成</p>',
              rules: '1. 每周日活动时间内下单有效\n2. 定制商品不支持退换货\n3. 制作周期为5-7个工作日\n4. 数字号码范围：0-99',
              coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
              isJoined: true
            },
            '3': {
              id: '3',
              title: '2025年新年特训营',
              description: '青少年羽毛球新年特训营，专业教练一对一指导，提升球技好时机',
              startTime: '2025年1月5日',
              endTime: '2025年2月28日',
              location: '倍特爱运动专卖店',
              organizer: '倍特爱运动专卖店',
              content: '<p>🏆 专业青少年羽毛球特训营开营啦！</p><p><strong>课程特色：</strong></p><p>• 专业教练1对1指导</p><p>• 分级训练，因材施教</p><p>• 全天候训练计划</p><p>• 比赛技巧专项训练</p><p>• 身体素质提升课程</p><p><strong>适合年龄：</strong>8-16岁青少年</p>',
              rules: '1. 需提供健康证明\n2. 训练期间需购买保险\n3. 请穿着专业运动装备\n4. 训练营不提供球拍，需自备\n5. 如遇恶劣天气将调整至室内场地',
              coverUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
              isJoined: false
            },
            '4': {
              id: '4',
              title: '春季业余联赛',
              description: '第四届春季业余羽毛球联赛报名开始，丰厚奖品等你来拿！',
              startTime: '2025年3月15日',
              endTime: '2025年3月16日',
              location: '倍特爱运动专卖店',
              organizer: '倍特爱运动专卖店',
              content: '<p>🏆 第四届春季业余羽毛球联赛即将开始！</p><p><strong>比赛信息：</strong></p><p>• 分组竞技，公平比赛</p><p>• 丰厚奖品等你来拿</p><p>• 专业裁判执法</p><p>• 免费提供比赛用球</p><p>• 现场直播精彩瞬间</p>',
              rules: '1. 年满18岁即可报名参加\n2. 需自备球拍和运动装备\n3. 比赛采用三局两胜制\n4. 请提前30分钟到场签到\n5. 如有身体不适请及时告知',
              coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
              isJoined: false
            },
            '5': {
              id: '5',
              title: '元旦跨年羽毛球赛',
              description: '元旦期间跨年羽毛球友谊赛，与球友一起迎接新年！',
              startTime: '2024年12月31日',
              endTime: '2025年1月1日',
              location: '倍特爱运动专卖店',
              organizer: '倍特爱运动专卖店',
              content: '<p>🎊 元旦跨年特别活动！</p><p><strong>活动内容：</strong></p><p>• 跨年友谊赛</p><p>• 新年祝福抽奖</p><p>• 免费提供热饮</p><p>• 精美纪念品</p><p>• 合影留念</p>',
              rules: '1. 活动免费参加\n2. 请自备运动装备\n3. 注意保暖防寒\n4. 活动期间禁止吸烟\n5. 请爱护场地设施',
              coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
              isJoined: false
            }
          };
          
          const activityData = mockActivities[id] || mockActivities['1']; // 默认返回第一个活动
          
          resolve({
            error: 0,
            body: activityData,
            message: 'success'
          });
        }, 800);
      });
      
      console.log('API响应数据：', response);
      
      if (response.error === 0) {
        this.setData({
          activity: response.body
        });
        console.log('活动数据设置完成：', response.body);
      } else {
        wx.showToast({
          title: '获取活动详情失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[Get Activity Detail Error]', error);
      wx.showToast({
        title: '获取活动详情失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
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