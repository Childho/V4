// 订单相关API接口
import { apiRequest } from './utils/request';

/**
 * 订单API接口模块
 * 包含订单创建、查询、支付等相关功能
 */

/**
 * 获取订单预览信息
 * @param {Object} params 请求参数
 * @param {Array} params.goods 商品列表 [{ id: 1, quantity: 1 }]
 * @param {String} params.source 来源（cart购物车/detail商品详情）
 * @returns {Promise} 返回订单预览数据
 */
export function getOrderPreview(params) {
  console.log('获取订单预览信息，参数：', params);
  
  return apiRequest('/api/orders/preview', {
    goods: params.goods,
    source: params.source || 'cart'
  }, 'POST');
}

/**
 * 检查商品库存
 * @param {Array} goods 商品列表 [{ goodsId: 1, quantity: 1 }]
 * @returns {Promise} 返回库存检查结果
 */
export function checkStock(goods) {
  console.log('检查商品库存，商品：', goods);
  
  return apiRequest('/api/goods/check-stock', {
    goods: goods
  }, 'POST');
}

/**
 * 计算订单金额
 * @param {Object} params 计算参数
 * @param {Array} params.goods 商品列表 [{ goodsId: "goods_001", quantity: 1, price: 15.00 }]
 * @param {String} params.addressId 地址ID
 * @param {String} params.couponId 优惠券ID（可选）
 * @returns {Promise} 返回计算结果
 */
export function calculateOrderAmount(params) {
  console.log('计算订单金额，参数：', params);
  
  return apiRequest('/api/orders/calculate-amount', {
    goods: params.goods,
    addressId: params.addressId,
    couponId: params.couponId || null
  }, 'POST');
}

/**
 * 获取用户默认收货地址
 * @returns {Promise} 返回默认地址信息
 */
export function getUserDefaultAddress() {
  console.log('获取用户默认收货地址');
  
  return apiRequest('/api/user/address/default', {}, 'GET');
}

/**
 * 获取可用优惠券数量
 * @param {Object} params 查询参数
 * @param {Number} params.orderAmount 订单商品总金额
 * @param {Array} params.goodsIds 商品ID列表
 * @returns {Promise} 返回可用优惠券数量
 */
export function getAvailableCoupons(params) {
  console.log('获取可用优惠券数量，参数：', params);
  
  return apiRequest('/api/user/coupons/available', {
    orderAmount: params.orderAmount,
    goodsIds: params.goodsIds
  }, 'GET');
}

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
  
  return apiRequest('/api/orders/create', {
    goods: orderData.goods,
    address: orderData.address,
    coupon: orderData.coupon || null,
    remark: orderData.remark || '',
    amounts: orderData.amounts
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
 * 订单支付
 * @param {String} orderId 订单ID
 * @param {String} paymentMethod 支付方式（默认wechat）
 * @returns {Promise} 返回支付参数
 */
export function payOrder(orderId, paymentMethod = 'wechat') {
  console.log('订单支付，订单ID：', orderId, '支付方式：', paymentMethod);
  
  return apiRequest('/api/order/pay', {
    orderId: orderId,
    paymentMethod: paymentMethod
  }, 'POST');
}

/**
 * 催发货
 * @param {String} orderId 订单ID
 * @returns {Promise} 返回催发货结果
 */
export function urgeShipping(orderId) {
  console.log('催发货，订单ID：', orderId);
  
  return apiRequest('/api/order/urge-shipping', {
    orderId: orderId
  }, 'POST');
}

/**
 * 删除订单
 * @param {String} orderId 订单ID
 * @returns {Promise} 返回删除结果
 */
export function deleteOrder(orderId) {
  console.log('删除订单，订单ID：', orderId);
  
  return apiRequest('/api/order/delete', {
    orderId: orderId
  }, 'DELETE');
}

/**
 * 获取物流信息
 * @param {String} orderId 订单ID
 * @returns {Promise} 返回物流信息
 */
export function getOrderLogistics(orderId) {
  console.log('获取物流信息，订单ID：', orderId);
  
  return apiRequest('/api/order/logistics', {
    orderId: orderId
  }, 'GET');
} 