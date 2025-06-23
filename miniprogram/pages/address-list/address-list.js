// 地址管理页面逻辑
const addressApi = require('../../api/addressApi');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressList: [], // 地址列表数组
    isManageMode: false, // 是否处于管理模式
    selectedCount: 0, // 已选中的地址数量
    isAllSelected: false, // 是否全选
    loading: false // 是否正在加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('地址管理页面加载');
    this.loadAddressList();
  },

  /**
   * 生命周期函数--监听页面显示
   * 从新增/编辑页面返回时会重新显示，需要刷新数据
   */
  onShow() {
    // 如果不是首次加载，则刷新地址列表
    if (this.data.addressList.length > 0) {
      this.loadAddressList();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('用户下拉刷新');
    this.loadAddressList().finally(() => {
      wx.stopPullDownRefresh(); // 停止下拉刷新动画
    });
  },

  /**
   * 加载地址列表数据
   */
  async loadAddressList() {
    if (this.data.loading) return; // 防止重复请求

    this.setData({ loading: true });

    try {
      const addressList = await addressApi.getAddressList();
      
      // 为每个地址项添加选中状态字段（用于管理模式）
      const listWithCheckState = addressList.map(item => ({
        ...item,
        checked: false // 初始状态都不选中
      }));

      this.setData({
        addressList: listWithCheckState,
        selectedCount: 0,
        isAllSelected: false,
        isManageMode: false // 重置管理模式
      });

      console.log('地址列表加载成功：', addressList);

    } catch (error) {
      console.error('加载地址列表失败：', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 新增地址按钮点击事件
   */
  addAddress() {
    console.log('点击新增地址');
    wx.navigateTo({
      url: '/pages/address-form/address-form'
    });
  },

  /**
   * 编辑地址按钮点击事件
   * @param {Object} event - 事件对象
   */
  editAddress(event) {
    const address = event.currentTarget.dataset.address;
    console.log('点击编辑地址：', address);
    
    // 将地址信息作为参数传递到编辑页面
    wx.navigateTo({
      url: `/pages/address-form/address-form?mode=edit&id=${address.id}&consignee=${address.consignee}&mobile=${address.mobile}&region=${address.region}&detail=${address.detail}&isDefault=${address.isDefault}`
    });
  },

  /**
   * 删除单个地址
   * @param {Object} event - 事件对象
   */
  deleteAddress(event) {
    const addressId = event.currentTarget.dataset.id;
    console.log('点击删除地址：', addressId);

    // 弹出确认对话框
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个收货地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await addressApi.deleteAddress(addressId);
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            // 重新加载地址列表
            this.loadAddressList();
          } catch (error) {
            console.error('删除地址失败：', error);
          }
        }
      }
    });
  },

  /**
   * 切换管理模式
   */
  toggleManageMode() {
    const newManageMode = !this.data.isManageMode;
    console.log('切换管理模式：', newManageMode);

    if (newManageMode) {
      // 进入管理模式，重置所有选中状态
      const addressList = this.data.addressList.map(item => ({
        ...item,
        checked: false
      }));
      
      this.setData({
        isManageMode: true,
        addressList,
        selectedCount: 0,
        isAllSelected: false
      });
    } else {
      // 退出管理模式
      this.setData({
        isManageMode: false,
        selectedCount: 0,
        isAllSelected: false
      });
    }
  },

  /**
   * 地址项复选框点击事件
   * @param {Object} event - 事件对象
   */
  onCheckboxTap(event) {
    const addressId = parseInt(event.currentTarget.dataset.id);
    console.log('点击复选框：', addressId);

    // 更新对应地址项的选中状态
    const addressList = this.data.addressList.map(item => {
      if (item.id === addressId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    // 计算选中数量
    const selectedCount = addressList.filter(item => item.checked).length;
    const isAllSelected = selectedCount === addressList.length;

    this.setData({
      addressList,
      selectedCount,
      isAllSelected
    });
  },

  /**
   * 全选/取消全选切换
   */
  toggleSelectAll() {
    const isAllSelected = !this.data.isAllSelected;
    console.log('切换全选状态：', isAllSelected);

    // 更新所有地址项的选中状态
    const addressList = this.data.addressList.map(item => ({
      ...item,
      checked: isAllSelected
    }));

    const selectedCount = isAllSelected ? addressList.length : 0;

    this.setData({
      addressList,
      selectedCount,
      isAllSelected
    });
  },

  /**
   * 批量删除地址
   */
  batchDeleteAddress() {
    const selectedAddresses = this.data.addressList.filter(item => item.checked);
    const selectedIds = selectedAddresses.map(item => item.id);
    
    if (selectedIds.length === 0) {
      wx.showToast({
        title: '请选择要删除的地址',
        icon: 'none'
      });
      return;
    }

    console.log('批量删除地址：', selectedIds);

    // 弹出确认对话框
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedIds.length} 个地址吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await addressApi.batchDeleteAddress(selectedIds);
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            // 重新加载地址列表
            this.loadAddressList();
          } catch (error) {
            console.error('批量删除地址失败：', error);
          }
        }
      }
    });
  }
}); 