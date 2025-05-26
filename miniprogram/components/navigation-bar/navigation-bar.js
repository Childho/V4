Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    background: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    },
    loading: {
      type: Boolean,
      value: false
    },
    homeButton: {
      type: Boolean,
      value: false,
    },
    animated: {
      // 显示隐藏的时候opacity动画效果
      type: Boolean,
      value: true
    },
    show: {
      // 显示隐藏导航，隐藏的时候navigation-bar的高度占位还在
      type: Boolean,
      value: true,
      observer: '_showChange'
    },
    // back为true的时候，返回的页面深度
    delta: {
      type: Number,
      value: 1
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    displayStyle: '',
    // 添加初始化状态，防止尺寸计算值暂时显示
    isReady: false,
    innerPaddingRight: '',
    leftWidth: '',
    safeAreaTop: '',
    ios: false
  },
  lifetimes: {
    attached() {
      const rect = wx.getMenuButtonBoundingClientRect()
      wx.getSystemInfo({
        success: (res) => {
          const isAndroid = res.platform === 'android'
          const isDevtools = res.platform === 'devtools'
          // 计算布局数据
          const innerPaddingRight = `padding-right: ${res.windowWidth - rect.left}px`
          const leftWidth = `width: ${res.windowWidth - rect.left }px`
          const safeAreaTop = isDevtools || isAndroid ? `height: calc(var(--height) + ${res.safeArea.top}px); padding-top: ${res.safeArea.top}px` : ``
          
          // 一次性设置所有数据，并标记为准备就绪
          this.setData({
            ios: !isAndroid,
            innerPaddingRight,
            leftWidth,
            safeAreaTop,
            isReady: true  // 标记初始化完成，防止计算值暂时显示
          })
        }
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _showChange(show) {
      const animated = this.data.animated
      let displayStyle = ''
      if (animated) {
        displayStyle = `opacity: ${
          show ? '1' : '0'
        };transition:opacity 0.5s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`
      }
      this.setData({
        displayStyle
      })
    },
    back() {
      const data = this.data
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta
        })
      }
      this.triggerEvent('back', { delta: data.delta }, {})
    },
    home() {
      console.log('点击回到首页')
      wx.switchTab({
        url: '/pages/index/index',
        success: () => {
          console.log('成功跳转到首页')
        },
        fail: (err) => {
          console.error('跳转到首页失败', err)
        }
      })
      this.triggerEvent('home', {}, {})
    }
  },
}) 