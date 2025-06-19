// 订单相关API接口
import { apiRequest } from './utils/request';

/**
 * 订单API接口模块
 * 包含订单创建、查询、支付等相关功能
 */

/**
 * 创建订单接口
 * @param {Object} orderData 订单数据
 * @param {Array} orderData.goods 商品列表
 * @param {Object} orderData.address 收货地址信息
 * @param {Object} orderData.coupon 优惠券信息
 * @param {String} orderData.remark 订单备注
 * @param {Object} orderData.amounts 金额信息
 * @returns {Promise} 返回订单创建结果
 */
export function createOrder(orderData) {
  console.log('调用创建订单接口，参数：', orderData);
  
  return apiRequest('/api/order/create', {
    goods: orderData.goods,
    addressId: orderData.address.id,
    couponId: orderData.coupon ? orderData.coupon.id : null,
    remark: orderData.remark || '',
    totalAmount: orderData.amounts.finalAmount
  }, 'POST');
}

/**
 * 获取订单详情
 * @param {String} orderId 订单ID
 * @returns {Promise} 返回订单详情
 */
export function getOrderDetail(orderId) {
  console.log('获取订单详情，订单ID：', orderId);
  
  return apiRequest('/api/order/detail', {
    orderId: orderId
  }, 'GET');
}

/**
 * 获取用户订单列表
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码，默认1
 * @param {Number} params.pageSize 每页数量，默认10
 * @param {String} params.status 订单状态筛选
 * @returns {Promise} 返回订单列表
 */
export function getOrderList(params = {}) {
  const { page = 1, pageSize = 10, status = '' } = params;
  
  console.log('获取订单列表，参数：', { page, pageSize, status });
  
  return apiRequest('/api/order/list', {
    page: page,
    pageSize: pageSize,
    status: status
  }, 'GET');
}

/**
 * 取消订单
 * @param {String} orderId 订单ID
 * @param {String} reason 取消原因
 * @returns {Promise} 返回取消结果
 */
export function cancelOrder(orderId, reason = '') {
  console.log('取消订单，订单ID：', orderId, '原因：', reason);
  
  return apiRequest('/api/order/cancel', {
    orderId: orderId,
    reason: reason
  }, 'POST');
}

/**
 * 确认收货
 * @param {String} orderId 订单ID
 * @returns {Promise} 返回确认收货结果
 */
export function confirmReceive(orderId) {
  console.log('确认收货，订单ID：', orderId);
  
  return apiRequest('/api/order/confirm-receive', {
    orderId: orderId
  }, 'POST');
}

/**
 * 申请退款
 * @param {String} orderId 订单ID
 * @param {String} reason 退款原因
 * @param {Array} images 图片证明（可选）
 * @returns {Promise} 返回退款申请结果
 */
export function requestRefund(orderId, reason, images = []) {
  console.log('申请退款，订单ID：', orderId, '原因：', reason);
  
  return apiRequest('/api/order/refund', {
    orderId: orderId,
    reason: reason,
    images: images
  }, 'POST');
}

/**
 * 获取物流信息
 * @param {String} orderId 订单ID
 * @returns {Promise} 返回物流信息
 */
export function getLogistics(orderId) {
  console.log('获取物流信息，订单ID：', orderId);
  
  return apiRequest('/api/order/logistics', {
    orderId: orderId
  }, 'GET');
}

/**
 * 计算订单金额（下单前预计算）
 * @param {Object} params 计算参数
 * @param {Array} params.goods 商品列表
 * @param {String} params.addressId 地址ID
 * @param {String} params.couponId 优惠券ID（可选）
 * @returns {Promise} 返回计算结果
 */
export function calculateOrderAmount(params) {
  console.log('计算订单金额，参数：', params);
  
  return apiRequest('/api/order/calculate', {
    goods: params.goods,
    addressId: params.addressId,
    couponId: params.couponId || null
  }, 'POST');
}

/**
 * 检查商品库存（下单前检查）
 * @param {Array} goods 商品列表，包含商品ID和数量
 * @returns {Promise} 返回库存检查结果
 */
export function checkStock(goods) {
  console.log('检查商品库存，商品：', goods);
  
  return apiRequest('/api/order/check-stock', {
    goods: goods
  }, 'POST');
} 