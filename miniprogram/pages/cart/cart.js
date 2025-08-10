/**
 * 购物车页面逻辑
 * 功能包括：商品展示、数量修改、选择/全选、删除、结算等
 */

// 引入购物车API接口
const { 
  getCartList, 
  updateQuantity, 
  updateSpecs, 
  toggleSelect, 
  removeItems, 
  checkoutPrepare, 
  clearCart 
} = require('../../api/cartApi');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cartList: [], // 购物车商品列表 - 从API获取
    isManageMode: false, // 是否为管理模式
    allSelected: false, // 是否全选
    selectedCount: 0, // 已选择商品数量
    totalPrice: '0.00', // 总价格
    discountAmount: '0.00', // 优惠金额
    originalPrice: '0.00', // 商品原价总计
    showSpecsPopup: false, // 是否显示规格选择弹窗
    showPriceDetail: false, // 是否显示金额明细弹窗
    currentIndex: -1, // 当前操作的商品索引
    currentItem: {}, // 当前操作的商品
    specOptions: [], // 规格选项
    selectedSpecs: '', // 已选择的规格文本
    loading: false, // 页面加载状态
    isEmpty: false // 购物车是否为空
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
   * 加载购物车数据 - 使用真实API接口
   */
  async loadCartData() {
    this.setData({ loading: true });
    
    try {
      const cartData = await getCartList();
      
      console.log('购物车数据加载成功:', cartData);
      
      // 确保数据结构安全，使用默认值避免页面报错
      const safeCartData = {
        cartList: cartData.cartList || []
      };
      
      this.setData({
        cartList: safeCartData.cartList,
        isEmpty: safeCartData.cartList.length === 0
      });
      
      this.calculatePrice(); // 计算价格
      
    } catch (error) {
      console.error('加载购物车数据失败:', error);
      
      if (error.error === 401) {
        // 未登录错误处理
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
        // 加载失败时显示空购物车状态
        this.setData({
          cartList: [],
          isEmpty: true
        });
        
        wx.showToast({
          title: '获取购物车数据失败',
          icon: 'none'
        });
      }
    } finally {
      this.setData({ loading: false });
    }
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
   * 切换商品选择状态 - 使用真实API接口
   */
  async toggleItemSelect(e) {
    const index = e.currentTarget.dataset.index;
    const cartList = this.data.cartList;
    const item = cartList[index];
    
    if (!item || !item.id) {
      console.error('商品数据错误，缺少id字段');
      return;
    }
    
    // 构建API调用参数
    const newSelected = !item.selected;
    const params = {
      cartIds: [item.id],
      selected: newSelected,
      selectAll: false
    };
    
    try {
      const result = await toggleSelect(params);
      
      console.log('切换选择状态成功:', result);
      
      // 更新本地数据
      cartList[index].selected = newSelected;
      
      this.setData({
        cartList: cartList
      });
      
      this.updateSelectStatus(); // 更新选择状态
      this.calculatePrice(); // 重新计算价格
      
    } catch (error) {
      console.error('切换选择状态失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 切换全选状态 - 使用真实API接口
   */
  async toggleSelectAll() {
    const allSelected = !this.data.allSelected;
    
    const params = {
      selected: allSelected,
      selectAll: true
    };
    
    try {
      const result = await toggleSelect(params);
      
      console.log('全选切换成功:', result);
      
      // 更新本地数据
      const cartList = this.data.cartList;
      cartList.forEach(item => {
        item.selected = allSelected;
      });
      
      this.setData({
        cartList: cartList,
        allSelected: allSelected
      });
      
      this.updateSelectStatus(); // 更新选择状态
      this.calculatePrice(); // 重新计算价格
      
    } catch (error) {
      console.error('全选切换失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
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
   * 减少商品数量 - 使用真实API接口
   */
  async decreaseQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const cartList = this.data.cartList;
    const item = cartList[index];
    
    if (!item || !item.id) {
      console.error('商品数据错误，缺少id字段');
      return;
    }
    
    if (item.quantity > 1) {
      await this.updateItemQuantity(item.id, item.quantity - 1, index);
    } else {
      // 如果数量为1，提示用户是否删除
      this.confirmDeleteItem(index);
    }
  },

  /**
   * 增加商品数量 - 使用真实API接口
   */
  async increaseQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const cartList = this.data.cartList;
    const item = cartList[index];
    
    if (!item || !item.id) {
      console.error('商品数据错误，缺少id字段');
      return;
    }
    
    // 限制最大数量为99
    if (item.quantity < 99) {
      await this.updateItemQuantity(item.id, item.quantity + 1, index);
    } else {
      wx.showToast({
        title: '商品数量不能超过99件',
        icon: 'none'
      });
    }
  },

  /**
   * 输入数量变化 - 使用真实API接口
   */
  async inputQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const value = parseInt(e.detail.value) || 1;
    const cartList = this.data.cartList;
    const item = cartList[index];
    
    if (!item || !item.id) {
      console.error('商品数据错误，缺少id字段');
      return;
    }
    
    // 限制数量范围为1-99
    if (value >= 1 && value <= 99) {
      await this.updateItemQuantity(item.id, value, index);
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
   * 更新商品数量的通用方法
   * @param {string} cartId 购物车条目ID
   * @param {number} quantity 新数量
   * @param {number} index 商品在列表中的索引
   */
  async updateItemQuantity(cartId, quantity, index) {
    const params = {
      cartId: cartId,
      quantity: quantity
    };
    
    try {
      const result = await updateQuantity(params);
      
      console.log('更新数量成功:', result);
      
      // 更新本地数据
      const cartList = this.data.cartList;
      cartList[index].quantity = result.newQuantity;
      
      this.setData({
        cartList: cartList
      });
      
      this.calculatePrice(); // 重新计算价格
      
    } catch (error) {
      console.error('更新数量失败:', error);
      
      let errorMessage = '更新失败，请重试';
      
      if (error.error === 1002) {
        errorMessage = '商品数量超出库存';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none'
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
          this.removeItemFromCart([item.id]);
        }
      }
    });
  },

  /**
   * 删除选中的商品 - 使用真实API接口
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
          const cartIds = selectedItems.map(item => item.id);
          this.removeItemFromCart(cartIds);
        }
      }
    });
  },

  /**
   * 从购物车移除商品 - 使用真实API接口
   * @param {Array} cartIds 要删除的购物车条目ID列表
   */
  async removeItemFromCart(cartIds) {
    const params = {
      cartIds: cartIds
    };
    
    try {
      const result = await removeItems(params);
      
      console.log('删除商品成功:', result);
      
      // 重新加载购物车数据
      await this.loadCartData();
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('删除商品失败:', error);
      wx.showToast({
        title: '删除失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 计算价格
   */
  calculatePrice() {
    const cartList = this.data.cartList;
    const selectedItems = cartList.filter(item => item.selected);
    
    let originalTotal = 0;
    selectedItems.forEach(item => {
      originalTotal += item.price * item.quantity;
    });
    
    // 计算优惠金额（这里可以根据业务需求计算优惠）
    let discountAmount = 0;
    if (originalTotal > 10000) {
      discountAmount = 100; // 满10000减100
    } else if (originalTotal > 5000) {
      discountAmount = 50; // 满5000减50
    }
    
    const finalPrice = originalTotal - discountAmount;
    
    this.setData({
      originalPrice: originalTotal.toFixed(2),
      totalPrice: finalPrice.toFixed(2),
      discountAmount: discountAmount.toFixed(2)
    });
    
    this.updateSelectStatus(); // 更新选择状态
  },

  /**
   * 去结算 - 使用真实API接口准备结算数据
   */
  async goToCheckout() {
    const selectedItems = this.data.cartList.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择要结算的商品',
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
    
    wx.showLoading({
      title: '准备结算...',
      mask: true
    });
    
    try {
      // 获取结算准备信息
      const cartIds = selectedItems.map(item => item.id);
      const checkoutData = await checkoutPrepare({ cartIds });
      
      console.log('结算准备成功:', checkoutData);
      
      // 保存结算数据到缓存，供订单确认页面使用
      wx.setStorageSync('checkoutData', checkoutData);
      wx.setStorageSync('checkoutTotal', this.data.totalPrice);
      wx.setStorageSync('checkoutDiscount', this.data.discountAmount);
      
      // 跳转到订单确认页面
      wx.navigateTo({
        url: '/pages/order-confirm/order-confirm',
        success: () => {
          console.log('成功跳转到订单确认页面，商品数量：', checkoutData.checkoutItems.length);
        },
        fail: (error) => {
          console.error('跳转订单确认页面失败：', error);
          wx.showToast({
            title: '页面跳转失败，请重试',
            icon: 'none'
          });
        }
      });
      
    } catch (error) {
      console.error('结算准备失败:', error);
      
      let errorMessage = '结算失败，请重试';
      
      if (error.error === 401) {
        errorMessage = '请先登录';
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
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
    this.loadCartData().then(() => {
      wx.stopPullDownRefresh(); // 停止下拉刷新
    });
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
   * 确认规格修改 - 使用真实API接口
   */
  async confirmSpecsChange() {
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
    const item = cartList[index];
    
    if (!item || !item.id) {
      console.error('商品数据错误，缺少id字段');
      return;
    }
    
    // 构建新规格对象
    const newSpecs = {};
    this.data.specOptions.forEach(group => {
      const selectedOption = group.options.find(option => option.selected);
      if (selectedOption) {
        newSpecs[group.name] = selectedOption.value;
      }
    });
    
    const params = {
      cartId: item.id,
      newSpecs: newSpecs,
      quantity: this.data.currentItem.quantity
    };
    
    try {
      const result = await updateSpecs(params);
      
      console.log('更新规格成功:', result);
      
      // 更新本地数据
      cartList[index].specGroups = this.data.specOptions;
      cartList[index].spec = result.newSpec;
      cartList[index].quantity = this.data.currentItem.quantity;
      
      this.setData({
        cartList: cartList,
        showSpecsPopup: false
      });
      
      // 重新计算价格
      this.calculatePrice();
      
      wx.showToast({
        title: '规格已更新',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('更新规格失败:', error);
      wx.showToast({
        title: '更新失败，请重试',
        icon: 'none'
      });
    }
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
  },

  /**
   * 显示金额明细弹窗
   */
  showPriceDetail() {
    if (this.data.selectedCount === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showPriceDetail: true
    });
  },

  /**
   * 隐藏金额明细弹窗
   */
  hidePriceDetail() {
    this.setData({
      showPriceDetail: false
    });
  },

  /**
   * 清空购物车 - 使用真实API接口
   */
  async clearCartData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空购物车中的所有商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await clearCart();
            
            console.log('清空购物车成功:', result);
            
            // 重新加载购物车数据
            await this.loadCartData();
            
            wx.showToast({
              title: '购物车已清空',
              icon: 'success'
            });
            
          } catch (error) {
            console.error('清空购物车失败:', error);
            wx.showToast({
              title: '清空失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  }
}); 