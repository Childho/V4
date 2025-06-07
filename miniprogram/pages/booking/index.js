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

    // === Tab1: 穿线服务数据 ===
    stringService: {
      racket_brand: '',       // 球拍品牌与型号
      main_pounds: 24,        // 主线磅数（保留用于兼容性）
      cross_pounds: 23,       // 横线磅数（保留用于兼容性）
      pounds: 24,             // 统一磅数（新增）
      string_id: '',          // 选中的线材ID
      remark: '',             // 备注信息
      total_price: 0          // 总价格
    },
    
    // 线材品牌列表 (mock数据)
    stringBrands: [
      { id: 'all', name: '全部' },
      { id: 'yonex', name: 'YONEX' },
      { id: 'victor', name: 'VICTOR' },
      { id: 'li_ning', name: '李宁' },
      { id: 'gosen', name: 'GOSEN' }
    ],
    
    // 当前选中的品牌
    selectedBrand: 'all',
    
    // 线材列表 (mock数据)
    stringList: [
      { 
        id: 'BG65', 
        name: 'BG-65', 
        brand: 'yonex',
        description: '经典耐用，适合初学者',
        price: 35 
      },
      { 
        id: 'BG80', 
        name: 'BG-80 Power', 
        brand: 'yonex',
        description: '高弹性，进攻型选手首选',
        price: 45 
      },
      { 
        id: 'VBS63', 
        name: 'VBS-63', 
        brand: 'victor',
        description: '控制性佳，防守型球员推荐',
        price: 38 
      },
      { 
        id: 'LN_NO7', 
        name: 'No.7线', 
        brand: 'li_ning',
        description: '均衡型线材，适合各类打法',
        price: 32 
      },
      { 
        id: 'GOSEN_G_TONE', 
        name: 'G-TONE 9', 
        brand: 'gosen',
        description: '日本进口专业线材，手感佳',
        price: 48 
      },
      { 
        id: 'GOSEN_PRO', 
        name: 'Pro 88', 
        brand: 'gosen',
        description: '专业比赛级线材，控制精准',
        price: 55 
      }
    ],
    
    // 根据品牌筛选后的线材列表
    filteredStrings: [],
    
    // 是否可以提交订单 (必填项检查)
    canSubmitOrder: false,

    // === Tab2: 积分兑换数据 ===
    pointsData: {
      user_points: 2580,      // 用户当前积分
      goods: [                // 可兑换商品列表
        {
          id: 101,
          name: '羽毛球拍',
          img: '/assets/images/racket.jpg',
          points: 2200,
          stock: 5
        },
        {
          id: 102,
          name: '专业羽毛球鞋',
          img: '/assets/images/shoes.jpg',
          points: 1800,
          stock: 3
        },
        {
          id: 103,
          name: '手胶套装',
          img: '/assets/images/grip.jpg',
          points: 300,
          stock: 10
        }
      ],
      recent_exchanges: [      // 最近兑换记录
        {
          goods_name: '专业羽毛球鞋',
          points: 1800,
          date: '2024-06-01'
        },
        {
          goods_name: '手胶套装',
          points: 300,
          date: '2024-05-28'
        }
      ]
    },

    // === Tab3: 推广返佣数据 ===
    promotionData: {
      invite_code: 'ABC123',                              // 邀请码
      qrcode_url: '/assets/images/qrcode.png',           // 二维码图片链接
      invite_url: 'https://miniprog.com/invite/ABC123',  // 邀请链接
      total_commission: 352.00,                          // 累计返佣
      pending_commission: 28.00,                         // 今日收益
      withdrawable_amount: 120.00,                       // 可提现余额
      invite_count: 15,                                  // 累计邀请人数
      commission_history: [                              // 佣金明细
        {
          type: '获得佣金',
          amount: 10,
          date: '2024-06-01',
          status: '已到账'
        },
        {
          type: '获得佣金',
          amount: 18,
          date: '2024-05-30',
          status: '已到账'
        }
      ],
      withdraw_history: [                                // 提现记录
        {
          amount: 100,
          date: '2024-05-20',
          status: '已完成'
        },
        {
          amount: 50,
          date: '2024-05-15',
          status: '已完成'
        }
      ]
    },
    
    // 提现金额输入
    withdrawAmount: '',
    
    // 是否可以提现 (金额验证)
    canWithdraw: false,

    // === Tab4: 我的服务数据 ===
    // 子tab配置
    subTabs: [
      { id: 'all', name: '全部' },
      { id: '穿线进度', name: '穿线进度' },
      { id: '奖品物流', name: '奖品物流' },
      { id: '返佣记录', name: '返佣记录' }
    ],
    
    // 服务记录列表 (mock数据)
    serviceList: [
      {
        service_type: '穿线进度',
        racket: 'YONEX BG-65',
        status: '穿线中',
        progress: 60,
        detail: '主线24磅，横线23磅，预计6月10日完成'
      },
      {
        service_type: '奖品物流',
        goods: '专业手胶套装',
        logistics: [
          { desc: '已发货', time: '2024-06-06 15:00' },
          { desc: '运输中', time: '2024-06-06 18:00' },
          { desc: '派送中', time: '2024-06-07 09:00' }
        ],
        express_number: 'SF1234567890'
      },
      {
        service_type: '返佣记录',
        amount: 20,
        desc: '邀请好友下单奖励',
        date: '2024-06-02',
        status: '已到账'
      },
      {
        service_type: '穿线进度',
        racket: 'VICTOR VBS-63',
        status: '已完成',
        progress: 100,
        detail: '主线26磅，横线25磅，已完成待取'
      }
    ],
    
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
    console.log('服务页面显示');
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
    // 初始化线材筛选
    this.filterStrings();
    
    // 初始化服务记录筛选
    this.filterServiceList();
    
    // 检查订单提交条件
    this.checkCanSubmitOrder();
    
    // 检查提现条件
    this.checkCanWithdraw();
  },

  /**
   * 加载页面数据 (模拟接口请求)
   */
  loadData: function() {
    return new Promise((resolve) => {
      this.setData({ loading: true });
      
      // 模拟接口请求延迟
      setTimeout(() => {
        console.log('模拟数据加载完成');
        this.setData({ loading: false });
        resolve();
      }, 1000);
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
    
    // 切换到"我的服务"时刷新数据
    if (index === 3) {
      this.filterServiceList();
    }
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
   * 磅数调整处理（新版统一磅数）
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
    
    // 更新统一磅数，同时保持主线横线同步（用于后端兼容）
    this.setData({
      'stringService.pounds': newValue,
      'stringService.main_pounds': newValue,
      'stringService.cross_pounds': newValue
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
    const selectedString = this.data.stringList.find(item => item.id === stringId);
    
    console.log('选择线材:', selectedString);
    
    this.setData({
      'stringService.string_id': stringId,
      'stringService.total_price': selectedString ? selectedString.price : 0
    });
    
    this.checkCanSubmitOrder();
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
   * 提交穿线订单
   */
  submitOrder: function() {
    if (!this.data.canSubmitOrder) {
      wx.showToast({
        title: '请完善订单信息',
        icon: 'none'
      });
      return;
    }
    
    console.log('提交穿线订单:', this.data.stringService);
    
    // 显示加载状态
    this.setData({ loading: true });
    
    // 模拟提交订单接口
    setTimeout(() => {
      this.setData({ 
        loading: false,
        showOrderModal: true
      });
      
      // 重置表单数据
      this.setData({
        'stringService.racket_brand': '',
        'stringService.pounds': 24,
        'stringService.main_pounds': 24,
        'stringService.cross_pounds': 24,
        'stringService.string_id': '',
        'stringService.remark': '',
        'stringService.total_price': 0
      });
      this.checkCanSubmitOrder();
      
    }, 1500);
  },

  // =============== Tab2: 积分兑换相关方法 ===============

  /**
   * 商品兑换处理
   * @param {Object} e 点击事件对象
   */
  exchangeGoods: function(e) {
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
    wx.showModal({
      title: '确认兑换',
      content: `确定要用${goods.points}积分兑换${goods.name}吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performExchange(goods);
        }
      }
    });
  },

  /**
   * 执行兑换操作
   * @param {Object} goods 商品信息
   */
  performExchange: function(goods) {
    this.setData({ loading: true });
    
    // 模拟兑换接口
    setTimeout(() => {
      const { pointsData } = this.data;
      
      // 更新积分和库存
      const newUserPoints = pointsData.user_points - goods.points;
      const newGoods = pointsData.goods.map(item => {
        if (item.id === goods.id) {
          return { ...item, stock: item.stock - 1 };
        }
        return item;
      });
      
      // 添加兑换记录
      const newRecord = {
        goods_name: goods.name,
        points: goods.points,
        date: new Date().toISOString().split('T')[0]
      };
      
      this.setData({
        'pointsData.user_points': newUserPoints,
        'pointsData.goods': newGoods,
        'pointsData.recent_exchanges': [newRecord, ...pointsData.recent_exchanges],
        loading: false
      });
      
      wx.showToast({
        title: '兑换成功',
        icon: 'success'
      });
      
      console.log('兑换完成，剩余积分:', newUserPoints);
      
    }, 1000);
  },

  // =============== Tab3: 推广返佣相关方法 ===============

  /**
   * 保存二维码到相册
   */
  saveQrcode: function() {
    console.log('保存二维码');
    
    wx.showLoading({
      title: '保存中...'
    });
    
    // 模拟保存操作
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 复制邀请链接
   */
  copyUrl: function() {
    const { promotionData } = this.data;
    
    wx.setClipboardData({
      data: promotionData.invite_url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
        console.log('复制链接:', promotionData.invite_url);
      }
    });
  },

  /**
   * 提现金额输入处理
   * @param {Object} e 输入事件对象
   */
  onWithdrawInput: function(e) {
    const value = e.detail.value;
    this.setData({
      withdrawAmount: value
    });
    this.checkCanWithdraw();
  },

  /**
   * 检查是否可以提现
   */
  checkCanWithdraw: function() {
    const { withdrawAmount, promotionData } = this.data;
    const amount = parseFloat(withdrawAmount);
    
    const canWithdraw = amount > 0 && 
                       amount <= promotionData.withdrawable_amount && 
                       amount >= 10; // 最低提现金额10元
    
    this.setData({
      canWithdraw: canWithdraw
    });
    
    console.log('提现检查:', canWithdraw, amount);
  },

  /**
   * 提交提现申请
   */
  submitWithdraw: function() {
    if (!this.data.canWithdraw) {
      wx.showToast({
        title: '请输入正确的提现金额',
        icon: 'none'
      });
      return;
    }
    
    const amount = parseFloat(this.data.withdrawAmount);
    console.log('申请提现:', amount);
    
    // 确认提现
    wx.showModal({
      title: '确认提现',
      content: `确定要提现¥${amount}到微信钱包吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performWithdraw(amount);
        }
      }
    });
  },

  /**
   * 执行提现操作
   * @param {number} amount 提现金额
   */
  performWithdraw: function(amount) {
    this.setData({ loading: true });
    
    // 模拟提现接口
    setTimeout(() => {
      const { promotionData } = this.data;
      
      // 更新余额
      const newWithdrawableAmount = promotionData.withdrawable_amount - amount;
      
      // 添加提现记录
      const newRecord = {
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        status: '处理中'
      };
      
      this.setData({
        'promotionData.withdrawable_amount': newWithdrawableAmount,
        'promotionData.withdraw_history': [newRecord, ...promotionData.withdraw_history],
        withdrawAmount: '',
        loading: false
      });
      
      this.checkCanWithdraw();
      
      wx.showToast({
        title: '提现申请已提交',
        icon: 'success'
      });
      
      console.log('提现申请成功，剩余余额:', newWithdrawableAmount);
      
    }, 1500);
  },

  // =============== Tab4: 我的服务相关方法 ===============

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