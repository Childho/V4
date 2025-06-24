/**
 * 地址管理相关接口
 * 包含地址的增删改查等功能
 */
import { apiRequest } from './utils/request.js';

// 测试静态地址数据 - 用于前端开发效果展示
const mockAddressList = [
  {
    id: 1,
    consignee: '张小明',
    mobile: '13800138001',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    region: '广东省 深圳市 南山区',
    detail: '科技园南区深南大道9988号腾讯大厦35层3501室',
    isDefault: true,
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    consignee: '李小红',
    mobile: '13911223344',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    region: '北京市 北京市 朝阳区',
    detail: '望京SOHO T1座 10层1008室，靠近望京地铁站A口',
    isDefault: false,
    createTime: '2024-01-20 14:20:00'
  },
  {
    id: 3,
    consignee: '王大伟',
    mobile: '15512345678',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    region: '上海市 上海市 浦东新区',
    detail: '陆家嘴金融贸易区世纪大道88号金茂大厦22层2201室',
    isDefault: false,
    createTime: '2024-01-25 09:15:00'
  },
  {
    id: 4,
    consignee: '刘美丽',
    mobile: '18866778899',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    region: '浙江省 杭州市 西湖区',
    detail: '文三路259号昌地火炬大厦1号楼17层1703室，近地铁2号线',
    isDefault: false,
    createTime: '2024-02-01 16:45:00'
  },
  {
    id: 5,
    consignee: '陈小强',
    mobile: '17712345678',
    province: '江苏省',
    city: '南京市',
    district: '鼓楼区',
    region: '江苏省 南京市 鼓楼区',
    detail: '中央路323号利奥大厦6层608室',
    isDefault: false,
    createTime: '2024-02-05 11:30:00'
  }
];

/**
 * 获取用户地址列表
 * @returns {Promise} 返回地址列表数据
 */
export function getAddressList() {
  // 模拟异步请求，返回测试数据
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('模拟获取地址列表成功');
      resolve([...mockAddressList]); // 返回拷贝的数据，避免直接修改原数组
    }, 500); // 模拟网络延迟
  });
  
  // 真实项目中使用以下代码：
  // return apiRequest('/api/address/list', {}, 'POST');
}

/**
 * 添加新地址
 * @param {Object} addressData 地址信息
 * @param {string} addressData.name 收件人姓名
 * @param {string} addressData.phone 收件人电话
 * @param {string} addressData.province 省份
 * @param {string} addressData.city 城市
 * @param {string} addressData.district 区县
 * @param {string} addressData.detail 详细地址
 * @param {boolean} addressData.isDefault 是否为默认地址
 * @returns {Promise} 返回添加结果
 */
export function addAddress(addressData) {
  return apiRequest('/api/address/add', addressData, 'POST');
}

/**
 * 更新地址信息
 * @param {Object} addressData 地址信息（包含id）
 * @returns {Promise} 返回更新结果
 */
export function updateAddress(addressData) {
  return apiRequest('/api/address/update', addressData, 'POST');
}

/**
 * 删除单个地址
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回删除结果
 */
export function deleteAddress(addressId) {
  // 模拟删除操作
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockAddressList.findIndex(item => item.id === addressId);
      if (index !== -1) {
        mockAddressList.splice(index, 1); // 从数组中删除
        console.log(`模拟删除地址成功，ID: ${addressId}`);
        resolve({ success: true, message: '删除成功' });
      } else {
        console.error(`地址不存在，ID: ${addressId}`);
        reject({ success: false, message: '地址不存在' });
      }
    }, 300); // 模拟网络延迟
  });
  
  // 真实项目中使用以下代码：
  // return apiRequest('/api/address/delete', { id: addressId }, 'POST');
}

/**
 * 批量删除地址
 * @param {Array} addressIds 地址ID数组
 * @returns {Promise} 返回批量删除结果
 */
export function batchDeleteAddress(addressIds) {
  // 模拟批量删除操作
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let deletedCount = 0;
      addressIds.forEach(id => {
        const index = mockAddressList.findIndex(item => item.id === id);
        if (index !== -1) {
          mockAddressList.splice(index, 1);
          deletedCount++;
        }
      });
      
      if (deletedCount > 0) {
        console.log(`模拟批量删除地址成功，删除了 ${deletedCount} 个地址`);
        resolve({ success: true, message: `删除了 ${deletedCount} 个地址`, deletedCount });
      } else {
        console.error('没有找到要删除的地址');
        reject({ success: false, message: '没有找到要删除的地址' });
      }
    }, 500); // 模拟网络延迟
  });
  
  // 真实项目中使用以下代码：
  // return apiRequest('/api/address/batchDelete', { ids: addressIds }, 'POST');
}

/**
 * 设置默认地址
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回设置结果
 */
export function setDefaultAddress(addressId) {
  // 模拟设置默认地址操作
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const targetAddress = mockAddressList.find(item => item.id === addressId);
      
      if (targetAddress) {
        // 先取消所有地址的默认状态
        mockAddressList.forEach(item => {
          item.isDefault = false;
        });
        
        // 设置目标地址为默认
        targetAddress.isDefault = true;
        
        console.log(`模拟设置默认地址成功，ID: ${addressId}`);
        resolve({ success: true, message: '设置默认地址成功' });
      } else {
        console.error(`地址不存在，ID: ${addressId}`);
        reject({ success: false, message: '地址不存在' });
      }
    }, 300); // 模拟网络延迟
  });
  
  // 真实项目中使用以下代码：
  // return apiRequest('/api/address/setDefault', { id: addressId }, 'POST');
}

/**
 * 根据ID获取地址详情
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回地址详情
 */
export function getAddressDetail(addressId) {
  return apiRequest('/api/address/detail', { id: addressId }, 'POST');
} 