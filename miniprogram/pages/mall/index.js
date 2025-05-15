// 商城页面逻辑
Page({
  data: {
    cartItemCount: 3, // 购物车中商品数量
    selectedBrand: 'all', // 当前选中的品牌
    rackets: [
      {
        id: 1,
        name: 'YONEX天斧88D',
        price: '1280.00',
        soldCount: 128,
        imageUrl: 'https://img.alicdn.com/imgextra/i1/4089084273/O1CN01J7iAdg1f4IrQAXHDX_!!4089084273.jpg_400x400.jpg'
      },
      {
        id: 2,
        name: 'LI-NING 风刃900',
        price: '899.00',
        soldCount: 89,
        imageUrl: 'https://img.alicdn.com/imgextra/i2/2624386887/O1CN01BfRtoe1RYaM8V4lVx_!!2624386887.jpg_400x400.jpg'
      },
      {
        id: 3,
        name: 'VICTOR 胜利 TK-F',
        price: '1080.00',
        soldCount: 75,
        imageUrl: 'https://img.alicdn.com/imgextra/i3/2207319254072/O1CN01TRoeDV1qfRDfJsQfR_!!2207319254072.jpg_400x400.jpg'
      },
      {
        id: 4,
        name: '川崎KAWASAKI碳素羽毛球拍',
        price: '268.00',
        soldCount: 320,
        imageUrl: 'https://img.alicdn.com/imgextra/i2/2212259470714/O1CN01ttT6Ki23Oetbz7zjm_!!2212259470714.jpg_400x400.jpg'
      }
    ],
    shoes: [
      {
        id: 101,
        name: 'YONEX尤尼克斯羽毛球鞋男女款',
        price: '659.00',
        soldCount: 103,
        imageUrl: 'https://img.alicdn.com/imgextra/i2/1709278453/O1CN01kDxgHo1OkK1Pga18V_!!1709278453.jpg_400x400.jpg'
      },
      {
        id: 102,
        name: 'LI-NING李宁羽毛球鞋男鞋',
        price: '269.00',
        soldCount: 215,
        imageUrl: 'https://img.alicdn.com/imgextra/i1/2385330752/O1CN01GDjHO41FLYNTxw6Jz_!!2385330752.jpg_400x400.jpg'
      },
      {
        id: 103,
        name: 'VICTOR胜利羽毛球鞋男女款防滑耐磨',
        price: '458.00',
        soldCount: 68,
        imageUrl: 'https://img.alicdn.com/imgextra/i3/2201499189850/O1CN014UXxaF1PbkptHDnj8_!!2201499189850.jpg_400x400.jpg'
      }
    ]
  },

  onLoad: function() {
    // 页面加载时的逻辑
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  // 显示筛选
  showFilter: function() {
    wx.showToast({
      title: '筛选功能开发中',
      icon: 'none'
    });
  },

  // 前往购物车
  goToCart: function() {
    wx.showToast({
      title: '购物车功能开发中',
      icon: 'none'
    });
  },

  // 选择品牌
  selectBrand: function(e) {
    const brand = e.currentTarget.dataset.brand;
    this.setData({
      selectedBrand: brand
    });
  },

  // 导航到分类页面
  navigateToCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    wx.showToast({
      title: '即将导航到' + category + '分类',
      icon: 'none'
    });
  },

  // 查看全部产品
  viewAllProducts: function(e) {
    const category = e.currentTarget.dataset.category;
    wx.showToast({
      title: '查看所有' + category + '产品',
      icon: 'none'
    });
  },

  // 前往产品详情页
  goToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/productDetail/index?id=' + productId
    });
  },

  // 页面相关事件处理函数
  onShareAppMessage: function() {
    return {
      title: '羽毛球商城',
      path: '/pages/mall/index'
    }
  }
}) 