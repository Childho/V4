// 引入API接口
const userApi = require('../../api/userApi')
const { api } = require('../../api/utils/request')

// 获取积分信息
const getPoints = () => {
  return api.post('/points/info', {});
};

// 兑换商品
const exchangeProduct = (productId, count = 1) => {
  return api.post('/points/exchange', { productId, count });
};

Page({
  data: {
    pointsBalance: 280,
    products: [
      {
        id: 1,
        name: '优惠券50元',
        points: 500,
        image: '/assets/icons/coupon-icon.svg',
        stock: 999,
        desc: '可用于商城消费抵扣现金'
      },
      {
        id: 2,
        name: '羽毛球场地30分钟',
        points: 800,
        image: '/assets/icons/booking.png',
        stock: 10,
        desc: '可预约任意时段羽毛球场地30分钟'
      },
      {
        id: 3,
        name: '网球场地60分钟',
        points: 1200,
        image: '/assets/icons/booking.png',
        stock: 5,
        desc: '可预约任意时段网球场地60分钟'
      }
    ],
    loading: false
  },

  onLoad() {
    // 页面加载时获取积分信息
    this.getPointsInfo();
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.getPointsInfo();
    wx.stopPullDownRefresh();
  },

  // 获取积分信息
  async getPointsInfo() {
    try {
      this.setData({ loading: true });
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      const pointsInfo = await getPoints();
      if (pointsInfo && pointsInfo.balance) {
        this.setData({
          pointsBalance: pointsInfo.balance
        });
      }
    } catch (error) {
      console.error('[获取积分信息失败]', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 兑换商品
  async handleExchange(e) {
    const { id } = e.currentTarget.dataset;
    const product = this.data.products.find(item => item.id === id);
    
    if (!product) return;

    // 判断积分是否足够
    if (this.data.pointsBalance < product.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ loading: true });
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      // 弹窗确认兑换
      const res = await wx.showModal({
        title: '确认兑换',
        content: `确定使用${product.points}积分兑换"${product.name}"吗？`,
        confirmText: '确认兑换',
        cancelText: '再想想'
      });

      if (!res.confirm) return;

      // 调用兑换API
      const result = await exchangeProduct(product.id);
      
      if (result && result.success) {
        // 更新积分余额
        this.setData({
          pointsBalance: this.data.pointsBalance - product.points
        });
        
        wx.showToast({
          title: '兑换成功',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('[兑换失败]', error);
      wx.showToast({
        title: '兑换失败，请稍后重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 返回上一页
  handleBack() {
    wx.navigateBack();
  }
}); 