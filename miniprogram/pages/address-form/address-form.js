// 地址新增/编辑页面逻辑
const addressApi = require('../../api/addressApi');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 表单数据
    formData: {
      region: '',        // 地区字符串，如："广东省,深圳市,南山区"
      detail: '',        // 详细地址
      consignee: '',     // 收件人姓名
      mobile: '',        // 手机号码
      isDefault: false   // 是否为默认地址
    },
    // 地区选择器数组格式
    regionArray: ['', '', ''],
    // 表单验证错误信息
    errors: {},
    // 表单是否通过验证
    isFormValid: false,
    // 是否为编辑模式
    isEditMode: false,
    // 当前编辑的地址ID
    addressId: null,
    // 是否正在提交
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('地址表单页面加载，参数：', options);
    
    // 判断是新增还是编辑模式
    if (options.mode === 'edit' && options.id) {
      // 编辑模式：填充现有数据
      this.setData({
        isEditMode: true,
        addressId: parseInt(options.id)
      });
      
      // 更新页面标题
      wx.setNavigationBarTitle({
        title: '编辑地址'
      });
      
      // 填充表单数据
      this.populateFormData(options);
    } else {
      // 新增模式
      wx.setNavigationBarTitle({
        title: '新增地址'
      });
    }
  },

  /**
   * 填充表单数据（编辑模式）
   * @param {Object} options - 页面参数
   */
  populateFormData(options) {
    const formData = {
      region: options.region || '',
      detail: options.detail || '',
      consignee: options.consignee || '',
      mobile: options.mobile || '',
      isDefault: options.isDefault === 'true'
    };

    // 解析地区字符串为数组格式
    const regionArray = formData.region ? formData.region.split(',') : ['', '', ''];

    this.setData({
      formData,
      regionArray
    });

    // 验证表单
    this.validateForm();
  },

  /**
   * 地区选择器变化事件
   * @param {Object} event - 事件对象
   */
  onRegionChange(event) {
    const regionArray = event.detail.value;
    const region = regionArray.join(',');
    
    console.log('地区选择变化：', regionArray);

    this.setData({
      regionArray,
      'formData.region': region,
      'errors.region': '' // 清除地区错误提示
    });

    this.validateForm();
  },

  /**
   * 详细地址输入事件
   * @param {Object} event - 事件对象
   */
  onDetailInput(event) {
    const detail = event.detail.value;
    
    this.setData({
      'formData.detail': detail,
      'errors.detail': '' // 清除详细地址错误提示
    });

    this.validateForm();
  },

  /**
   * 收件人姓名输入事件
   * @param {Object} event - 事件对象
   */
  onConsigneeInput(event) {
    const consignee = event.detail.value;
    
    this.setData({
      'formData.consignee': consignee,
      'errors.consignee': '' // 清除收件人错误提示
    });

    this.validateForm();
  },

  /**
   * 手机号码输入事件
   * @param {Object} event - 事件对象
   */
  onMobileInput(event) {
    const mobile = event.detail.value;
    
    this.setData({
      'formData.mobile': mobile,
      'errors.mobile': '' // 清除手机号错误提示
    });

    this.validateForm();
  },

  /**
   * 默认地址开关变化事件
   * @param {Object} event - 事件对象
   */
  onDefaultChange(event) {
    const isDefault = event.detail.value;
    
    this.setData({
      'formData.isDefault': isDefault
    });
  },

  /**
   * 表单验证函数
   */
  validateForm() {
    const { formData } = this.data;
    const errors = {};

    // 验证地区选择
    if (!formData.region || formData.region.split(',').some(item => !item.trim())) {
      errors.region = '请选择所在地区';
    }

    // 验证详细地址
    if (!formData.detail.trim()) {
      errors.detail = '请输入详细地址';
    } else if (formData.detail.length < 5) {
      errors.detail = '详细地址至少需要5个字符';
    }

    // 验证收件人姓名
    if (!formData.consignee.trim()) {
      errors.consignee = '请输入收件人姓名';
    } else if (formData.consignee.length < 2) {
      errors.consignee = '收件人姓名至少需要2个字符';
    }

    // 验证手机号码
    const mobileRegex = /^1[3-9]\d{9}$/;
    if (!formData.mobile) {
      errors.mobile = '请输入手机号码';
    } else if (!mobileRegex.test(formData.mobile)) {
      errors.mobile = '请输入正确的11位手机号码';
    }

    // 检查表单是否通过验证
    const isFormValid = Object.keys(errors).length === 0;

    this.setData({
      errors,
      isFormValid
    });

    return isFormValid;
  },

  /**
   * 表单提交事件
   * @param {Object} event - 事件对象
   */
  async onSubmit(event) {
    console.log('表单提交');

    // 再次验证表单
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      });
      return;
    }

    // 防止重复提交
    if (this.data.submitting) {
      return;
    }

    this.setData({ submitting: true });

    try {
      const { formData, isEditMode, addressId } = this.data;
      
      if (isEditMode) {
        // 编辑模式：更新地址
        await addressApi.updateAddress({
          id: addressId,
          ...formData
        });
        
        wx.showToast({
          title: '地址修改成功',
          icon: 'success'
        });
      } else {
        // 新增模式：添加地址
        await addressApi.addAddress(formData);
        
        wx.showToast({
          title: '地址添加成功',
          icon: 'success'
        });
      }

      // 延迟返回上一页，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存地址失败：', error);
      // API会自动显示错误提示，这里不需要重复显示
    } finally {
      this.setData({ submitting: false });
    }
  },

  /**
   * 删除当前地址（编辑模式）
   */
  deleteCurrentAddress() {
    if (!this.data.isEditMode || !this.data.addressId) {
      return;
    }

    console.log('删除当前地址：', this.data.addressId);

    // 弹出确认对话框
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个收货地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await addressApi.deleteAddress(this.data.addressId);
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 延迟返回上一页
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);

          } catch (error) {
            console.error('删除地址失败：', error);
          }
        }
      }
    });
  }
}); 