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
    ],
    // 羽毛球数据
    shuttlecocks: [
      {
        id: 201,
        name: 'YONEX AS-50(12只装)',
        price: '128.00',
        soldCount: 156,
        imageUrl: '/assets/images/shuttlecock1.jpg'
      },
      {
        id: 202,
        name: 'RSL NO.4(12只装)',
        price: '156.00',
        soldCount: 78,
        imageUrl: '/assets/images/shuttlecock2.jpg'
      },
      {
        id: 203,
        name: 'VICTOR 胜利1号球',
        price: '168.00',
        soldCount: 92,
        imageUrl: '/assets/images/shuttlecock3.jpg'
      },
      {
        id: 204,
        name: '川崎进口羽毛球耐打型',
        price: '98.00',
        soldCount: 189,
        imageUrl: '/assets/images/shuttlecock4.jpg'
      }
    ],
    // 运动服装数据
    sportswear: [
      {
        id: 301,
        name: '男款运动T恤',
        price: '159.00',
        soldCount: 87,
        imageUrl: '/assets/images/sportswear1.jpg'
      },
      {
        id: 302,
        name: '女款运动短裤',
        price: '129.00',
        soldCount: 93,
        imageUrl: '/assets/images/sportswear2.jpg'
      },
      {
        id: 303,
        name: 'LINING李宁短袖男装',
        price: '189.00',
        soldCount: 67,
        imageUrl: '/assets/images/sportswear3.jpg'
      },
      {
        id: 304,
        name: 'YONEX尤尼克斯羽毛球服',
        price: '259.00',
        soldCount: 42,
        imageUrl: '/assets/images/sportswear4.jpg'
      }
    ],
    // 羽毛球配件数据
    accessories: [
      {
        id: 401,
        name: 'YONEX羽毛球拍手胶',
        price: '35.00',
        soldCount: 325,
        imageUrl: '/assets/images/accessory1.jpg'
      },
      {
        id: 402,
        name: '李宁羽毛球拍线',
        price: '68.00',
        soldCount: 156,
        imageUrl: '/assets/images/accessory2.jpg'
      },
      {
        id: 403,
        name: '胜利羽毛球包双肩',
        price: '239.00',
        soldCount: 78,
        imageUrl: '/assets/images/accessory3.jpg'
      },
      {
        id: 404,
        name: '专业羽毛球护腕',
        price: '29.00',
        soldCount: 246,
        imageUrl: '/assets/images/accessory4.jpg'
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