// 引入系统信息工具函数
import { getStatusBarHeight } from '../../utils/systemInfo.js'

Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: true
    }
  },
  
  data: {
    statusBarHeight: 0
  },

  lifetimes: {
    attached() {
      // 使用新的API获取状态栏高度，替代已弃用的wx.getSystemInfoSync
      const statusBarHeight = getStatusBarHeight()
      this.setData({
        statusBarHeight: statusBarHeight
      })
    }
  },

  methods: {
    onBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    }
  }
}) 