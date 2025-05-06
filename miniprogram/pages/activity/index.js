Page({
  data: {
    status: 'all', // 活动状态筛选：all-全部，ongoing-进行中，finished-已结束，coming-即将开始
    activities: [], // 活动列表
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    hasMore: true, // 是否有更多数据
    loading: false, // 加载状态
    searchKeyword: '', // 搜索关键词
    showFilterPanel: false // 是否显示筛选面板
  },
  
  onLoad: function (options) {
    this.getActivities();
  },
  
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      activities: [],
      hasMore: true
    });
    this.getActivities();
    wx.stopPullDownRefresh();
  },
  
  // 切换状态筛选
  changeStatus: function (e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      status,
      page: 1,
      activities: [],
      hasMore: true
    });
    this.getActivities();
  },
  
  // 获取活动列表
  getActivities: function () {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ loading: true });
    
    // 模拟API请求，实际开发中应替换为真实的API调用
    setTimeout(() => {
      const mockActivities = this.getMockActivities();
      
      // 根据状态筛选
      let filteredActivities = mockActivities;
      if (this.data.status !== 'all') {
        filteredActivities = mockActivities.filter(item => item.status === this.data.status);
      }
      
      // 根据关键词搜索
      if (this.data.searchKeyword) {
        const keyword = this.data.searchKeyword.toLowerCase();
        filteredActivities = filteredActivities.filter(item => 
          item.title.toLowerCase().includes(keyword) || 
          item.description.toLowerCase().includes(keyword)
        );
      }
      
      // 分页处理
      const start = (this.data.page - 1) * this.data.pageSize;
      const end = start + this.data.pageSize;
      const pageActivities = filteredActivities.slice(start, end);

      this.setData({
        activities: this.data.page === 1 ? pageActivities : this.data.activities.concat(pageActivities),
        hasMore: end < filteredActivities.length,
        loading: false
      });
    }, 800);
  },
  
  // 模拟活动数据
  getMockActivities: function() {
    return [
      {
        id: 1,
        title: '门店周年庆活动',
        description: '羽你同行实体店两周年店庆，全场商品8折，会员额外95折，还有精美礼品赠送！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '6月18日',
        endTime: '6月24日',
        location: '羽你同行旗舰店',
        status: 'ongoing',
        isFull: false
      },
      {
        id: 2,
        title: '每周日BUFF',
        description: '每周日购买指定号码加价15元定制BUFF头巾',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '6月18日',
        endTime: '6月24日',
        location: '线上活动',
        status: 'ongoing',
        isFull: false
      },
      {
        id: 3,
        title: '暑期特训营',
        description: '青少年羽毛球暑期特训营，专业教练一对一指导，提升球技好时机',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '7月1日',
        endTime: '8月31日',
        location: '市体育中心',
        status: 'coming',
        isFull: false
      },
      {
        id: 4,
        title: '城市业余联赛',
        description: '第三届城市业余羽毛球联赛报名开始，丰厚奖品等你来拿！',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '7月15日',
        endTime: '7月16日',
        location: '奥体中心',
        status: 'coming',
        isFull: false
      },
      {
        id: 5,
        title: '五一优惠活动',
        description: '五一期间，全场羽毛球装备8折优惠，买就送专业羽毛球一筒',
        coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        startTime: '5月1日',
        endTime: '5月5日',
        location: '线上线下同步',
        status: 'finished',
        isFull: false
      }
    ];
  },
  
  // 滚动加载更多
  loadMore: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      });
      this.getActivities();
    }
  },
  
  // 跳转到活动详情页
  goDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activityDetail/index?id=${id}`
    });
  },
  
  // 搜索活动
  onSearch: function(e) {
    const searchKeyword = e.detail.value || '';
    this.setData({
      searchKeyword,
      page: 1,
      activities: [],
      hasMore: true
    });
    this.getActivities();
  },
  
  // 显示筛选面板
  showFilter: function() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },
  
  // 活动报名
  signup: function(e) {
    const id = e.currentTarget.dataset.id;
    // 阻止冒泡，防止触发goDetail
    wx.showModal({
      title: '活动报名',
      content: '确认报名参加该活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },
  
  // 页面跳转
  navigateTo: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  }
}) 