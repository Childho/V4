Page({
  data: {
    // 基本页面数据
  },

  onLoad: function() {
    // 页面加载时执行
  },

  onShow: function() {
    // 页面显示时执行
  },

  // 页面相关事件处理函数
  onShareAppMessage: function() {
    return {
      title: '网球商城',
      path: '/pages/mall/index'
    }
  }
}) 