Page({
  data: {
    coaches: [
      {
        id: 'coach_1',
        name: 'LEWIS ALEX',
        level: '国家一级',
        avatar: '/assets/images/coach1.png'
      },
      {
        id: 'coach_2',
        name: 'VICTOR ELLIS-D',
        level: '国家二级',
        avatar: '/assets/images/coach2.png'
      },
      {
        id: 'coach_3',
        name: '张教练',
        level: '资深教练',
        avatar: '/assets/images/coach3.png'
      },
      {
        id: 'coach_4',
        name: '李教练',
        level: '初级教练',
        avatar: '/assets/images/coach4.png'
      }
    ],
    courts: [
      {
        id: 'court_1',
        name: '北京市朝阳区网球馆',
        address: '北京市朝阳区建国路88号',
        openTime: '09:00',
        closeTime: '22:00',
        image: '/assets/images/court1.png'
      },
      {
        id: 'court_2',
        name: '海淀区网球中心',
        address: '北京市海淀区中关村南大街5号',
        openTime: '08:00',
        closeTime: '21:00',
        image: '/assets/images/court2.png'
      }
    ],
    currentBooking: {
      id: 'booking_1',
      title: 'LEWIS ALEX 教练课',
      place: '朝阳区网球馆',
      date: '2023-08-15',
      time: '18:00-19:00',
      status: 'confirmed'
    }
  },
  
  onLoad() {
    // 检查登录状态，获取当前预约信息
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({
        currentBooking: null
      })
    }
  },
  
  // 选择教练
  selectCoach(e) {
    const { id } = e.currentTarget.dataset
    const coach = this.data.coaches.find(item => item.id === id)
    
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/courseDetail/index?id=${id}&name=${coach.name}`
    })
  },
  
  // 预约场地
  bookCourt(e) {
    const { id } = e.currentTarget.dataset
    
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/courtDetail/index?id=${id}`
    })
  },
  
  // 跳转到我的预约页面
  navigateToMyBooking() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/myBooking/index'
    })
  }
}) 