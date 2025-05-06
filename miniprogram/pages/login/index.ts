import { request } from '../../utils/request'

Page({
  data: {
  },

  onLoad() {
  },

  // 处理登录
  async handleLogin() {
    try {
      // 获取用户授权
      const { code } = await wx.login()
      
      // 调用登录接口
      const res = await request('/api/user/login', { code })
      
      // 保存token
      wx.setStorageSync('token', res.token)
      
      // 返回上一页或首页
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    } catch (error) {
      console.error('[Login Error]', error)
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }
  },

  // 查看隐私政策
  handleViewPrivacy() {
    wx.navigateTo({
      url: '/pages/webview/index?type=privacy'
    })
  },

  // 查看用户协议
  handleViewTerms() {
    wx.navigateTo({
      url: '/pages/webview/index?type=terms'
    })
  }
}) 