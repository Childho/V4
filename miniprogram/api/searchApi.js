// 搜索相关API接口
import { apiRequest } from './utils/request';

/**
 * 搜索API接口模块
 * 包含商品搜索、分类获取、品牌获取等功能
 */

/**
 * 商品综合搜索
 * @param {Object} params 搜索参数
 * @param {String} params.keyword 搜索关键词（可选）
 * @param {Number} params.categoryId 分类ID（可选，0表示全部）
 * @param {Array} params.brandIds 品牌ID数组（可选）
 * @param {String} params.sortType 排序类型：sales销量/price价格（可选，默认sales）
 * @param {String} params.sortDirection 排序方向：desc降序/asc升序（可选，默认desc）
 * @param {Number} params.page 页码（可选，默认1）
 * @param {Number} params.pageSize 每页数量（可选，默认10）
 * @returns {Promise} 返回搜索结果数据
 */
export function searchProducts(params) {
  console.log('商品综合搜索，参数：', params);
  
  // 构建查询参数，过滤掉空值
  const queryParams = new URLSearchParams();
  
  if (params.keyword) {
    queryParams.append('keyword', params.keyword);
  }
  
  if (params.categoryId !== undefined && params.categoryId !== 0) {
    queryParams.append('categoryId', params.categoryId.toString());
  }
  
  if (params.brandIds && params.brandIds.length > 0) {
    // 将品牌ID数组转换为逗号分隔的字符串
    queryParams.append('brandIds', params.brandIds.join(','));
  }
  
  if (params.sortType) {
    queryParams.append('sortType', params.sortType);
  }
  
  if (params.sortDirection) {
    queryParams.append('sortDirection', params.sortDirection);
  }
  
  queryParams.append('page', (params.page || 1).toString());
  queryParams.append('pageSize', (params.pageSize || 10).toString());
  
  const url = `/api/products/search?${queryParams.toString()}`;
  
  return apiRequest(url, {}, 'GET');
}

/**
 * 获取商品分类列表
 * @returns {Promise} 返回分类列表数据
 */
export function getCategories() {
  console.log('获取商品分类列表');
  
  return apiRequest('/api/products/categories', {}, 'GET');
}

/**
 * 获取品牌筛选数据
 * @returns {Promise} 返回品牌列表数据
 */
export function getBrands() {
  console.log('获取品牌筛选数据');
  
  return apiRequest('/api/products/brands', {}, 'GET');
}

/**
 * 获取商品详情（用于跳转商品详情页）
 * @param {Number} productId 商品ID
 * @returns {Promise} 返回商品详情数据
 */
export function getProductDetail(productId) {
  console.log('获取商品详情，商品ID：', productId);
  
  return apiRequest('/api/products/detail', { id: productId }, 'GET');
}