// 引入服务页面API接口 - 注意：使用编译后的JS文件
const { 
  getStringsList, 
  createStringOrder, 
  getPointsExchangeInfo, 
  exchangeGoods: exchangeGoodsApi, 
  getPromotionInfo, 
  applyWithdraw, 
  getServiceRecords 
} = require('../../api/bookingApi');

Page({
  /**
   * 页面的初始数据
   * 包含所有tab页面需要的数据和状态管理
   */
  data: {
    // 当前激活的主tab页面 (0: 穿线服务, 1: 积分兑换, 2: 推广返佣, 3: 我的服务)
    currentTab: 0,
    
    // 当前激活的子tab页面 (用于"我的服务"页面)
    currentSubTab: 'all',
    
    // 加载状态控制
    loading: false,
    
    // 下单成功弹窗显示状态
    showOrderModal: false,
    
    // 订单详情数据（用于下单成功弹窗）
    orderDetails: {},

    // === Tab1: 穿线服务数据 ===
    stringService: {
      racket_brand: '',       // 球拍品牌与型号
      pounds: 24,             // 统一磅数
      string_id: '',          // 选中的线材ID
      remark: '',             // 备注信息
      total_price: 0          // 总价格
    },
    
    // 线材品牌列表 - 从API获取
    stringBrands: [],
    
    // 当前选中的品牌
    selectedBrand: 'all',
    
    // 线材列表 - 从API获取
    stringList: [],
    
    // 根据品牌筛选后的线材列表
    filteredStrings: [],
    
    // 是否可以提交订单 (必填项检查)
    canSubmitOrder: false,

    // === Tab2: 积分兑换数据 ===
    pointsData: {
      user_points: 0,         // 用户当前积分
      goods: [],              // 可兑换商品列表
      recent_exchanges: []     // 最近兑换记录
    },

    // === Tab3: 推广返佣数据 ===
    promotionData: {
      total_earnings: 0,       // 累计收益
      invited_users: 0,        // 累计邀请人数
      this_month_earnings: 0,  // 本月收益
      today_earnings: 0,       // 今日收益
      account_balance: 0,      // 账户余额
      invite_code: '',         // 邀请码
      invite_link: '',         // 邀请链接
      qr_code_url: '',         // 推广二维码URL
      commission_records: [],  // 佣金明细记录
      withdraw_records: []     // 提现记录
    },

    // 提现相关数据
    withdrawData: {
      show_withdraw_modal: false,    // 显示提现弹窗
      withdraw_amount: '',           // 提现金额
      min_withdraw_amount: 10,       // 最小提现金额
      withdraw_fee_rate: 0,          // 提现手续费率（0表示免费）
    },

    // === Tab4: 我的服务数据 ===
    // 子tab配置
    subTabs: [
      { id: 'all', name: '全部' },
      { id: '穿线进度', name: '穿线进度' },
      { id: '奖品物流', name: '奖品物流' },
      { id: '返佣记录', name: '返佣记录' }
    ],
    
    // 服务记录列表 - 从API获取
    serviceList: [],
    
    // 根据子tab筛选后的服务记录
    filteredServiceList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('服务页面加载完成');
    this.initData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('[DEBUG] 服务页面显示 - onShow被调用');
    
    // 检查是否需要切换到特定tab（从首页跳转过来）
    const app = getApp()
    console.log('[DEBUG] 检查全局数据:', app.globalData);
    
    if (app.globalData && app.globalData.targetTab !== undefined) {
      const targetTab = app.globalData.targetTab
      console.log('[DEBUG] 从其他页面跳转，切换到tab:', targetTab)
      console.log('[DEBUG] 当前tab:', this.data.currentTab, '目标tab:', targetTab);
      
      // 延迟设置，确保页面完全渲染完成
      setTimeout(() => {
        console.log('[DEBUG] 开始设置currentTab为:', targetTab);
        this.setData({
          currentTab: targetTab
        })
        console.log('[DEBUG] currentTab设置完成，当前值:', this.data.currentTab);
        
        // 如果是跳转到积分兑换tab，显示提示
        if (targetTab === 1) {
          console.log('[DEBUG] 已切换到积分兑换tab');
          // 额外显示一个提示确认tab切换成功
          wx.showToast({
            title: 'Tab切换成功',
            icon: 'success',
            duration: 1000
          });
        }
      }, 100);
      
      // 检查是否有子tab跳转
      if (app.globalData.targetSubTab !== undefined) {
        const targetSubTab = app.globalData.targetSubTab
        console.log('[DEBUG] 同时切换到子tab:', targetSubTab)
        
        setTimeout(() => {
          this.setData({
            currentSubTab: targetSubTab
          })
          
          // 重新筛选服务记录
          this.filterServiceList()
        }, 100);
        
        // 清除子tab数据
        app.globalData.targetSubTab = undefined
      }
      
      // 清除全局数据，避免重复触发
      console.log('[DEBUG] 清除全局变量targetTab');
      app.globalData.targetTab = undefined
    } else {
      console.log('[DEBUG] 没有发现targetTab全局变量，正常显示页面');
    }
    
    // 刷新数据
    this.loadData();
  },

  /**
   * 页面下拉刷新事件处理函数
   */
  onPullDownRefresh: function () {
    console.log('触发下拉刷新');
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    });
  },

  /**
   * 初始化页面数据
   */
  initData: function() {
    // 初始化线材数据
    this.loadStringsData();
    
    // 检查订单提交条件
    this.checkCanSubmitOrder();
  },

  /**
   * 加载页面数据 - 使用真实API接口
   */
  loadData: function() {
    return new Promise(async (resolve) => {
      this.setData({ loading: true });
      
      try {
        // 根据当前tab加载对应数据
        switch (this.data.currentTab) {
          case 0: // 穿线服务
            await this.loadStringsData();
            break;
          case 1: // 积分兑换
            await this.loadPointsData();
            break;
          case 2: // 推广返佣
            await this.loadPromotionData();
            break;
          case 3: // 我的服务
            await this.loadServiceRecords();
            break;
        }
        
        console.log('数据加载完成');
      } catch (error) {
        console.error('数据加载失败:', error);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      } finally {
        this.setData({ loading: false });
        resolve();
      }
    });
  },

  // =============== Tab切换相关方法 ===============

  /**
   * 主tab切换处理
   * @param {Object} e 事件对象
   */
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    console.log('切换到tab:', index);
    
    this.setData({
      currentTab: index
    });
    
    // 切换tab时加载对应数据
    this.loadData();
  },

  /**
   * 子tab切换处理 (我的服务页面内的切换)
   * @param {Object} e 事件对象
   */
  switchSubTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    console.log('切换到子tab:', tab);
    
    this.setData({
      currentSubTab: tab
    });
    
    // 重新筛选服务记录
    this.filterServiceList();
  },

  // =============== Tab1: 穿线服务相关方法 ===============

  /**
   * 加载线材数据 - 使用真实API接口
   */
  async loadStringsData() {
    try {
      const stringsData = await getStringsList({
        brand: this.data.selectedBrand
      });
      
      console.log('线材数据加载成功:', stringsData);
      
      // 确保数据结构安全，使用默认值避免页面报错
      const safeStringsData = {
        brands: stringsData.brands || [],
        strings: stringsData.strings || []
      };
      
      this.setData({
        stringBrands: safeStringsData.brands,
        stringList: safeStringsData.strings,
        filteredStrings: safeStringsData.strings
      });
      
      // 如果已选择线材，更新价格
      if (this.data.stringService.string_id) {
        this.updateStringPrice();
      }
      
    } catch (error) {
      console.error('加载线材数据失败:', error);
      
      if (error.error === 401) {
        // 未登录错误处理
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: '获取线材数据失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 球拍信息输入处理
   * @param {Object} e 输入事件对象
   */
  onRacketInput: function(e) {
    const value = e.detail.value;
    this.setData({
      'stringService.racket_brand': value
    });
    this.checkCanSubmitOrder();
  },

  /**
   * 磅数调整处理
   * @param {Object} e 点击事件对象
   */
  changePounds: function(e) {
    const { action } = e.currentTarget.dataset;
    const { stringService } = this.data;
    
    let newValue;
    if (action === 'plus') {
      newValue = stringService.pounds + 1;
    } else {
      newValue = stringService.pounds - 1;
    }
    
    // 限制磅数范围 18-30
    newValue = Math.max(18, Math.min(30, newValue));
    
    this.setData({
      'stringService.pounds': newValue
    });
    
    console.log('磅数调整:', action, newValue);
  },

  /**
   * 线材品牌选择
   * @param {Object} e 点击事件对象
   */
  selectBrand: function(e) {
    const brand = e.currentTarget.dataset.brand;
    console.log('选择品牌:', brand);
    
    this.setData({
      selectedBrand: brand
    });
    
    this.filterStrings();
  },

  /**
   * 根据品牌筛选线材
   */
  filterStrings: function() {
    const { selectedBrand, stringList } = this.data;
    
    let filteredStrings;
    if (selectedBrand === 'all') {
      filteredStrings = stringList;
    } else {
      filteredStrings = stringList.filter(item => item.brand === selectedBrand);
    }
    
    this.setData({
      filteredStrings: filteredStrings
    });
    
    console.log('筛选后的线材:', filteredStrings);
  },

  /**
   * 线材选择处理
   * @param {Object} e 点击事件对象
   */
  selectString: function(e) {
    const stringId = e.currentTarget.dataset.string;
    
    this.setData({
      'stringService.string_id': stringId
    });
    
    this.updateStringPrice();
    this.checkCanSubmitOrder();
  },

  /**
   * 更新线材价格
   */
  updateStringPrice: function() {
    const selectedString = this.data.stringList.find(item => item.id === this.data.stringService.string_id);
    
    this.setData({
      'stringService.total_price': selectedString ? selectedString.price : 0
    });
    
    console.log('选择线材:', selectedString);
  },

  /**
   * 备注信息输入处理
   * @param {Object} e 输入事件对象
   */
  onRemarkInput: function(e) {
    const value = e.detail.value;
    this.setData({
      'stringService.remark': value
    });
  },

  /**
   * 检查是否可以提交订单
   */
  checkCanSubmitOrder: function() {
    const { stringService } = this.data;
    const canSubmit = stringService.racket_brand.trim() !== '' && stringService.string_id !== '';
    
    this.setData({
      canSubmitOrder: canSubmit
    });
    
    console.log('订单提交检查:', canSubmit);
  },

  /**
   * 提交穿线订单 - 使用真实API接口
   */
  async submitOrder() {
    if (!this.data.canSubmitOrder) {
      wx.showToast({
        title: '请完善订单信息',
        icon: 'none'
      });
      return;
    }
    
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/index'
        });
      }, 1500);
      return;
    }
    
    console.log('提交穿线订单:', this.data.stringService);
    
    // 显示加载状态
    this.setData({ loading: true });
    
    try {
      // 调用创建订单API - 严格按照接口文档规范
      const orderResult = await createStringOrder({
        racket_brand: this.data.stringService.racket_brand,
        pounds: this.data.stringService.pounds,
        string_id: this.data.stringService.string_id,
        remark: this.data.stringService.remark
      });
      
      console.log('订单创建成功:', orderResult);
      
      // 显示订单成功弹窗
      this.setData({ 
        loading: false,
        showOrderModal: true,
        orderDetails: orderResult
      });
      
      // 重置表单数据
      this.setData({
        'stringService.racket_brand': '',
        'stringService.pounds': 24,
        'stringService.string_id': '',
        'stringService.remark': '',
        'stringService.total_price': 0
      });
      this.checkCanSubmitOrder();
      
    } catch (error) {
      console.error('提交订单失败:', error);
      this.setData({ loading: false });
      
      let errorMessage = '订单提交失败';
      
      if (error.error === 401) {
        errorMessage = '请先登录';
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else if (error.error === 400) {
        errorMessage = '订单信息有误，请检查';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // =============== Tab2: 积分兑换相关方法 ===============

  /**
   * 加载积分兑换数据 - 使用真实API接口
   */
  async loadPointsData() {
    try {
      const pointsInfo = await getPointsExchangeInfo();
      
      console.log('积分数据加载成功:', pointsInfo);
      
      // 确保数据结构安全，使用默认值避免页面报错
      const safePointsData = {
        user_points: pointsInfo.user_points || 0,
        goods: pointsInfo.goods || [],
        recent_exchanges: pointsInfo.recent_exchanges || []
      };
      
      this.setData({
        pointsData: safePointsData
      });
      
    } catch (error) {
      console.error('加载积分数据失败:', error);
      
      if (error.error === 401) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: '获取积分信息失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 商品兑换处理 - 使用真实API接口
   * @param {Object} e 点击事件对象
   */
  async exchangeGoods(e) {
    const goods = e.currentTarget.dataset.goods;
    const { pointsData } = this.data;
    
    console.log('兑换商品:', goods);
    
    if (pointsData.user_points < goods.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }
    
    if (goods.stock <= 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }
    
    // 确认兑换
    const confirmResult = await new Promise(resolve => {
      wx.showModal({
        title: '确认兑换',
        content: `确定要用${goods.points}积分兑换${goods.name}吗？`,
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
    
    if (!confirmResult) {
      return;
    }
    
    this.setData({ loading: true });
    
         try {
       // 调用兑换API
       const exchangeResult = await exchangeGoodsApi({
         goodsId: goods.id,
         points: goods.points
       });
      
      console.log('兑换成功:', exchangeResult);
      
      // 重新加载积分数据
      await this.loadPointsData();
      
      wx.showToast({
        title: '兑换成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('兑换失败:', error);
      
      let errorMessage = '兑换失败';
      
      if (error.error === 1001) {
        errorMessage = '积分不足';
      } else if (error.error === 1002) {
        errorMessage = '商品库存不足';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none'
      });
      
    } finally {
      this.setData({ loading: false });
    }
  },

  // =============== Tab3: 推广返佣相关方法 ===============

  /**
   * 加载推广返佣数据 - 使用真实API接口
   */
  async loadPromotionData() {
    try {
      const promotionInfo = await getPromotionInfo();
      
      console.log('推广数据加载成功:', promotionInfo);
      
      // 确保数据结构安全，使用默认值避免页面报错
      const safePromotionData = {
        total_earnings: promotionInfo.total_earnings || 0,
        invited_users: promotionInfo.invited_users || 0,
        this_month_earnings: promotionInfo.this_month_earnings || 0,
        today_earnings: promotionInfo.today_earnings || 0,
        account_balance: promotionInfo.account_balance || 0,
        invite_code: promotionInfo.invite_code || '',
        invite_link: promotionInfo.invite_link || '',
        qr_code_url: promotionInfo.qr_code_url || '',
        commission_records: promotionInfo.commission_records || [],
        withdraw_records: promotionInfo.withdraw_records || []
      };
      
      this.setData({
        promotionData: safePromotionData
      });
      
    } catch (error) {
      console.error('加载推广数据失败:', error);
      
      if (error.error === 401) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: '获取推广信息失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 保存推广二维码到相册
   */
  saveQrCode: function() {
    const { promotionData } = this.data;
    
    if (!promotionData.qr_code_url) {
      wx.showToast({
        title: '二维码获取失败',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...',
    });
    
    // 下载二维码图片
    wx.downloadFile({
      url: promotionData.qr_code_url,
      success: (res) => {
        // 保存到相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.hideLoading();
            wx.showToast({
              title: '已保存到相册',
              icon: 'success'
            });
          },
          fail: (err) => {
            wx.hideLoading();
            if (err.errMsg.includes('auth deny')) {
              wx.showModal({
                title: '保存失败',
                content: '请在设置中开启相册权限',
                showCancel: false
              });
            } else {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              });
            }
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
    
    console.log('保存推广二维码:', promotionData.qr_code_url);
  },

  /**
   * 复制邀请链接
   */
  copyInviteLink: function() {
    const { promotionData } = this.data;
    
    if (!promotionData.invite_link) {
      wx.showToast({
        title: '邀请链接获取失败',
        icon: 'none'
      });
      return;
    }
    
    wx.setClipboardData({
      data: promotionData.invite_link,
      success: () => {
        wx.showToast({
          title: '邀请链接已复制',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
    
    console.log('复制邀请链接:', promotionData.invite_link);
  },

  /**
   * 显示提现弹窗
   */
  showWithdrawModal: function() {
    const { promotionData } = this.data;
    
    if (promotionData.account_balance < this.data.withdrawData.min_withdraw_amount) {
      wx.showToast({
        title: `余额不足${this.data.withdrawData.min_withdraw_amount}元`,
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      'withdrawData.show_withdraw_modal': true,
      'withdrawData.withdraw_amount': ''
    });
  },

  /**
   * 隐藏提现弹窗
   */
  hideWithdrawModal: function() {
    this.setData({
      'withdrawData.show_withdraw_modal': false,
      'withdrawData.withdraw_amount': ''
    });
  },

  /**
   * 提现金额输入处理
   */
  onWithdrawAmountInput: function(e) {
    const value = parseFloat(e.detail.value) || 0;
    this.setData({
      'withdrawData.withdraw_amount': value
    });
  },

  /**
   * 确认提现 - 使用真实API接口
   */
  async confirmWithdraw() {
    const { withdrawData, promotionData } = this.data;
    const amount = parseFloat(withdrawData.withdraw_amount);
    
    // 验证提现金额
    if (!amount || amount <= 0) {
      wx.showToast({
        title: '请输入正确的提现金额',
        icon: 'none'
      });
      return;
    }
    
    if (amount < withdrawData.min_withdraw_amount) {
      wx.showToast({
        title: `最低提现金额为${withdrawData.min_withdraw_amount}元`,
        icon: 'none'
      });
      return;
    }
    
    if (amount > promotionData.account_balance) {
      wx.showToast({
        title: '余额不足',
        icon: 'none'
      });
      return;
    }
    
    // 确认提现
    const confirmResult = await new Promise(resolve => {
      wx.showModal({
        title: '确认提现',
        content: `确定要提现${amount}元吗？预计1-3个工作日到账`,
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
    
    if (!confirmResult) {
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      // 调用提现API
      const withdrawResult = await applyWithdraw({
        amount: amount
      });
      
      console.log('提现申请成功:', withdrawResult);
      
      // 隐藏弹窗
      this.setData({
        'withdrawData.show_withdraw_modal': false,
        'withdrawData.withdraw_amount': ''
      });
      
      // 重新加载推广数据
      await this.loadPromotionData();
      
      wx.showToast({
        title: '提现申请已提交',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('提现申请失败:', error);
      
      let errorMessage = '提现申请失败';
      
      if (error.error === 1001) {
        errorMessage = '账户余额不足';
      } else if (error.error === 1002) {
        errorMessage = '提现金额不符合要求';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none'
      });
      
    } finally {
      this.setData({ loading: false });
    }
  },

  // =============== Tab4: 我的服务相关方法 ===============

  /**
   * 加载服务记录数据 - 使用真实API接口
   */
  async loadServiceRecords() {
    try {
      const serviceData = await getServiceRecords({
        type: this.data.currentSubTab,
        page: 1,
        pageSize: 10
      });
      
             console.log('服务记录加载成功:', serviceData);
       
       // 确保数据结构安全，使用默认值避免页面报错
       // 接口文档显示直接返回数组
       const safeServiceData = Array.isArray(serviceData) ? serviceData : [];
       
       this.setData({
         serviceList: safeServiceData
       });
      
      // 重新筛选服务记录
      this.filterServiceList();
      
    } catch (error) {
      console.error('加载服务记录失败:', error);
      
      if (error.error === 401) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: '获取服务记录失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 根据子tab筛选服务记录
   */
  filterServiceList: function() {
    const { currentSubTab, serviceList } = this.data;
    
    let filteredList;
    if (currentSubTab === 'all') {
      filteredList = serviceList;
    } else {
      filteredList = serviceList.filter(item => item.service_type === currentSubTab);
    }
    
    this.setData({
      filteredServiceList: filteredList
    });
    
    console.log('筛选服务记录:', currentSubTab, filteredList.length);
  },

  // =============== 弹窗相关方法 ===============

  /**
   * 隐藏下单成功弹窗
   */
  hideOrderModal: function() {
    this.setData({
      showOrderModal: false
    });
  },

  /**
   * 前往我的服务页面
   */
  goToMyService: function() {
    this.setData({
      showOrderModal: false,
      currentTab: 3,
      currentSubTab: '穿线进度'
    });
    
    this.filterServiceList();
    
    wx.showToast({
      title: '已跳转到穿线进度',
      icon: 'success'
    });
  }
}); 