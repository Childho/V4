Page({
  data: {
    searchKeyword: '',
    venues: [
      {
        id: 1,
        name: '健森羽毛球馆',
        address: '深圳市宝安区新安街道创业二路206号',
        imageUrl: '/assets/images/venue1.jpg',
        description: '专业羽毛球场馆，配有18片专业比赛场地，空调恒温'
      },
      {
        id: 2,
        name: '星河羽毛球馆',
        address: '深圳市南山区科技园南区深南大道',
        imageUrl: '/assets/images/venue2.jpg',
        description: '高端羽毛球场馆，地板采用专业运动木地板，光线充足'
      },
      {
        id: 3,
        name: '体育中心羽毛球馆',
        address: '深圳市福田区福田体育公园内',
        imageUrl: '/assets/images/venue3.jpg',
        description: '市中心最大的综合性羽毛球场馆，交通便利'
      }
    ],
    dates: [] as Array<{date: string, day: string, weekday: string}>,
    timeSlots: [
      { id: 1, time: '09:00-10:00', available: true },
      { id: 2, time: '10:00-11:00', available: true },
      { id: 3, time: '11:00-12:00', available: true },
      { id: 4, time: '12:00-13:00', available: false },
      { id: 5, time: '13:00-14:00', available: false },
      { id: 6, time: '14:00-15:00', available: true },
      { id: 7, time: '15:00-16:00', available: true },
      { id: 8, time: '16:00-17:00', available: true },
      { id: 9, time: '17:00-18:00', available: true },
      { id: 10, time: '18:00-19:00', available: true },
      { id: 11, time: '19:00-20:00', available: true },
      { id: 12, time: '20:00-21:00', available: true },
      { id: 13, time: '21:00-22:00', available: true },
      { id: 14, time: '22:00-23:00', available: false }
    ],
    courtTypes: [
      { id: 1, name: '普通场地', price: 50 },
      { id: 2, name: '精品场地', price: 80 },
      { id: 3, name: '比赛场地', price: 120 }
    ],
    selectedVenue: 1,
    selectedDate: '',
    selectedTimeSlots: [] as number[],
    selectedCourtType: 1,
    totalPrice: 0
  },

  onLoad() {
    this.generateDates()
    this.calculateTotalPrice()
  },

  // 生成未来7天的日期
  generateDates() {
    const dates = []
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const dateStr = this.formatDate(date)
      const day = date.getDate().toString()
      const weekday = weekdays[date.getDay()]
      
      dates.push({
        date: dateStr,
        day: day,
        weekday: weekday
      })
    }
    
    this.setData({
      dates,
      selectedDate: dates[0].date // 默认选择第一天
    })
  },

  // 格式化日期为YYYY-MM-DD
  formatDate(date: Date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 搜索输入
  onSearchInput(e: any) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 显示筛选选项
  showFilterOptions() {
    wx.showActionSheet({
      itemList: ['按价格排序', '按距离排序', '只看可预约', '重置筛选'],
      success: (res) => {
        if (res.tapIndex !== undefined) {
          // 处理筛选逻辑
          wx.showToast({
            title: '筛选功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  // 选择场馆
  selectVenue(e: any) {
    const venueId = e.currentTarget.dataset.id
    this.setData({
      selectedVenue: venueId
    })
  },

  // 选择日期
  selectDate(e: any) {
    const date = e.currentTarget.dataset.date
    this.setData({
      selectedDate: date
    })
    
    // 重新加载该日期的时间槽可用情况
    this.loadTimeSlots(date)
  },

  // 加载指定日期的时间槽
  loadTimeSlots(date: string) {
    // 实际开发中应该调用API获取该日期的时间槽可用情况
    // 这里简单模拟一下
    const timeSlots = this.data.timeSlots.map(slot => {
      // 随机设置一些时间槽为不可用
      const available = Math.random() > 0.3
      return { ...slot, available }
    })
    
    this.setData({
      timeSlots,
      selectedTimeSlots: [] // 重置已选时间槽
    })
    
    this.calculateTotalPrice()
  },

  // 选择时间槽
  selectTimeSlot(e: any) {
    const timeSlotId = e.currentTarget.dataset.id
    const available = e.currentTarget.dataset.available
    
    if (!available) return // 不可用的时间槽不能选择
    
    let selectedTimeSlots = [...this.data.selectedTimeSlots]
    
    if (selectedTimeSlots.includes(timeSlotId)) {
      // 如果已经选择了该时间槽，则取消选择
      selectedTimeSlots = selectedTimeSlots.filter(id => id !== timeSlotId)
    } else {
      // 否则添加该时间槽
      selectedTimeSlots.push(timeSlotId)
    }
    
    this.setData({
      selectedTimeSlots
    })
    
    this.calculateTotalPrice()
  },

  // 选择场地类型
  selectCourtType(e: any) {
    const courtTypeId = e.currentTarget.dataset.id
    this.setData({
      selectedCourtType: courtTypeId
    })
    
    this.calculateTotalPrice()
  },

  // 计算总价
  calculateTotalPrice() {
    const { selectedTimeSlots, selectedCourtType, courtTypes } = this.data
    
    // 找到选择的场地类型
    const courtType = courtTypes.find(item => item.id === selectedCourtType)
    
    if (courtType) {
      // 计算总价 = 场地单价 * 选择的时间槽数量
      const totalPrice = courtType.price * selectedTimeSlots.length
      
      this.setData({
        totalPrice
      })
    }
  },

  // 提交预约
  submitBooking() {
    const { selectedVenue, selectedDate, selectedTimeSlots, selectedCourtType, totalPrice } = this.data
    
    if (selectedTimeSlots.length === 0) {
      wx.showToast({
        title: '请选择至少一个时间段',
        icon: 'none'
      })
      return
    }
    
    // 构建预约信息
    const bookingInfo = {
      venueId: selectedVenue,
      date: selectedDate,
      timeSlots: selectedTimeSlots,
      courtTypeId: selectedCourtType,
      totalPrice
    }
    
    // 实际开发中应该调用API提交预约信息
    console.log('提交预约信息:', bookingInfo)
    
    // 模拟预约成功
    wx.showLoading({
      title: '提交中'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      wx.showModal({
        title: '预约成功',
        content: '您的场地已预约成功，可在"我的预约"中查看详情',
        showCancel: false,
        success: () => {
          // 跳转到我的预约页面
          wx.navigateTo({
            url: '/pages/myBooking/myBooking'
          })
        }
      })
    }, 1500)
  }
}) 