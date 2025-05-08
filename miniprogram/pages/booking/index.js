// 羽毛球场馆预约和穿线服务页面
Page({
  data: {
    // 当前激活的标签页，0-球馆预约，1-穿线服务，2-我的服务
    currentTab: 0,
    
    // 日期数据
    dates: [
      { day: 10, weekday: '周三' },
      { day: 11, weekday: '周四' },
      { day: 12, weekday: '周五' },
      { day: 13, weekday: '周六' },
      { day: 14, weekday: '周日' }
    ],
    
    // 羽毛球场馆数据
    venues: [
      {
        id: 'venue_1',
        name: '海羽赛事羽毛球馆',
        address: '南山大道1105号海润工业区西区3楼',
        rating: 4.8,
        reviewCount: 120,
        distance: 1.2,
        discount: '会员9折',
        image: '/assets/images/badminton1.png',
        availableTimeSlots: [
          '09:00-10:00', '10:00-11:00', '11:00-12:00',
          '14:00-15:00', '15:00-16:00', '16:00-17:00'
        ]
      },
      {
        id: 'venue_2',
        name: '星悦羽毛球馆',
        address: '南山大道1105号海润工业区西区3楼',
        rating: 5.0,
        reviewCount: 86,
        distance: 3.5,
        discount: '会员8.5折',
        image: '/assets/images/badminton2.png',
        availableTimeSlots: [
          '09:00-10:00', '10:00-11:00', '11:00-12:00',
          '14:00-15:00', '15:00-16:00', '16:00-17:00'
        ]
      }
    ],
    
    // 场馆预约 - 当前选择状态
    activeDate: 0, // 默认选择第一个日期
    activeVenue: null,
    activeTimeSlot: null,
    
    // 穿线服务 - 球拍信息
    racketInfo: {
      brand: '',
      mainPounds: 24,
      crossPounds: 23
    },
    
    // 穿线服务 - 线材筛选和选择
    stringFilter: 'all',
    selectedString: 'YONEX BG-65',
    totalPrice: 55, // 默认选择第一个线材
    
    // 我的服务 - 筛选
    myServiceFilter: 'all',
    
    // 当前用户位置
    userLocation: null
  },

  onLoad() {
    // 初始化页面数据
    this.initPageData();
    // 获取用户位置
    this.getUserLocation();
  },

  // 初始化页面数据
  initPageData() {
    // 设置默认场馆和时间段
    this.setData({
      activeVenue: this.data.venues[0].id,
      activeTimeSlot: this.data.venues[0].availableTimeSlots[0]
    });
  },
  
  // 获取用户位置
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02', 
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        
        this.setData({
          userLocation: {
            latitude,
            longitude
          }
        });
        
        // 根据用户位置获取附近的场馆
        this.getNearbyVenues(latitude, longitude);
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败，请检查位置权限',
          icon: 'none'
        });
      }
    });
  },
  
  // 获取附近场馆（这里模拟，实际应该从API获取）
  getNearbyVenues(latitude, longitude) {
    // 实际项目中应该调用后端API获取附近场馆
    // this.requestNearbyVenues(latitude, longitude);
    
    // 这里使用模拟数据
    console.log('用户位置:', latitude, longitude);
    // 保持现有数据不变
  },
  
  // 实际项目中可以调用后端API获取附近场馆
  requestNearbyVenues(latitude, longitude) {
    const token = wx.getStorageSync('token');
    
    // 判断是否登录
    if (!token) {
      console.log('用户未登录，使用默认数据');
      return;
    }
    
    // 请求附近的场馆
    wx.request({
      url: 'https://api.example.com/venues/nearby',
      method: 'POST',
      header: {
        'auth': token
      },
      data: {
        latitude,
        longitude,
        maxDistance: 5000 // 5公里范围内
      },
      success: (res) => {
        if (res.data.error === 0) {
          // 成功获取数据
          this.setData({
            venues: res.data.body.venues
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取场馆失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },
  
  // ========== 顶部标签切换 ==========
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    if (index === this.data.currentTab) {
      return;
    }
    
    this.setData({
      currentTab: index
    });
    
    // 如果切换到我的服务，需要检查登录状态
    if (index === 2) {
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.showModal({
          title: '提示',
          content: '请先登录查看您的服务',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/index'
              });
            } else {
              // 取消，返回到球馆预约页面
              this.setData({
                currentTab: 0
              });
            }
          }
        });
      }
    }
  },
  
  // ========== 场馆预约相关函数 ==========
  
  // 选择日期
  selectDate(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeDate: index
    });
  },
  
  // 选择场馆
  selectVenue(e) {
    const venueId = e.currentTarget.dataset.id;
    this.setData({
      activeVenue: venueId
    });
  },
  
  // 选择时间段
  selectTimeSlot(e) {
    const timeSlot = e.currentTarget.dataset.time;
    this.setData({
      activeTimeSlot: timeSlot
    });
  },
  
  // 进行预约
  bookNow(e) {
    const venueId = e.currentTarget.dataset.id;
    const venue = this.data.venues.find(item => item.id === venueId);
    
    // 检查是否登录
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录再进行预约',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            });
          }
        }
      });
      return;
    }
    
    // 获取当前选择的日期
    const selectedDate = this.data.dates[this.data.activeDate];
    
    // 弹窗确认预约信息
    wx.showModal({
      title: '确认预约',
      content: `您将预约${venue.name}\n日期: 2023年6月${selectedDate.day}日 ${selectedDate.weekday}\n时间: ${this.data.activeTimeSlot}\n确认预约吗？`,
      confirmText: '确认预约',
      success: (res) => {
        if (res.confirm) {
          // 调用预约API
          this.submitBooking(venueId, selectedDate, this.data.activeTimeSlot);
        }
      }
    });
  },
  
  // 提交预约请求
  submitBooking(venueId, date, timeSlot) {
    const token = wx.getStorageSync('token');
    
    // 显示加载中
    wx.showLoading({
      title: '预约中...',
    });
    
    // 构建预约数据
    const bookingData = {
      venueId: venueId,
      date: `2023-06-${date.day}`,
      timeSlot: timeSlot
    };
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟成功响应
      wx.showToast({
        title: '预约成功',
        icon: 'success'
      });
      
      // 跳转到我的服务页面
      setTimeout(() => {
        this.setData({
          currentTab: 2
        });
      }, 1500);
      
    }, 1500);
  },
  
  // ========== 穿线服务相关函数 ==========
  
  // 输入球拍品牌型号
  inputRacketBrand(e) {
    this.setData({
      'racketInfo.brand': e.detail.value
    });
  },
  
  // 增加磅数
  increasePounds(e) {
    const type = e.currentTarget.dataset.type;
    const field = type === 'main' ? 'racketInfo.mainPounds' : 'racketInfo.crossPounds';
    const currentValue = type === 'main' ? this.data.racketInfo.mainPounds : this.data.racketInfo.crossPounds;
    
    if (currentValue < 35) { // 设置磅数上限
      this.setData({
        [field]: currentValue + 1
      });
    }
  },
  
  // 减少磅数
  decreasePounds(e) {
    const type = e.currentTarget.dataset.type;
    const field = type === 'main' ? 'racketInfo.mainPounds' : 'racketInfo.crossPounds';
    const currentValue = type === 'main' ? this.data.racketInfo.mainPounds : this.data.racketInfo.crossPounds;
    
    if (currentValue > 18) { // 设置磅数下限
      this.setData({
        [field]: currentValue - 1
      });
    }
  },
  
  // 筛选线材
  filterString(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      stringFilter: filter
    });
    
    // 这里可以根据筛选条件请求不同的线材列表
    // this.getStringsByFilter(filter);
  },
  
  // 选择线材
  selectString(e) {
    const string = e.currentTarget.dataset.string;
    const price = e.currentTarget.dataset.price;
    
    this.setData({
      selectedString: string,
      totalPrice: price
    });
  },
  
  // 下单穿线服务
  placeStringOrder() {
    // 检查是否填写了球拍品牌
    if (!this.data.racketInfo.brand) {
      wx.showToast({
        title: '请填写球拍品牌型号',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否登录
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录再下单',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            });
          }
        }
      });
      return;
    }
    
    // 显示确认信息
    wx.showModal({
      title: '确认下单',
      content: `球拍型号: ${this.data.racketInfo.brand}\n线材: ${this.data.selectedString}\n磅数: 主线${this.data.racketInfo.mainPounds}磅, 横线${this.data.racketInfo.crossPounds}磅\n价格: ¥${this.data.totalPrice}`,
      confirmText: '确认下单',
      success: (res) => {
        if (res.confirm) {
          // 提交订单
          this.submitStringOrder();
        }
      }
    });
  },
  
  // 提交穿线订单
  submitStringOrder() {
    // 显示加载中
    wx.showLoading({
      title: '提交中...',
    });
    
    // 构建订单数据
    const orderData = {
      racketBrand: this.data.racketInfo.brand,
      stringType: this.data.selectedString,
      mainPounds: this.data.racketInfo.mainPounds,
      crossPounds: this.data.racketInfo.crossPounds,
      price: this.data.totalPrice
    };
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟成功响应
      wx.showToast({
        title: '下单成功',
        icon: 'success'
      });
      
      // 跳转到我的服务页面
      setTimeout(() => {
        this.setData({
          currentTab: 2
        });
      }, 1500);
      
    }, 1500);
  },
  
  // ========== 我的服务相关函数 ==========
  
  // 筛选我的服务
  filterMyService(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      myServiceFilter: filter
    });
    
    // 这里可以根据筛选条件请求不同的服务列表
    // this.getMyServicesByFilter(filter);
  }
}); 