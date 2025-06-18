/**
 * 购物车页面逻辑
 * 功能包括：商品展示、数量修改、选择/全选、删除、结算等
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cartList: [], // 购物车商品列表
    isManageMode: false, // 是否为管理模式
    allSelected: false, // 是否全选
    selectedCount: 0, // 已选择商品数量
    totalPrice: '0.00', // 总价格
    discountAmount: '0.00', // 优惠金额
    showSpecsPopup: false, // 是否显示规格选择弹窗
    currentIndex: -1, // 当前操作的商品索引
    currentItem: {}, // 当前操作的商品
    specOptions: [], // 规格选项
    selectedSpecs: '' // 已选择的规格文本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('购物车页面加载');
    this.loadCartData(); // 加载购物车数据
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('购物车页面显示');
    this.loadCartData(); // 每次显示时重新加载数据
  },

  /**
   * 加载购物车数据
   * 优先从缓存加载，如果没有则加载模拟数据
   */
  loadCartData() {
    try {
      // 从本地缓存获取购物车数据
      const cartData = wx.getStorageSync('cartList');
      if (cartData && cartData.length > 0) {
        this.setData({
          cartList: cartData
        });
      } else {
        // 如果没有缓存数据，加载模拟数据用于演示
        this.loadMockData();
      }
      this.calculatePrice(); // 计算价格
    } catch (error) {
      console.error('加载购物车数据失败:', error);
      this.loadMockData(); // 加载失败时使用模拟数据
    }
  },

  /**
   * 加载模拟数据（用于演示）
   */
  loadMockData() {
    const mockData = [
      {
        id: 1,
        name: '苹果iPhone 14 Pro Max 紫色 128GB',
        spec: '颜色：紫色 容量：128GB',
        price: 9999.00,
        quantity: 1,
        image: '/assets/images/phone1.jpg',
        selected: true,
        specGroups: [
          {
            name: '颜色',
            options: [
              { value: '紫色', selected: true, disabled: false },
              { value: '黑色', selected: false, disabled: false },
              { value: '白色', selected: false, disabled: false }
            ]
          },
          {
            name: '容量',
            options: [
              { value: '128GB', selected: true, disabled: false },
              { value: '256GB', selected: false, disabled: false },
              { value: '512GB', selected: false, disabled: false }
            ]
          }
        ]
      },
      {
        id: 2,
        name: '华为Mate50 Pro 昆仑破晓 256GB',
        spec: '颜色：昆仑破晓 容量：256GB',
        price: 6999.00,
        quantity: 2,
        image: '/assets/images/phone2.jpg',
        selected: false,
        specGroups: [
          {
            name: '颜色',
            options: [
              { value: '昆仑破晓', selected: true, disabled: false },
              { value: '冰霜银', selected: false, disabled: false },
              { value: '曜金黑', selected: false, disabled: false }
            ]
          },
          {
            name: '容量',
            options: [
              { value: '128GB', selected: false, disabled: false },
              { value: '256GB', selected: true, disabled: false },
              { value: '512GB', selected: false, disabled: false }
            ]
          }
        ]
      },
      {
        id: 3,
        name: '小米13 Ultra 黑色 512GB',
        spec: '颜色：黑色 容量：512GB',
        price: 5999.00,
        quantity: 1,
        image: '/assets/images/phone3.jpg',
        selected: true,
        specGroups: [
          {
            name: '颜色',
            options: [
              { value: '黑色', selected: true, disabled: false },
              { value: '白色', selected: false, disabled: false },
              { value: '橄榄绿', selected: false, disabled: false }
            ]
          },
          {
            name: '容量',
            options: [
              { value: '256GB', selected: false, disabled: false },
              { value: '512GB', selected: true, disabled: false },
              { value: '1TB', selected: false, disabled: false }
            ]
          }
        ]
      }
    ];
    
    this.setData({
      cartList: mockData
    });
    this.saveCartToStorage(); // 保存到本地缓存
  },

  /**
   * 切换管理模式
   */
  toggleManageMode() {
    const newMode = !this.data.isManageMode;
    this.setData({
      isManageMode: newMode
    });
    
    // 如果退出管理模式，重新计算价格
    if (!newMode) {
      this.calculatePrice();
    }
  },

  /**
   * 切换商品选择状态
   */
  toggleItemSelect(e) {
    const index = e.currentTarget.dataset.index;
    const cartList = this.data.cartList;
    
    // 切换选中状态
    cartList[index].selected = !cartList[index].selected;
    
    this.setData({
      cartList: cartList
    });
    
    this.updateSelectStatus(); // 更新选择状态
    this.calculatePrice(); // 重新计算价格
    this.saveCartToStorage(); // 保存到缓存
  },

  /**
   * 切换全选状态
   */
  toggleSelectAll() {
    const allSelected = !this.data.allSelected;
    const cartList = this.data.cartList;
    
    // 更新所有商品的选中状态
    cartList.forEach(item => {
      item.selected = allSelected;
    });
    
    this.setData({
      cartList: cartList,
      allSelected: allSelected
    });
    
    this.updateSelectStatus(); // 更新选择状态
    this.calculatePrice(); // 重新计算价格
    this.saveCartToStorage(); // 保存到缓存
  },

  /**
   * 更新选择状态（计算选中数量和全选状态）
   */
  updateSelectStatus() {
    const cartList = this.data.cartList;
    const selectedItems = cartList.filter(item => item.selected);
    const selectedCount = selectedItems.length;
    const allSelected = selectedCount === cartList.length && cartList.length > 0;
    
    this.setData({
      selectedCount: selectedCount,
      allSelected: allSelected
    });
  },

  /**
   * 减少商品数量
   */
  decreaseQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const cartList = this.data.cartList;
    
    if (cartList[index].quantity > 1) {
      cartList[index].quantity--;
      this.setData({
        cartList: cartList
      });
      this.calculatePrice(); // 重新计算价格
      this.saveCartToStorage(); // 保存到缓存
    } else {
      // 如果数量为1，提示用户是否删除
      this.confirmDeleteItem(index);
    }
  },

  /**
   * 增加商品数量
   */
  increaseQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const cartList = this.data.cartList;
    
    // 限制最大数量为99
    if (cartList[index].quantity < 99) {
      cartList[index].quantity++;
      this.setData({
        cartList: cartList
      });
      this.calculatePrice(); // 重新计算价格
      this.saveCartToStorage(); // 保存到缓存
    } else {
      wx.showToast({
        title: '商品数量不能超过99件',
        icon: 'none'
      });
    }
  },

  /**
   * 输入数量变化
   */
  inputQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const value = parseInt(e.detail.value) || 1;
    const cartList = this.data.cartList;
    
    // 限制数量范围为1-99
    if (value >= 1 && value <= 99) {
      cartList[index].quantity = value;
      this.setData({
        cartList: cartList
      });
      this.calculatePrice(); // 重新计算价格
      this.saveCartToStorage(); // 保存到缓存
    } else {
      wx.showToast({
        title: '请输入1-99之间的数量',
        icon: 'none'
      });
      // 恢复原来的值
      this.setData({
        cartList: cartList
      });
    }
  },

  /**
   * 删除单个商品
   */
  deleteItem(e) {
    const index = e.currentTarget.dataset.index;
    this.confirmDeleteItem(index);
  },

  /**
   * 确认删除商品对话框
   */
  confirmDeleteItem(index) {
    const item = this.data.cartList[index];
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${item.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.removeItemFromCart(index);
        }
      }
    });
  },

  /**
   * 从购物车移除商品
   */
  removeItemFromCart(index) {
    const cartList = this.data.cartList;
    cartList.splice(index, 1);
    
    this.setData({
      cartList: cartList
    });
    
    this.updateSelectStatus(); // 更新选择状态
    this.calculatePrice(); // 重新计算价格
    this.saveCartToStorage(); // 保存到缓存
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  /**
   * 删除选中的商品
   */
  deleteSelectedItems() {
    const selectedItems = this.data.cartList.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请先选择要删除的商品',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的${selectedItems.length}件商品吗？`,
      success: (res) => {
        if (res.confirm) {
          const cartList = this.data.cartList.filter(item => !item.selected);
          this.setData({
            cartList: cartList
          });
          
          this.updateSelectStatus(); // 更新选择状态
          this.calculatePrice(); // 重新计算价格
          this.saveCartToStorage(); // 保存到缓存
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 计算价格
   */
  calculatePrice() {
    const cartList = this.data.cartList;
    const selectedItems = cartList.filter(item => item.selected);
    
    let totalPrice = 0;
    selectedItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });
    
    // 计算优惠金额（这里可以根据业务需求计算优惠）
    let discountAmount = 0;
    if (totalPrice > 10000) {
      discountAmount = 100; // 满10000减100
    } else if (totalPrice > 5000) {
      discountAmount = 50; // 满5000减50
    }
    
    const finalPrice = totalPrice - discountAmount;
    
    this.setData({
      totalPrice: finalPrice.toFixed(2),
      discountAmount: discountAmount.toFixed(2)
    });
    
    this.updateSelectStatus(); // 更新选择状态
  },

  /**
   * 保存购物车到本地缓存
   */
  saveCartToStorage() {
    try {
      wx.setStorageSync('cartList', this.data.cartList);
    } catch (error) {
      console.error('保存购物车数据失败:', error);
    }
  },

  /**
   * 去结算
   */
  goToCheckout() {
    const selectedItems = this.data.cartList.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择要结算的商品',
        icon: 'none'
      });
      return;
    }
    
    // 保存选中的商品到缓存，供订单确认页面使用
    try {
      wx.setStorageSync('checkoutItems', selectedItems);
      wx.setStorageSync('checkoutTotal', this.data.totalPrice);
      wx.setStorageSync('checkoutDiscount', this.data.discountAmount);
      
      // 跳转到订单确认页面
      wx.navigateTo({
        url: '/pages/checkout/checkout',
        fail: () => {
          // 如果订单确认页面不存在，先提示用户
          wx.showToast({
            title: '订单确认页面开发中',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('保存结算数据失败:', error);
      wx.showToast({
        title: '结算失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 去逛逛（跳转到商城页面）
   */
  goToMall() {
    wx.switchTab({
      url: '/pages/mall/index'
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('下拉刷新购物车');
    this.loadCartData();
    wx.stopPullDownRefresh(); // 停止下拉刷新
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的购物车',
      path: '/pages/cart/cart'
    };
  },

  /**
   * 打开规格选择弹窗
   */
  openSpecsPopup(e) {
    const index = e.currentTarget.dataset.index;
    const currentItem = {...this.data.cartList[index]};
    
    this.setData({
      currentIndex: index,
      currentItem: currentItem,
      specOptions: currentItem.specGroups || [],
      showSpecsPopup: true,
      selectedSpecs: this.getSelectedSpecsText(currentItem.specGroups)
    });
  },

  /**
   * 关闭规格选择弹窗
   */
  closeSpecsPopup() {
    this.setData({
      showSpecsPopup: false
    });
  },

  /**
   * 选择规格选项
   */
  selectSpecOption(e) {
    const { groupIndex, optionIndex } = e.currentTarget.dataset;
    const specOptions = [...this.data.specOptions];
    
    // 取消同组其他选项的选中状态
    specOptions[groupIndex].options.forEach((option, idx) => {
      option.selected = idx === optionIndex;
    });
    
    this.setData({
      specOptions: specOptions,
      selectedSpecs: this.getSelectedSpecsText(specOptions)
    });
  },

  /**
   * 获取已选择的规格文本
   */
  getSelectedSpecsText(specGroups) {
    if (!specGroups || specGroups.length === 0) return '';
    
    let selectedSpecs = '';
    specGroups.forEach(group => {
      const selectedOption = group.options.find(option => option.selected);
      if (selectedOption) {
        selectedSpecs += `${group.name}：${selectedOption.value} `;
      }
    });
    
    return selectedSpecs.trim() || '请选择规格';
  },

  /**
   * 弹窗内减少数量
   */
  popupDecreaseQuantity() {
    const currentItem = this.data.currentItem;
    
    if (currentItem.quantity <= 1) return;
    
    currentItem.quantity--;
    this.setData({
      currentItem: currentItem
    });
  },

  /**
   * 弹窗内增加数量
   */
  popupIncreaseQuantity() {
    const currentItem = this.data.currentItem;
    
    if (currentItem.quantity < 99) {
      currentItem.quantity++;
      this.setData({
        currentItem: currentItem
      });
    } else {
      wx.showToast({
        title: '商品数量不能超过99件',
        icon: 'none'
      });
    }
  },

  /**
   * 确认规格修改
   */
  confirmSpecsChange() {
    // 检查是否选择了所有规格
    if (!this.checkAllSpecsSelected()) {
      wx.showToast({
        title: '请选择完整规格',
        icon: 'none'
      });
      return;
    }
    
    const index = this.data.currentIndex;
    const cartList = [...this.data.cartList];
    
    // 更新商品规格和数量
    cartList[index].specGroups = this.data.specOptions;
    cartList[index].spec = this.data.selectedSpecs;
    cartList[index].quantity = this.data.currentItem.quantity;
    
    this.setData({
      cartList: cartList,
      showSpecsPopup: false
    });
    
    // 重新计算价格并保存
    this.calculatePrice();
    this.saveCartToStorage();
    
    wx.showToast({
      title: '规格已更新',
      icon: 'success'
    });
  },

  /**
   * 检查是否选择了所有规格
   */
  checkAllSpecsSelected() {
    const { specOptions } = this.data;
    
    for (const group of specOptions) {
      const hasSelected = group.options.some(option => option.selected);
      if (!hasSelected) {
        return false;
      }
    }
    
    return true;
  }
}); 