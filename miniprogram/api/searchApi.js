// 搜索相关API接口
// 引入通用请求函数
const { api } = require('./utils/request');

/**
 * 搜索商品
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.categoryId - 分类ID，可选
 * @param {string} params.sortType - 排序类型：sales(销量) / price(价格)
 * @param {Array} params.brandIds - 品牌ID数组，可选
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 * @returns {Promise} 返回搜索结果
 */
function searchProducts(params) {
  const {
    keyword = '',
    categoryId = 0,
    sortType = 'sales',
    brandIds = [],
    page = 1,
    pageSize = 10
  } = params;
  
  return api.post('/api/search/products', {
    keyword,
    categoryId,
    sortType,
    brandIds,
    page,
    pageSize
  });
}

/**
 * 获取商品分类列表
 * @returns {Promise} 返回分类数据
 */
function getCategories() {
  return api.post('/api/search/categories', {});
}

/**
 * 获取品牌列表
 * @param {number} categoryId - 分类ID，可选
 * @returns {Promise} 返回品牌数据
 */
function getBrands(categoryId = 0) {
  return api.post('/api/search/brands', { categoryId });
}

/**
 * 获取搜索建议（搜索联想）
 * @param {string} keyword - 搜索关键词
 * @returns {Promise} 返回搜索建议
 */
function getSearchSuggestions(keyword) {
  return api.post('/api/search/suggestions', { keyword });
}

// 导出函数
module.exports = {
  searchProducts,
  getCategories,
  getBrands,
  getSearchSuggestions
}; 