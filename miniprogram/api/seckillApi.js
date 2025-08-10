// 秒杀相关API接口
import { apiRequest } from './utils/request';

/**
 * 秒杀API接口模块
 * 包含秒杀商品列表、立即购买、购物车数量等功能
 */

/**
 * 获取秒杀商品列表
 * @param {Object} params 请求参数
 * @param {Number} params.page 页码（可选，默认1）
 * @param {Number} params.pageSize 每页数量（可选，默认20）
 * @param {String} params.brand 品牌筛选（可选，all全部/beta倍特爱/lining李宁等）
 * @param {String} params.keyword 搜索关键词（可选）
 * @returns {Promise} 返回秒杀商品列表数据
 */
export function getSeckillProducts(params) {
  console.log('获取秒杀商品列表，参数：', params);
  
  // 构建查询参数，过滤掉空值
  const queryParams = new URLSearchParams();
  
  if (params.page) {
    queryParams.append('page', params.page.toString());
  }
  
  if (params.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }
  
  if (params.brand && params.brand !== 'all') {
    queryParams.append('brand', params.brand);
  }
  
  if (params.keyword && params.keyword.trim()) {
    queryParams.append('keyword', params.keyword.trim());
  }
  
  const url = queryParams.toString() ? 
    `/api/seckill/products?${queryParams.toString()}` : 
    '/api/seckill/products';
  
  return apiRequest(url, {}, 'GET');
}

/**
 * 秒杀商品立即购买
 * @param {Object} params 购买参数
 * @param {Number} params.productId 商品ID
 * @param {Number} params.quantity 购买数量（通常为1）
 * @returns {Promise} 返回购买结果数据
 */
export function seckillBuyNow(params) {
  console.log('秒杀商品立即购买，参数：', params);
  
  return apiRequest('/api/seckill/buy-now', {
    productId: params.productId,
    quantity: params.quantity || 1
  }, 'POST');
}

/**
 * 获取购物车商品数量
 * @returns {Promise} 返回购物车数量数据
 */
export function getCartCount() {
  console.log('获取购物车商品数量');
  
  return apiRequest('/api/cart/count', {}, 'GET');
}