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
    regionArray: [],      // 地区选择器的值数组，格式：['省份', '城市', '区县']
    
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
    
    // 初始验证表单状态（新增）
    this.validateForm();
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
      // 支持两种格式：'广东省,深圳市,南山区' 和 '广东省 深圳市 南山区'
      let regionArray = [];
      if (mockAddress.region) {
        if (mockAddress.region.includes(',')) {
          regionArray = mockAddress.region.split(','); // 逗号分隔的格式
        } else {
          regionArray = mockAddress.region.split(' '); // 空格分隔的格式
        }
      }
      
      console.log('解析的地区数组：', regionArray); // 调试用：打印解析结果
      
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
   * 地区选择器变化处理
   * 当用户选择省市区后，这个方法会被调用
   */
  onRegionChange(e) {
    const { value } = e.detail; // value是一个数组，包含[省份, 城市, 区县]
    const regionText = value.join(' '); // 将数组转换为字符串，用空格分隔
    
    console.log('用户选择的地区：', value); // 调试用：打印选择的地区数组
    console.log('格式化的地区文本：', regionText); // 调试用：打印格式化后的文本
    
    // 更新页面数据
    this.setData({
      'formData.region': regionText,  // 更新显示的地区文本
      regionArray: value              // 更新地区数组（用于picker组件的value）
    });
    
    // 选择地区后重新验证表单
    this.validateForm();
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData } = this.data;
    const errors = {};
    let isValid = true;
    
    console.log('开始表单验证，当前数据：', formData); // 调试日志：打印当前表单数据
    
    // 验证收件人姓名
    if (!formData.consignee || formData.consignee.trim().length === 0) {
      errors.consignee = '请输入收件人姓名';
      isValid = false;
      console.log('姓名验证失败：为空'); // 调试日志
    } else if (formData.consignee.trim().length < 2) {
      errors.consignee = '收件人姓名至少2个字符';
      isValid = false;
      console.log('姓名验证失败：长度不足'); // 调试日志
    } else {
      console.log('姓名验证通过：', formData.consignee); // 调试日志
    }
    
    // 验证手机号码 - 放宽验证规则，支持更多号码格式
    const phoneRegex = /^1\d{10}$/; // 只要求以1开头的11位数字
    if (!formData.mobile) {
      errors.mobile = '请输入联系电话';
      isValid = false;
      console.log('手机号验证失败：为空'); // 调试日志
    } else if (!phoneRegex.test(formData.mobile)) {
      errors.mobile = '请输入11位手机号码';
      isValid = false;
      console.log('手机号验证失败：格式不正确', formData.mobile); // 调试日志
    } else {
      console.log('手机号验证通过：', formData.mobile); // 调试日志
    }
    
    // 验证地区选择
    if (!formData.region) {
      errors.region = '请选择所在地区';
      isValid = false;
      console.log('地区验证失败：未选择'); // 调试日志
    } else {
      console.log('地区验证通过：', formData.region); // 调试日志
    }
    
    // 验证详细地址
    if (!formData.detail || formData.detail.trim().length === 0) {
      errors.detail = '请输入详细地址';
      isValid = false;
      console.log('详细地址验证失败：为空'); // 调试日志
    } else if (formData.detail.trim().length < 5) {
      errors.detail = '详细地址至少5个字符';
      isValid = false;
      console.log('详细地址验证失败：长度不足'); // 调试日志
    } else {
      console.log('详细地址验证通过：', formData.detail); // 调试日志
    }
    
    console.log('表单验证完成，结果：', {
      isValid,
      errors,
      canSave: isValid
    }); // 调试日志：打印最终验证结果
    
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
      
      // 分离省市区 - 优先使用regionArray数组，确保数据准确
      const { regionArray } = this.data;
      if (regionArray && regionArray.length >= 3) {
        submitData.province = regionArray[0]; // 省份
        submitData.city = regionArray[1];     // 城市  
        submitData.district = regionArray[2]; // 区县
      } else {
        // 备用方案：从字符串中分离（支持空格或逗号分隔）
        const parts = formData.region.includes(' ') 
          ? formData.region.split(' ') 
          : formData.region.split(',');
        submitData.province = parts[0] || '';
        submitData.city = parts[1] || '';
        submitData.district = parts[2] || '';
      }
      
      console.log('提交的地址数据：', submitData); // 调试用：打印提交的完整数据
      
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