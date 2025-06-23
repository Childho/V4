// 地址管理页面逻辑
import { 
  getAddressList, 
  deleteAddress, 
  batchDeleteAddress,
  setDefaultAddress 
} from '../../api/addressApi.js';

/**
 * 地址列表页面
 * 主要功能：显示地址列表、编辑模式、多选删除、跳转编辑页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],       // 地址列表数据
    isEditMode: false,     // 是否处于编辑模式
    selectedIds: [],       // 选中的地址ID数组
    isSelectAll: false,    // 是否全选
    showDeleteModal: false,    // 是否显示删除确认弹窗
    deleteModalMessage: '',    // 删除确认弹窗的消息
    pendingDeleteIds: [],      // 待删除的地址ID数组
    fromPage: ''          // 来源页面（用于判断是选择地址还是管理地址）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('地址列表页面加载，参数：', options);
    
    // 获取来源页面参数，判断是地址选择还是地址管理
    const { from } = options;
    this.setData({
      fromPage: from || 'manage'  // 默认为管理模式
    });
    
    // 设置页面标题
    if (from === 'order' || from === 'order-confirm') {
      wx.setNavigationBarTitle({
        title: '选择收货地址'
      });
    } else {
      wx.setNavigationBarTitle({
        title: '地址管理'
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   * 每次进入页面都重新加载地址列表
   */
  onShow() {
    this.loadAddressList();
  },

  /**
   * 加载地址列表数据
   */
  async loadAddressList() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const addressList = await getAddressList();
      console.log('获取到地址列表：', addressList);
      
      // 为每个地址添加选中状态字段
      const listWithSelection = addressList.map(item => ({
        ...item,
        selected: false  // 默认未选中
      }));
      
      this.setData({
        addressList: listWithSelection
      });
      
    } catch (error) {
      console.error('加载地址列表失败：', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    const newEditMode = !this.data.isEditMode;
    
    // 退出编辑模式时清空选中状态
    if (!newEditMode) {
      this.clearSelection();
    }
    
    this.setData({
      isEditMode: newEditMode
    });
    
    console.log('切换编辑模式：', newEditMode ? '编辑' : '查看');
  },

  /**
   * 清空选中状态
   */
  clearSelection() {
    const updatedList = this.data.addressList.map(item => ({
      ...item,
      selected: false
    }));
    
    this.setData({
      addressList: updatedList,
      selectedIds: [],
      isSelectAll: false
    });
  },

  /**
   * 切换单个地址的选中状态
   */
  toggleSelect(e) {
    const { id } = e.currentTarget.dataset;
    const addressList = [...this.data.addressList];
    
    // 找到对应地址并切换选中状态
    const targetIndex = addressList.findIndex(item => item.id === id);
    if (targetIndex !== -1) {
      addressList[targetIndex].selected = !addressList[targetIndex].selected;
    }
    
    // 更新选中ID数组
    const selectedIds = addressList
      .filter(item => item.selected)
      .map(item => item.id);
    
    // 检查是否全选
    const isSelectAll = selectedIds.length === addressList.length;
    
    this.setData({
      addressList,
      selectedIds,
      isSelectAll
    });
    
    console.log('当前选中的地址ID：', selectedIds);
  },

  /**
   * 切换全选状态
   */
  toggleSelectAll() {
    const newSelectAll = !this.data.isSelectAll;
    const addressList = this.data.addressList.map(item => ({
      ...item,
      selected: newSelectAll
    }));
    
    const selectedIds = newSelectAll 
      ? addressList.map(item => item.id)
      : [];
    
    this.setData({
      addressList,
      selectedIds,
      isSelectAll: newSelectAll
    });
    
    console.log(newSelectAll ? '全选' : '取消全选');
  },

  /**
   * 选择地址（非编辑模式下点击地址卡片）
   */
  selectAddress(e) {
    // 如果是编辑模式，不处理点击事件
    if (this.data.isEditMode) {
      return;
    }
    
    const { id } = e.currentTarget.dataset;
    const { fromPage } = this.data;
    
    // 如果是从订单页面来的，选择地址后返回
    if (fromPage === 'order' || fromPage === 'order-confirm') {
      const selectedAddress = this.data.addressList.find(item => item.id === id);
      
      // 将选中的地址信息传回上一页
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      
      if (prevPage && typeof prevPage.onAddressSelected === 'function') {
        prevPage.onAddressSelected(selectedAddress);
      } else {
        // 如果上一页没有onAddressSelected方法，使用存储方式传递数据
        wx.setStorageSync('selectedAddress', selectedAddress);
      }
      
      wx.navigateBack();
      return;
    }
    
    // 管理模式下，点击可设置为默认地址
    this.setAsDefault(id);
  },

  /**
   * 设置为默认地址
   */
  async setAsDefault(addressId) {
    try {
      wx.showLoading({ title: '设置中...' });
      
      await setDefaultAddress(addressId);
      
      wx.showToast({
        title: '设置成功',
        icon: 'success'
      });
      
      // 重新加载地址列表
      this.loadAddressList();
      
    } catch (error) {
      console.error('设置默认地址失败：', error);
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 编辑地址
   */
  editAddress(e) {
    e.stopPropagation(); // 阻止事件冒泡
    const { id } = e.currentTarget.dataset;
    
    console.log('编辑地址ID：', id);
    
    // 跳转到地址编辑页面
    wx.navigateTo({
      url: `/pages/address-form/index?id=${id}&action=edit`
    });
  },

  /**
   * 新增地址
   */
  addNewAddress() {
    console.log('新增地址');
    
    // 跳转到地址编辑页面
    wx.navigateTo({
      url: '/pages/address-form/index?action=add'
    });
  },

  /**
   * 批量删除地址
   */
  batchDelete() {
    const { selectedIds } = this.data;
    
    if (selectedIds.length === 0) {
      wx.showToast({
        title: '请选择要删除的地址',
        icon: 'none'
      });
      return;
    }
    
    const message = `确定要删除选中的 ${selectedIds.length} 个地址吗？`;
    
    this.setData({
      showDeleteModal: true,
      deleteModalMessage: message,
      pendingDeleteIds: selectedIds
    });
  },

  /**
   * 隐藏删除确认弹窗
   */
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deleteModalMessage: '',
      pendingDeleteIds: []
    });
  },

  /**
   * 确认删除
   */
  async confirmDelete() {
    const { pendingDeleteIds } = this.data;
    
    try {
      wx.showLoading({ title: '删除中...' });
      
      if (pendingDeleteIds.length === 1) {
        // 删除单个地址
        await deleteAddress(pendingDeleteIds[0]);
      } else {
        // 批量删除地址
        await batchDeleteAddress(pendingDeleteIds);
      }
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 隐藏弹窗
      this.hideDeleteModal();
      
      // 重新加载地址列表
      this.loadAddressList();
      
      // 退出编辑模式
      this.setData({
        isEditMode: false
      });
      
    } catch (error) {
      console.error('删除地址失败：', error);
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: '地址管理',
      path: '/pages/address-list/index'
    };
  }
}); 