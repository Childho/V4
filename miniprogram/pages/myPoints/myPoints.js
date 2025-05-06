import { getTotalPoints, getPointsRecords } from '../../api/pointsApi';

Page({
  data: {
    totalPoints: 0,
    selectedMonth: '',
    showRules: false,
    pointsRecords: []
  },

  onLoad() {
    // 设置当前月份
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ selectedMonth: month });
    
    // 加载数据
    this.loadData();
  },

  async loadData() {
    try {
      wx.showLoading({ title: '加载中' });
      
      // 获取总积分
      const totalPoints = await getTotalPoints();
      
      // 获取积分记录
      const records = await getPointsRecords({ 
        month: this.data.selectedMonth 
      });
      
      this.setData({
        totalPoints,
        pointsRecords: records
      });
    } catch (error) {
      console.error('加载积分数据失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 月份选择改变
  async onMonthChange(e) {
    const month = e.detail.value;
    this.setData({ selectedMonth: month });
    await this.loadData();
  },

  // 显示积分规则
  showPointsRules() {
    this.setData({ showRules: true });
  },

  // 隐藏积分规则
  hidePointsRules() {
    this.setData({ showRules: false });
  },

  // 跳转到预约页面
  goToBooking() {
    wx.switchTab({
      url: '/pages/booking/booking'
    });
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
}); 