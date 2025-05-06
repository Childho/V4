Page({
  data: {
    activityInfo: null
  },

  onLoad: function(options) {
    // 页面加载时获取活动ID
    if (options.id) {
      this.getActivityDetail(options.id);
    }
  },

  getActivityDetail: function(id) {
    // TODO: 调用接口获取活动详情
  }
}); 