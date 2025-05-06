Page({
  data: {
    activeTab: 'all',
    searchKeyword: '',
    activities: [
      {
        id: 1,
        title: '门店限时活动',
        description: '全场消费满300元，享8折优惠。更多活动等你来参与！',
        startTime: '2023-09-12',
        endTime: '2023-09-24',
        location: '深圳宝安区羽毛球馆',
        imageUrl: '/assets/images/activity1.jpg',
        status: 'ongoing',
        statusText: '进行中'
      },
      {
        id: 2,
        title: '羽毛球友谊赛',
        description: '周末相聚羽毛球馆，切磋球技，结交好友。欢迎各位球友踊跃报名参加！',
        startTime: '2023-09-30',
        endTime: '2023-09-30',
        location: '深圳罗湖区体育中心',
        imageUrl: '/assets/images/activity2.jpg',
        status: 'upcoming',
        statusText: '即将开始'
      },
      {
        id: 3,
        title: '青少年羽毛球培训班',
        description: '专业教练一对一指导，提升球技，塑造未来之星！',
        startTime: '2023-10-15',
        endTime: '2023-12-15',
        location: '深圳南山区体育馆',
        imageUrl: '/assets/images/activity3.jpg',
        status: 'upcoming',
        statusText: '即将开始'
      },
      {
        id: 4,
        title: '暑期羽毛球夏令营',
        description: '为期两周的专业训练，让孩子度过快乐而充实的假期！',
        startTime: '2023-07-01',
        endTime: '2023-07-15',
        location: '深圳福田区体育中心',
        imageUrl: '/assets/images/activity4.jpg',
        status: 'ended',
        statusText: '已结束'
      }
    ],
    filteredActivities: [] as any[]
  },

  onLoad() {
    // 初始化筛选后的活动列表
    this.filterActivities()
  },

  // 切换标签
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    this.filterActivities()
  },

  // 搜索输入
  onSearchInput(e: any) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterActivities()
  },

  // 筛选活动
  filterActivities() {
    const { activities, activeTab, searchKeyword } = this.data
    
    let filtered = [...activities]
    
    // 根据标签筛选
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.status === activeTab)
    }
    
    // 根据关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword)
      )
    }
    
    this.setData({
      filteredActivities: filtered
    })
  },

  // 显示筛选选项
  showFilterOptions() {
    wx.showActionSheet({
      itemList: ['按时间排序', '按距离排序', '仅显示免费活动', '重置筛选'],
      success: (res) => {
        if (res.tapIndex !== undefined) {
          // 处理筛选逻辑
          wx.showToast({
            title: '筛选功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  // 跳转到活动详情
  goToActivityDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?id=${id}`
    })
  },

  // 报名参加活动
  joinActivity(e: any) {
    const id = e.currentTarget.dataset.id
    
    // 阻止事件冒泡
    e.stopPropagation()
    
    // 这里应该跳转到报名页面或者显示报名表单
    wx.showModal({
      title: '活动报名',
      content: '确定要报名参加该活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          })
        }
      }
    })
  },

  onPullDownRefresh() {
    // 模拟刷新数据
    setTimeout(() => {
      this.filterActivities()
      wx.stopPullDownRefresh()
    }, 1000)
  }
}) 