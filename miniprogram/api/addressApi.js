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
export async function getAddressList() {
  console.log('调用获取地址列表API');
  
  try {
    const response = await apiRequest('/api/user/addresses/list', {}, 'GET');
    console.log('获取地址列表API响应：', response);
    
    // 根据接口文档，响应格式为 { error: 0, body: [...], message: string, success: true }
    if (response && response.success && response.body) {
      return response.body; // 直接返回地址数组
    } else {
      console.error('获取地址列表失败：', response);
      throw new Error(response?.message || '获取地址列表失败');
    }
  } catch (error) {
    console.error('获取地址列表API调用失败：', error);
    throw error;
  }
}

/**
 * 添加新地址
 * @param {Object} addressData 地址信息
 * @param {string} addressData.consignee 收件人姓名（2-20字符）
 * @param {string} addressData.mobile 收件人手机号（11位，以1开头）
 * @param {string} addressData.region 完整地区信息（空格分隔）
 * @param {string} addressData.detail 详细地址（5-200字符）
 * @param {boolean} addressData.isDefault 是否设为默认地址（默认false）
 * @param {string} addressData.province 省份（从regionArray自动提取）
 * @param {string} addressData.city 城市（从regionArray自动提取）
 * @param {string} addressData.district 区县（从regionArray自动提取）
 * @returns {Promise} 返回添加结果
 */
export function addAddress(addressData) {
  // 调用新增地址接口，接口地址：/api/user/addresses/add，请求方式：POST
  return apiRequest('/api/user/addresses/add', addressData, 'POST');
}

/**
 * 更新地址信息
 * @param {Object} addressData 地址信息（包含id）
 * @param {number} addressData.id 地址ID（数字类型）
 * @param {string} addressData.consignee 收件人姓名（2-20字符）
 * @param {string} addressData.mobile 收件人手机号（11位，以1开头）
 * @param {string} addressData.region 完整地区信息（空格分隔）
 * @param {string} addressData.detail 详细地址（5-200字符）
 * @param {boolean} addressData.isDefault 是否设为默认地址
 * @param {string} addressData.province 省份（从regionArray自动提取）
 * @param {string} addressData.city 城市（从regionArray自动提取）
 * @param {string} addressData.district 区县（从regionArray自动提取）
 * @returns {Promise} 返回更新结果
 */
export function updateAddress(addressData) {
  // 调用编辑地址接口，接口地址：/api/user/addresses/update，请求方式：PUT
  return apiRequest('/api/user/addresses/update', addressData, 'PUT');
}

/**
 * 删除单个地址
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回删除结果
 */
export async function deleteAddress(addressId) {
  console.log('调用删除地址API，ID：', addressId);
  
  try {
    const response = await apiRequest('/api/user/addresses/delete', { addressId }, 'DELETE');
    console.log('删除地址API响应：', response);
    
    // 根据接口文档，响应格式为 { error: 0, body: {...}, message: string, success: true }
    if (response && response.success) {
      return response;
    } else {
      console.error('删除地址失败：', response);
      throw new Error(response?.message || '删除地址失败');
    }
  } catch (error) {
    console.error('删除地址API调用失败：', error);
    throw error;
  }
}

/**
 * 批量删除地址
 * @param {Array} addressIds 地址ID数组
 * @returns {Promise} 返回批量删除结果
 */
export async function batchDeleteAddress(addressIds) {
  console.log('调用批量删除地址API，IDs：', addressIds);
  
  try {
    const response = await apiRequest('/api/user/addresses/batch-delete', { addressIds }, 'DELETE');
    console.log('批量删除地址API响应：', response);
    
    // 根据接口文档，响应格式为 { error: 0, body: {...}, message: string, success: true }
    if (response && response.success) {
      return response;
    } else {
      console.error('批量删除地址失败：', response);
      throw new Error(response?.message || '批量删除地址失败');
    }
  } catch (error) {
    console.error('批量删除地址API调用失败：', error);
    throw error;
  }
}

/**
 * 设置默认地址
 * @param {number} addressId 地址ID
 * @returns {Promise} 返回设置结果
 */
export async function setDefaultAddress(addressId) {
  console.log('调用设置默认地址API，ID：', addressId);
  
  try {
    const response = await apiRequest('/api/user/addresses/set-default', { addressId }, 'POST');
    console.log('设置默认地址API响应：', response);
    
    // 根据接口文档，响应格式为 { error: 0, body: {...}, message: string, success: true }
    if (response && response.success) {
      return response;
    } else {
      console.error('设置默认地址失败：', response);
      throw new Error(response?.message || '设置默认地址失败');
    }
  } catch (error) {
    console.error('设置默认地址API调用失败：', error);
    throw error;
  }
}

/**
 * 根据ID获取地址详情
 * @param {number} addressId 地址ID（数字类型）
 * @returns {Promise} 返回地址详情
 * 响应格式：{
 *   error: 0,
 *   body: {
 *     address: {
 *       id: number,
 *       consignee: string,
 *       mobile: string,
 *       region: string, // 支持逗号或空格分隔
 *       detail: string,
 *       isDefault: boolean
 *     }
 *   },
 *   message: string,
 *   success: boolean
 * }
 */
export function getAddressDetail(addressId) {
  // 调用获取地址详情接口，接口地址：/api/user/addresses/detail，请求方式：GET
  return apiRequest('/api/user/addresses/detail', { addressId }, 'GET');
}