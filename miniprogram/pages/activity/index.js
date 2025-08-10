// 引入活动API接口 - 注意：由于小程序不直接支持TS，需要编译后的JS文件
const { getActivityList, searchActivities, getActivityStats, signupActivity } = require('../../api/activityApi');

Page({
  data: {
    status: 'all', // 活动状态筛选：all-全部，ongoing-进行中，coming-即将开始，finished-已结束
    activities: [], // 活动列表 - 符合接口文档 ActivityItem[] 格式
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    hasMore: true, // 是否有更多数据
    loading: false, // 加载状态
    searchKeyword: '', // 搜索关键词
    showFilterPanel: false, // 是否显示筛选面板
    searchFocused: false // 搜索框是否聚焦
  },
  
  onLoad: function (options) {
    // 页面加载时获取活动列表
    this.getActivities();
  },
  
  onPullDownRefresh: function () {
    // 下拉刷新：重置分页数据并重新加载
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
  
  // 获取活动列表 - 使用真实API接口
  getActivities: function () {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ loading: true });
    
    // 构建符合接口文档的请求参数
    const requestParams = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      status: this.data.status,
      searchKeyword: this.data.searchKeyword
    };
    
    // 调用活动列表API - 严格按照接口文档规范
    getActivityList(requestParams)
      .then(response => {
        // 响应数据结构：{ activities: ActivityItem[], pagination: PaginationInfo }
        const { activities, pagination } = response;
        
        this.setData({
          // 如果是第一页，直接替换；否则追加到现有列表
          activities: this.data.page === 1 ? activities : this.data.activities.concat(activities),
          hasMore: pagination.hasMore,
          loading: false
        });
      })
      .catch(error => {
        console.error('获取活动列表失败:', error);
        this.setData({ loading: false });
        
        // 统一错误提示（apiRequest已经处理了错误提示，这里主要是兜底）
        wx.showToast({
          title: '获取活动列表失败',
          icon: 'none',
          duration: 2000
        });
      });
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
    console.log('goDetail被触发，事件对象：', e);
    
    const id = e.currentTarget.dataset.id;
    console.log('获取到的活动ID：', id);
    
    if (!id) {
      console.error('活动ID为空，无法跳转');
      wx.showToast({
        title: '参数错误，无法跳转',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 添加跳转前的提示（可选，用于调试）
    console.log('准备跳转到活动详情页，ID：', id);
    
    // 使用try-catch捕获跳转错误
    try {
      wx.navigateTo({
        url: `/pages/activityDetail/index?id=${id}`,
        success: function(res) {
          console.log('页面跳转成功', res);
        },
        fail: function(err) {
          console.error('页面跳转失败', err);
          wx.showToast({
            title: '页面跳转失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } catch (error) {
      console.error('跳转过程中发生错误：', error);
      wx.showToast({
        title: '跳转失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 搜索输入框内容变化
  onSearchInput: function(e) {
    const searchKeyword = e.detail.value || '';
    this.setData({
      searchKeyword
    });
  },
  
  // 搜索确认 - 使用搜索API接口
  onSearchConfirm: function() {
    const searchKeyword = this.data.searchKeyword.trim();
    
    // 重置页面数据并重新搜索
    this.setData({
      page: 1,
      activities: [],
      hasMore: true
    });
    
    // 如果有搜索关键词，调用搜索接口；否则调用普通列表接口
    if (searchKeyword) {
      this.performSearch(searchKeyword);
    } else {
      this.getActivities();
    }
  },
  
  // 执行搜索 - 使用真实搜索API
  performSearch: function(searchKeyword) {
    this.setData({ loading: true });
    
    // 构建符合接口文档的搜索参数
    const searchParams = {
      searchKeyword: searchKeyword,
      page: this.data.page,
      pageSize: this.data.pageSize,
      status: this.data.status
    };
    
    // 调用搜索API - 严格按照接口文档规范
    searchActivities(searchParams)
      .then(response => {
        // 响应数据结构：{ activities: ActivityItem[], pagination: PaginationInfo, searchSummary: SearchSummary }
        const { activities, pagination, searchSummary } = response;
        
        this.setData({
          activities: this.data.page === 1 ? activities : this.data.activities.concat(activities),
          hasMore: pagination.hasMore,
          loading: false
        });
        
        // 显示搜索结果反馈
        wx.showToast({
          title: `找到${searchSummary.totalMatched}个相关活动`,
          icon: 'success',
          duration: 1500
        });
      })
      .catch(error => {
        console.error('搜索活动失败:', error);
        this.setData({ loading: false });
        
        wx.showToast({
          title: '搜索失败，请重试',
          icon: 'none',
          duration: 2000
        });
      });
  },
  
  // 搜索框聚焦时添加高亮样式 - 产品级交互优化
  onSearchFocus: function() {
    this.setData({
      searchFocused: true
    });
    
    // 产品级细节：聚焦时轻微震动反馈（可选）
    wx.vibrateShort({
      type: 'light'
    });
  },

  // 搜索框失焦时移除高亮样式 - 产品级交互优化
  onSearchBlur: function() {
    this.setData({
      searchFocused: false
    });
  },
  
  // 优化搜索按钮点击事件 - 产品级用户体验
  handleSearch: function() {
    const searchKeyword = this.data.searchKeyword.trim();
    
    // 产品级验证：空搜索提示
    if (!searchKeyword) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    // 产品级反馈：搜索开始提示
    wx.showLoading({
      title: '搜索中...',
      mask: true
    });
    
    // 重置搜索结果
    this.setData({
      page: 1,
      activities: [],
      hasMore: true
    });
    
    // 执行搜索
    this.performSearch(searchKeyword);
    
    // 隐藏加载提示
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
  },
  
  // 显示筛选面板
  showFilter: function() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },
  
  // 活动报名 - 使用真实API接口
  signup: function(e) {
    const id = e.currentTarget.dataset.id;
    
    // 确认报名弹窗
    wx.showModal({
      title: '活动报名',
      content: '确认报名参加该活动吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用报名API - 严格按照接口文档规范
          signupActivity(id)
            .then(response => {
              // 响应数据结构：{ success: boolean, message: string }
              if (response.success) {
                wx.showToast({
                  title: response.message || '报名成功',
                  icon: 'success',
                  duration: 2000
                });
                
                // 报名成功后，刷新活动列表
                this.setData({
                  page: 1,
                  activities: [],
                  hasMore: true
                });
                this.getActivities();
              } else {
                wx.showToast({
                  title: response.message || '报名失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            })
            .catch(error => {
              console.error('活动报名失败:', error);
              wx.showToast({
                title: '报名失败，请重试',
                icon: 'none',
                duration: 2000
              });
            });
        }
      }
    });
  }
}) 