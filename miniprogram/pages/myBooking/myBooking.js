Page({
  data: {
    activeTab: 'upcoming',
    bookings: [
      {
        id: 1,
        venueName: '健森羽毛球馆',
        date: '2023-09-30',
        timeSlot: '13:00-15:00',
        courtType: '普通场地',
        price: 100,
        status: 'upcoming',
        statusText: '即将到来'
      },
      {
        id: 2,
        venueName: '星河羽毛球馆',
        date: '2023-09-25',
        timeSlot: '19:00-21:00',
        courtType: '精品场地',
        price: 160,
        status: 'upcoming',
        statusText: '即将到来'
      },
      {
        id: 3,
        venueName: '体育中心羽毛球馆',
        date: '2023-09-15',
        timeSlot: '10:00-12:00',
        courtType: '比赛场地',
        price: 240,
        status: 'completed',
        statusText: '已完成'
      },
      {
        id: 4,
        venueName: '健森羽毛球馆',
        date: '2023-09-10',
        timeSlot: '16:00-18:00',
        courtType: '普通场地',
        price: 100,
        status: 'completed',
        statusText: '已完成'
      },
      {
        id: 5,
        venueName: '星河羽毛球馆',
        date: '2023-09-05',
        timeSlot: '20:00-22:00',
        courtType: '精品场地',
        price: 160,
        status: 'cancelled',
        statusText: '已取消'
      }
    ],
    filteredBookings: []
  },

  onLoad() {
    this.filterBookings()
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    this.filterBookings()
  },

  // 筛选预约记录
  filterBookings() {
    const { bookings, activeTab } = this.data
    const filtered = bookings.filter(item => item.status === activeTab)
    
    this.setData({
      filteredBookings: filtered
    })
  },

  // 取消预约
  cancelBooking(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '取消预约',
      content: '确定要取消该预约吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际开发中应该调用API取消预约
          
          // 模拟取消预约
          const bookings = this.data.bookings.map(item => {
            if (item.id === id) {
              return {
                ...item,
                status: 'cancelled',
                statusText: '已取消'
              }
            }
            return item
          })
          
          this.setData({
            bookings
          })
          
          this.filterBookings()
          
          wx.showToast({
            title: '已取消预约',
            icon: 'success'
          })
        }
      }
    })
  },

  // 查看预约详情
  viewBookingDetail(e) {
    const id = e.currentTarget.dataset.id
    
    // 找到对应的预约记录
    const booking = this.data.bookings.find(item => item.id === id)
    
    if (booking) {
      // 实际开发中应该跳转到预约详情页面
      // 这里简单弹窗显示详情
      wx.showModal({
        title: '预约详情',
        content: `场馆：${booking.venueName}\n日期：${booking.date}\n时间：${booking.timeSlot}\n场地类型：${booking.courtType}\n消费积分：${booking.price}`,
        showCancel: false
      })
    }
  },

  // 评价
  writeReview(e) {
    const id = e.currentTarget.dataset.id
    
    // 实际开发中应该跳转到评价页面
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    })
  },

  // 再次预订
  rebookCourt(e) {
    const id = e.currentTarget.dataset.id
    
    // 找到对应的预约记录
    const booking = this.data.bookings.find(item => item.id === id)
    
    if (booking) {
      // 实际开发中应该携带预约信息跳转到预约页面
      wx.navigateTo({
        url: '/pages/booking/booking'
      })
    }
  },

  // 跳转到预约页面
  goToBooking() {
    wx.switchTab({
      url: '/pages/booking/booking'
    })
  },

  onPullDownRefresh() {
    // 模拟刷新数据
    setTimeout(() => {
      this.filterBookings()
      wx.stopPullDownRefresh()
    }, 1000)
  }
}); 