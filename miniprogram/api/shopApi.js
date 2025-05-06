import { api } from './utils/request'

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @param {string} [params.category] - 商品分类
 * @returns {Promise<Object>} 商品列表及分页信息
 */
export const getProductList = (params = {}) => {
  return api.post('/api/shop/products', params)
}

/**
 * 获取商品详情
 * @param {Object} params - 查询参数
 * @param {string} params.id - 商品ID
 * @returns {Promise<Object>} 商品详情信息
 */
export const getProductDetail = (params) => {
  return api.post('/api/shop/product/detail', params)
}

/**
 * 兑换商品
 * @param {Object} params - 兑换参数
 * @param {string} params.productId - 商品ID
 * @param {number} params.quantity - 兑换数量
 * @returns {Promise<Object>} 兑换结果
 */
export const exchangeProduct = (params) => {
  return api.post('/api/shop/exchange', params)
}

/**
 * 获取我的订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @param {string} [params.status] - 订单状态
 * @returns {Promise<Object>} 订单列表及分页信息
 */
export const getMyOrders = (params = {}) => {
  return api.post('/api/shop/orders', params)
} 