Page({
  data: {
    cartCount: 2, // 购物车商品数量
    showSpecsPopup: false, // 是否显示规格选择弹窗
    quantity: 1, // 选择的商品数量
    selectedSpecs: '', // 已选择的规格文本
    currentAction: '', // 当前操作：'cart'加入购物车 或 'buy'立即购买
    product: {
      id: '',
      name: '',
      price: '',
      description: '',
      brand: '',
      salesCount: 0,
      isFavorite: false,
      images: [],
      specs: [],
      detailContent: '',
      optionGroups: []
    },
    relatedProducts: []
  },
  
  onLoad(options) {
    const { id } = options
    
    if (id) {
      this.setData({
        'product.id': id
      })
      this.getProductDetail(id)
    }
  },
  
  // 获取商品详情
  async getProductDetail(id) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    try {
      // 模拟API请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            error: 0,
            body: {
              id,
              name: 'YONEX 网球拍 VR-800 专业训练拍',
              price: '899.00',
              description: '轻量碳素纤维材质，适合初学者和进阶球员使用',
              brand: 'YONEX',
              salesCount: 256,
              isFavorite: false,
              images: [
                '/assets/images/product1.jpg',
                '/assets/images/product1-2.jpg',
                '/assets/images/product1-3.jpg'
              ],
              specs: [
                { name: '材质', value: '碳素纤维' },
                { name: '规格', value: '27英寸' },
                { name: '重量', value: '280g' },
                { name: '适用人群', value: '成人' },
                { name: '保修期', value: '12个月' }
              ],
              detailContent: '<p><img src="/assets/images/product_detail1.jpg" style="width:100%"></p><p>YONEX VR-800 是一款专业的网球拍，采用高质量的碳素纤维材质，能够提供良好的控制性和舒适的手感。特殊的框架设计增强了拍面稳定性，减少振动，降低手臂疲劳。适合初学者和进阶球员使用。</p>',
              optionGroups: [
                {
                  name: '颜色',
                  options: [
                    { value: '蓝色', selected: false, disabled: false },
                    { value: '红色', selected: false, disabled: false },
                    { value: '黑色', selected: false, disabled: false }
                  ]
                },
                {
                  name: '规格',
                  options: [
                    { value: '标准版', selected: false, disabled: false },
                    { value: '豪华版', selected: false, disabled: false }
                  ]
                }
              ]
            },
            message: ''
          })
        }, 500)
      })
      
      if (response.error === 0) {
        this.setData({
          product: response.body
        })
        this.getRelatedProducts()
      } else {
        wx.showToast({
          title: '获取商品详情失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('[Get Product Detail Error]', error)
      wx.showToast({
        title: '获取商品详情失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },
  
  // 获取相关商品
  async getRelatedProducts() {
    try {
      // 模拟API请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            error: 0,
            body: [
              {
                id: 'product_2',
                name: 'VICTOR 专业球鞋',
                price: '499.00',
                imageUrl: '/assets/images/product2.jpg'
              },
              {
                id: 'product_3',
                name: '高弹性网球 8只装',
                price: '129.00',
                imageUrl: '/assets/images/product3.jpg'
              },
              {
                id: 'product_4',
                name: '专业运动护腕',
                price: '69.00',
                imageUrl: '/assets/images/product4.jpg'
              }
            ],
            message: ''
          })
        }, 300)
      })
      
      if (response.error === 0) {
        this.setData({
          relatedProducts: response.body
        })
      }
    } catch (error) {
      console.error('[Get Related Products Error]', error)
    }
  },
  
  // 返回首页
  handleToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  
  // 添加/取消收藏
  async handleAddFavorite() {
    const isFavorite = this.data.product.isFavorite
    
    try {
      // 模拟API请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            error: 0,
            body: {},
            message: ''
          })
        }, 300)
      })
      
      if (response.error === 0) {
        this.setData({
          'product.isFavorite': !isFavorite
        })
        
        wx.showToast({
          title: isFavorite ? '已取消收藏' : '已加入收藏',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('[Favorite Error]', error)
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  },
  
  // 跳转到购物车
  handleToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  },
  
  // 打开规格选择弹窗 - 加入购物车
  handleAddToCart() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    this.setData({
      showSpecsPopup: true,
      currentAction: 'cart'
    })
  },
  
  // 打开规格选择弹窗 - 立即购买
  handleBuyNow() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    this.setData({
      showSpecsPopup: true,
      currentAction: 'buy'
    })
  },
  
  // 关闭规格选择弹窗
  closeSpecsPopup() {
    this.setData({
      showSpecsPopup: false
    })
  },
  
  // 选择规格选项
  selectOption(e) {
    const { groupIndex, optionIndex } = e.currentTarget.dataset
    const optionGroups = [...this.data.product.optionGroups]
    
    // 取消同组其他选项的选中状态
    optionGroups[groupIndex].options.forEach((option, idx) => {
      option.selected = idx === optionIndex
    })
    
    this.setData({
      'product.optionGroups': optionGroups
    })
    
    // 更新已选择的规格文本
    this.updateSelectedSpecs()
  },
  
  // 更新已选择的规格文本
  updateSelectedSpecs() {
    const { optionGroups } = this.data.product
    let selectedSpecs = ''
    
    optionGroups.forEach(group => {
      const selectedOption = group.options.find(option => option.selected)
      if (selectedOption) {
        selectedSpecs += `${group.name}:${selectedOption.value} `
      }
    })
    
    this.setData({
      selectedSpecs: selectedSpecs.trim() || '请选择规格'
    })
  },
  
  // 减少数量
  decreaseQuantity() {
    if (this.data.quantity <= 1) return
    
    this.setData({
      quantity: this.data.quantity - 1
    })
  },
  
  // 增加数量
  increaseQuantity() {
    this.setData({
      quantity: this.data.quantity + 1
    })
  },
  
  // 确认加入购物车
  async confirmAddToCart() {
    // 检查是否选择了所有规格
    if (!this.checkAllSpecsSelected()) {
      wx.showToast({
        title: '请选择完整规格',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '加入中...',
      mask: true
    })
    
    try {
      // 模拟API请求
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            error: 0,
            body: {
              cartCount: 3
            },
            message: ''
          })
        }, 500)
      })
      
      if (response.error === 0) {
        this.setData({
          cartCount: response.body.cartCount,
          showSpecsPopup: false
        })
        
        wx.showToast({
          title: '已加入购物车',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '加入购物车失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('[Add To Cart Error]', error)
      wx.showToast({
        title: '加入购物车失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },
  
  // 确认立即购买
  confirmBuyNow() {
    // 检查是否选择了所有规格
    if (!this.checkAllSpecsSelected()) {
      wx.showToast({
        title: '请选择完整规格',
        icon: 'none'
      })
      return
    }
    
    // 构建订单数据
    const orderInfo = {
      productId: this.data.product.id,
      productName: this.data.product.name,
      productImage: this.data.product.images[0],
      specs: this.data.selectedSpecs,
      price: this.data.product.price,
      quantity: this.data.quantity
    }
    
    // 将订单信息转为字符串，传递给订单确认页面
    const orderInfoStr = encodeURIComponent(JSON.stringify(orderInfo))
    
    this.setData({
      showSpecsPopup: false
    })
    
    wx.navigateTo({
      url: `/pages/orderConfirm/index?orderInfo=${orderInfoStr}`
    })
  },
  
  // 检查是否选择了所有规格
  checkAllSpecsSelected() {
    const { optionGroups } = this.data.product
    
    for (const group of optionGroups) {
      const hasSelected = group.options.some(option => option.selected)
      if (!hasSelected) {
        return false
      }
    }
    
    return true
  },
  
  // 跳转到相关商品详情
  navigateToProduct(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/productDetail/index?id=${id}`
    })
  },
  
  onShareAppMessage() {
    return {
      title: this.data.product.name,
      path: `/pages/productDetail/index?id=${this.data.product.id}`,
      imageUrl: this.data.product.images[0]
    }
  },
  
  onShareTimeline() {
    return {
      title: this.data.product.name,
      query: `id=${this.data.product.id}`,
      imageUrl: this.data.product.images[0]
    }
  }
}) 