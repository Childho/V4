// 商品相关API接口
import { apiRequest } from './utils/request';

/**
 * 商品详情信息接口
 * @param {string} productId - 商品ID
 * @returns {Promise<Object>} 商品详情数据
 */
export function getProductDetail(productId) {
  console.log('获取商品详情，商品ID：', productId);
  
  return apiRequest('/api/products/detail', {
    productId
  }, 'GET');
}

/**
 * 获取商品评论列表
 * @param {string} productId - 商品ID
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页数量，默认10
 * @param {string} filter - 筛选类型（all/withImage/positive/negative）
 * @returns {Promise<Object>} 评论列表数据
 */
export function getProductComments(productId, page = 1, pageSize = 10, filter = 'all') {
  console.log('获取商品评论，参数：', { productId, page, pageSize, filter });
  
  return apiRequest('/api/products/comments', {
    productId,
    page,
    pageSize,
    filter
  }, 'GET');
}

/**
 * 获取相关推荐商品
 * @param {string} productId - 商品ID
 * @param {number} limit - 推荐数量限制，默认10
 * @returns {Promise<Array>} 相关商品列表
 */
export function getRelatedProducts(productId, limit = 10) {
  console.log('获取相关推荐商品，商品ID：', productId, '限制数量：', limit);
  
  return apiRequest('/api/products/related', {
    productId,
    limit
  }, 'GET');
}

/**
 * 添加到购物车
 * @param {Object} params - 购物车参数
 * @param {string} params.productId - 商品ID
 * @param {number} params.quantity - 数量
 * @param {Object} params.specs - 选择的规格
 * @param {string} params.remark - 备注信息
 * @returns {Promise<Object>} 添加结果
 */
export function addToCart(params) {
  console.log('添加到购物车，参数：', params);
  
  return apiRequest('/api/cart/add', {
    productId: params.productId,
    quantity: params.quantity,
    specs: params.specs,
    remark: params.remark || ''
  }, 'POST');
}

/**
 * 获取购物车数量
 * @returns {Promise<number>} 购物车商品数量
 */
export function getCartCount() {
  console.log('获取购物车数量');
  
  return apiRequest('/api/cart/count', {}, 'GET');
}

/**
 * 立即购买（获取订单预览信息）
 * @param {Object} params - 购买参数
 * @param {string} params.productId - 商品ID
 * @param {number} params.quantity - 购买数量
 * @param {Object} params.specs - 选择的规格
 * @param {string} params.remark - 订单备注
 * @returns {Promise<Object>} 订单预览数据
 */
export function buyNow(params) {
  console.log('立即购买，参数：', params);
  
  return apiRequest('/api/orders/buy-now', {
    productId: params.productId,
    quantity: params.quantity,
    specs: params.specs,
    remark: params.remark || ''
  }, 'POST');
} 