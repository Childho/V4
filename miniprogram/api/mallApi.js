// 商城相关的API接口文件
// 引入通用请求函数（需要根据项目实际情况调整路径）
const { apiRequest } = require('./request');

/**
 * 商城API接口集合
 * 包含商城页面所需的所有接口调用方法
 */
const mallApi = {
  
  /**
   * 获取秒杀商品列表
   * @returns {Promise} 返回秒杀商品数据
   */
  getSeckillProducts() {
    console.log('调用获取秒杀商品接口');
    return apiRequest('/api/mall/seckill/products', {});
  },

  /**
   * 获取轮播Banner列表
   * @returns {Promise} 返回Banner数据
   */
  getBannerList() {
    console.log('调用获取Banner列表接口');
    return apiRequest('/api/mall/banners', {});
  },

  /**
   * 获取商品分组数据
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @returns {Promise} 返回商品分组数据
   */
  getProductGroups(params = {}) {
    console.log('调用获取商品分组接口，参数：', params);
    return apiRequest('/api/mall/product-groups', {
      page: 1,
      pageSize: 10,
      ...params
    });
  },

  /**
   * 搜索商品
   * @param {object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认20
   * @param {string} params.sortBy - 排序方式，默认'default'
   * @returns {Promise} 返回搜索结果
   */
  searchProducts(params) {
    console.log('调用商品搜索接口，参数：', params);
    return apiRequest('/api/mall/search', {
      page: 1,
      pageSize: 20,
      sortBy: 'default',
      ...params
    });
  },

  /**
   * 根据分类获取商品列表
   * @param {object} params - 查询参数
   * @param {string} params.categoryId - 分类ID
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认20
   * @param {string} params.sortBy - 排序方式
   * @returns {Promise} 返回商品列表
   */
  getProductsByCategory(params) {
    console.log('调用根据分类获取商品接口，参数：', params);
    return apiRequest('/api/mall/products/category', {
      page: 1,
      pageSize: 20,
      ...params
    });
  },

  /**
   * 获取商品详情
   * @param {number} productId - 商品ID
   * @returns {Promise} 返回商品详情
   */
  getProductDetail(productId) {
    console.log('调用获取商品详情接口，商品ID：', productId);
    return apiRequest('/api/mall/product/detail', { 
      productId 
    });
  },

  /**
   * 获取购物车商品数量
   * @returns {Promise} 返回购物车商品数量
   */
  getCartCount() {
    console.log('调用获取购物车数量接口');
    return apiRequest('/api/mall/cart/count', {});
  },

  /**
   * 添加商品到购物车
   * @param {object} params - 添加参数
   * @param {number} params.productId - 商品ID
   * @param {number} params.quantity - 数量，默认1
   * @param {string} params.specification - 商品规格（可选）
   * @returns {Promise} 返回添加结果
   */
  addToCart(params) {
    console.log('调用添加到购物车接口，参数：', params);
    return apiRequest('/api/mall/cart/add', {
      quantity: 1,
      ...params
    });
  }
};

// 导出商城API模块
module.exports = mallApi; 