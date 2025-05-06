App({
  onLaunch() {
    // 检查是否有新版本
    this.checkUpdate()
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    
    // 缓存一些常用的系统尺寸信息
    this.globalData.statusBarHeight = systemInfo.statusBarHeight
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    this.globalData.menuButtonHeight = menuButtonInfo.height
    this.globalData.menuButtonTop = menuButtonInfo.top
    
    // 计算导航栏高度 = 状态栏高度 + 胶囊按钮高度 + 外边距
    this.globalData.navBarHeight = systemInfo.statusBarHeight + menuButtonInfo.height + (menuButtonInfo.top - systemInfo.statusBarHeight) * 2
    
    // 登录逻辑
    this.checkLogin()
  },
  
  // 检查小程序版本更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (result) => {
                if (result.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          
          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本下载失败，请检查网络后重试',
              showCancel: false
            })
          })
        }
      })
    }
  },
  
  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.isLogin = true
    } else {
      this.globalData.isLogin = false
    }
  },
  
  globalData: {
    userInfo: null,
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,
    menuButtonHeight: 0,
    menuButtonTop: 0,
    isLogin: false,
  }
}) 