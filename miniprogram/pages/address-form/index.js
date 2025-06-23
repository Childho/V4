// 地址编辑页面逻辑
import { 
  addAddress, 
  updateAddress, 
  getAddressDetail 
} from '../../api/addressApi.js';

/**
 * 地址编辑页面
 * 功能：新增地址、编辑已有地址、表单验证、地区选择
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面状态
    action: 'add',        // 操作类型：add-新增，edit-编辑
    addressId: null,      // 编辑时的地址ID
    isLoading: false,     // 是否正在加载
    
    // 表单数据
    formData: {
      consignee: '',      // 收件人姓名
      mobile: '',         // 手机号码
      region: '',         // 地区（省市区）
      detail: '',         // 详细地址
      isDefault: false    // 是否为默认地址
    },
    
    // 地区选择器
    regionArray: [],      // 地区选择器的值数组
    showRegionPicker: false,  // 是否显示地区选择器
    
    // 表单验证
    canSave: false,       // 是否可以保存（表单验证通过）
    errors: {}            // 表单验证错误信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('地址编辑页面加载，参数：', options);
    
    const { action = 'add', id } = options;
    
    this.setData({
      action,
      addressId: id ? parseInt(id) : null
    });
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: action === 'add' ? '新增地址' : '编辑地址'
    });
    
    // 如果是编辑模式，加载地址详情
    if (action === 'edit' && id) {
      this.loadAddressDetail(parseInt(id));
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时验证表单
    this.validateForm();
  },

  /**
   * 加载地址详情（编辑模式使用）
   */
  async loadAddressDetail(addressId) {
    try {
      this.setData({ isLoading: true });
      wx.showLoading({ title: '加载中...' });
      
      // 这里先从addressList中模拟获取数据
      // 实际项目中应该调用 getAddressDetail(addressId)
      const mockAddress = {
        id: addressId,
        consignee: '张三',
        mobile: '13812345678',
        region: '广东省,深圳市,南山区',
        detail: '科技园南区深南大道9988号',
        isDefault: true
      };
      
      // 解析地区字符串为数组
      const regionArray = mockAddress.region ? mockAddress.region.split(',') : [];
      
      this.setData({
        formData: {
          consignee: mockAddress.consignee || '',
          mobile: mockAddress.mobile || '',
          region: mockAddress.region || '',
          detail: mockAddress.detail || '',
          isDefault: mockAddress.isDefault || false
        },
        regionArray
      });
      
      console.log('加载地址详情成功：', mockAddress);
      
    } catch (error) {
      console.error('加载地址详情失败：', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      
      // 加载失败返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
      
    } finally {
      this.setData({ isLoading: false });
      wx.hideLoading();
    }
  },

  /**
   * 输入框内容变化处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
    
    console.log(`${field} 输入变化：`, value);
    
    // 实时验证表单
    this.validateForm();
  },

  /**
   * 开关状态变化处理
   */
  onSwitchChange(e) {
    const { value } = e.detail;
    
    this.setData({
      'formData.isDefault': value
    });
    
    console.log('默认地址开关：', value);
  },

  /**
   * 打开地区选择器
   */
  openRegionPicker() {
    // 触发地区选择器显示
    this.setData({
      showRegionPicker: true
    });
    
    // 立即触发picker的tap事件
    setTimeout(() => {
      this.setData({
        showRegionPicker: false
      });
    }, 100);
  },

  /**
   * 地区选择器变化处理
   */
  onRegionChange(e) {
    const { value } = e.detail;
    const regionText = value.join(',');
    
    this.setData({
      'formData.region': regionText,
      regionArray: value
    });
    
    console.log('地区选择：', regionText);
    
    // 验证表单
    this.validateForm();
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData } = this.data;
    const errors = {};
    let isValid = true;
    
    // 验证收件人姓名
    if (!formData.consignee || formData.consignee.trim().length === 0) {
      errors.consignee = '请输入收件人姓名';
      isValid = false;
    } else if (formData.consignee.trim().length < 2) {
      errors.consignee = '收件人姓名至少2个字符';
      isValid = false;
    }
    
    // 验证手机号码
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.mobile) {
      errors.mobile = '请输入联系电话';
      isValid = false;
    } else if (!phoneRegex.test(formData.mobile)) {
      errors.mobile = '请输入正确的手机号码';
      isValid = false;
    }
    
    // 验证地区选择
    if (!formData.region) {
      errors.region = '请选择所在地区';
      isValid = false;
    }
    
    // 验证详细地址
    if (!formData.detail || formData.detail.trim().length === 0) {
      errors.detail = '请输入详细地址';
      isValid = false;
    } else if (formData.detail.trim().length < 5) {
      errors.detail = '详细地址至少5个字符';
      isValid = false;
    }
    
    this.setData({
      errors,
      canSave: isValid
    });
    
    return isValid;
  },

  /**
   * 保存地址
   */
  async saveAddress() {
    // 再次验证表单
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善地址信息',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({ title: '保存中...' });
      
      const { formData, action, addressId } = this.data;
      
      // 构造提交数据
      const submitData = {
        consignee: formData.consignee.trim(),
        mobile: formData.mobile.trim(),
        region: formData.region,
        detail: formData.detail.trim(),
        isDefault: formData.isDefault
      };
      
      // 分离省市区
      const [province, city, district] = formData.region.split(',');
      submitData.province = province;
      submitData.city = city;
      submitData.district = district;
      
      let result;
      
      if (action === 'edit' && addressId) {
        // 编辑地址
        submitData.id = addressId;
        result = await updateAddress(submitData);
        console.log('编辑地址成功：', result);
      } else {
        // 新增地址
        result = await addAddress(submitData);
        console.log('新增地址成功：', result);
      }
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
      
    } catch (error) {
      console.error('保存地址失败：', error);
      // 错误提示已在API层处理，这里不需要额外处理
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: '地址编辑',
      path: '/pages/address-form/index'
    };
  }
}); 