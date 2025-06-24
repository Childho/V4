// 商品相关API接口
import { apiRequest } from './request';

/**
 * 商品详情信息接口
 * @param {string} productId - 商品ID
 * @returns {Promise<Object>} 商品详情数据
 */
export function getProductDetail(productId) {
  return apiRequest('/api/product/detail', {
    productId
  });
}

/**
 * 获取商品评论列表
 * @param {string} productId - 商品ID
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页数量，默认10
 * @returns {Promise<Object>} 评论列表数据
 */
export function getProductComments(productId, page = 1, pageSize = 10) {
  return apiRequest('/api/product/comments', {
    productId,
    page,
    pageSize
  });
}

/**
 * 获取相关推荐商品
 * @param {string} productId - 商品ID
 * @returns {Promise<Array>} 相关商品列表
 */
export function getRelatedProducts(productId) {
  return apiRequest('/api/product/related', {
    productId
  });
}

/**
 * 添加到购物车
 * @param {Object} params - 购物车参数
 * @param {string} params.productId - 商品ID
 * @param {number} params.quantity - 数量
 * @param {Object} params.specs - 选择的规格
 * @returns {Promise<Object>} 添加结果
 */
export function addToCart(params) {
  return apiRequest('/api/cart/add', params);
}

/**
 * 收藏/取消收藏商品
 * @param {string} productId - 商品ID
 * @param {boolean} isFavorite - 是否收藏
 * @returns {Promise<Object>} 操作结果
 */
export function toggleFavorite(productId, isFavorite) {
  return apiRequest('/api/product/favorite', {
    productId,
    action: isFavorite ? 'remove' : 'add'
  });
}

/**
 * 获取购物车数量
 * @returns {Promise<number>} 购物车商品数量
 */
export function getCartCount() {
  return apiRequest('/api/cart/count', {});
}

/**
 * 立即购买（跳转到订单确认页）
 * @param {Object} params - 购买参数
 * @returns {Promise<Object>} 订单预览数据
 */
export function buyNow(params) {
  return apiRequest('/api/order/preview', params);
} 