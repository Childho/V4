Page({
  data: {
    activeCategory: 'all',
    searchKeyword: '',
    cartItemCount: 2,
    products: [
      {
        id: 1,
        name: 'VICTOR胜利羽毛球拍',
        brand: 'VICTOR',
        price: 1500,
        category: 'racket',
        imageUrl: '/assets/images/product1.jpg',
        description: '专业级比赛羽毛球拍，适合高水平球手使用',
        stock: 50
      },
      {
        id: 2,
        name: 'YONEX尤尼克斯羽毛球拍',
        brand: 'YONEX',
        price: 1800,
        category: 'racket',
        imageUrl: '/assets/images/product2.jpg',
        description: '日本进口高端羽毛球拍，手感极佳',
        stock: 30
      },
      {
        id: 3,
        name: '专业羽毛球鞋',
        brand: 'LINING',
        price: 800,
        category: 'shoe',
        imageUrl: '/assets/images/product3.jpg',
        description: '高弹性防滑专业比赛羽毛球鞋',
        stock: 100
      },
      {
        id: 4,
        name: '羽毛球运动T恤',
        brand: 'VICTOR',
        price: 300,
        category: 'shoe',
        imageUrl: '/assets/images/product4.jpg',
        description: '速干透气专业羽毛球运动T恤',
        stock: 200
      },
      {
        id: 5,
        name: '羽毛球拍线',
        brand: 'YONEX',
        price: 120,
        category: 'accessory',
        imageUrl: '/assets/images/product5.jpg',
        description: '高强度耐用羽毛球拍线',
        stock: 300
      },
      {
        id: 6,
        name: '握把带',
        brand: 'LINING',
        price: 50,
        category: 'accessory',
        imageUrl: '/assets/images/product6.jpg',
        description: '吸汗防滑羽毛球拍握把带',
        stock: 500
      }
    ],
    filteredProducts: [] as any[]
  },

  onLoad() {
    // 初始化筛选后的商品列表
    this.filterProducts()
  },

  // 切换商品分类
  switchCategory(e: any) {
    const category = e.currentTarget.dataset.category
    this.setData({
      activeCategory: category
    })
    this.filterProducts()
  },

  // 搜索输入
  onSearchInput(e: any) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterProducts()
  },

  // 筛选商品
  filterProducts() {
    const { products, activeCategory, searchKeyword } = this.data
    
    let filtered = [...products]
    
    // 根据分类筛选
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory)
    }
    
    // 根据关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(keyword) || 
        item.brand.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    }
    
    this.setData({
      filteredProducts: filtered
    })
  },

  // 跳转到商品详情
  goToProductDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?id=${id}`
    })
  },

  // 添加到购物车
  addToCart(e: any) {
    const id = e.currentTarget.dataset.id
    
    // 阻止事件冒泡
    e.stopPropagation()
    
    // 这里应该调用接口添加商品到购物车
    // 模拟添加成功
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
    
    // 更新购物车商品数量
    this.setData({
      cartItemCount: this.data.cartItemCount + 1
    })
  },

  // 前往购物车页面
  goToCart() {
    wx.showToast({
      title: '购物车功能开发中',
      icon: 'none'
    })
  },

  onPullDownRefresh() {
    // 模拟刷新数据
    setTimeout(() => {
      this.filterProducts()
      wx.stopPullDownRefresh()
    }, 1000)
  },

  onShareAppMessage() {
    return {
      title: '倍特爱商城 - 专业羽毛球装备',
      path: '/pages/mall/mall'
    }
  }
}) 