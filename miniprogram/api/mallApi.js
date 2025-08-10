// 商城相关的API接口文件
// 引入通用请求函数
const { apiRequest } = require('./utils/request');

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
    console.log('🚀 [mallApi] 调用获取秒杀商品接口');
    console.log('🚀 [mallApi] 请求地址:', '/api/mall/seckill');
    
    return apiRequest('/api/mall/seckill', {}, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 获取秒杀商品成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 获取秒杀商品失败:', error);
        throw error;
      });
  },

  /**
   * 获取轮播Banner列表
   * @returns {Promise} 返回Banner数据
   */
  getBannerList() {
    console.log('🚀 [mallApi] 调用获取Banner列表接口');
    console.log('🚀 [mallApi] 请求地址:', '/api/mall/banners');
    
    return apiRequest('/api/mall/banners', {}, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 获取Banner数据成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 获取Banner数据失败:', error);
        throw error;
      });
  },

  /**
   * 获取商品分组数据
   * @returns {Promise} 返回商品分组数据
   */
  getProductGroups() {
    console.log('🚀 [mallApi] 调用获取商品分组接口');
    console.log('🚀 [mallApi] 请求地址:', '/api/mall/product-groups');
    
    return apiRequest('/api/mall/product-groups', {}, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 获取商品分组数据成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 获取商品分组数据失败:', error);
        throw error;
      });
  },

  /**
   * 搜索商品
   * @param {object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词（必填）
   * @returns {Promise} 返回搜索结果
   */
  searchProducts(params) {
    const { keyword } = params;
    if (!keyword) {
      console.error('❌ [mallApi] 搜索关键词不能为空');
      return Promise.reject(new Error('搜索关键词不能为空'));
    }
    
    console.log('🚀 [mallApi] 调用商品搜索接口，参数：', params);
    console.log('🚀 [mallApi] 请求地址:', '/api/mall/search');
    
    return apiRequest('/api/mall/search', { keyword }, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 搜索商品成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 搜索商品失败:', error);
        throw error;
      });
  },

  /**
   * 获取购物车商品数量
   * @returns {Promise} 返回购物车商品数量
   */
  getCartCount() {
    console.log('🚀 [mallApi] 调用获取购物车数量接口');
    console.log('🚀 [mallApi] 请求地址:', '/api/mall/cart/count');
    
    return apiRequest('/api/mall/cart/count', {}, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 获取购物车数量成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 获取购物车数量失败:', error);
        throw error;
      });
  },

  /**
   * 获取秒杀页面数据
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认20
   * @param {string} params.brand - 品牌筛选
   * @param {string} params.sortBy - 排序方式
   * @returns {Promise} 返回秒杀页面数据
   */
  getSeckillPageData(params = {}) {
    console.log('🚀 [mallApi] 调用获取秒杀页面数据接口，参数：', params);
    console.log('🚀 [mallApi] 请求地址:', '/api/mall/seckill/page');
    
    return apiRequest('/api/mall/seckill/page', {
      page: 1,
      pageSize: 20,
      brand: '',
      sortBy: 'price_asc',
      ...params
    }, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 获取秒杀页面数据成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 获取秒杀页面数据失败:', error);
        throw error;
      });
  },

  /**
   * 获取活动列表
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码，默认1
   * @param {number} params.pageSize - 每页数量，默认10
   * @param {string} params.status - 活动状态筛选（默认ongoing）
   * @returns {Promise} 返回活动列表数据
   */
  getActivityList(params = {}) {
    console.log('🚀 [mallApi] 调用获取活动列表接口，参数：', params);
    console.log('🚀 [mallApi] 请求地址:', '/api/activities/list');
    
    return apiRequest('/api/activities/list', {
      page: 1,
      pageSize: 10,
      status: 'ongoing',
      ...params
    }, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 获取活动列表成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 获取活动列表失败:', error);
        throw error;
      });
  },

  /**
   * 获取热门活动
   * @param {object} params - 查询参数
   * @param {number} params.limit - 限制数量，默认3
   * @returns {Promise} 返回热门活动数据
   */
  getHotActivities(params = {}) {
    console.log('🚀 [mallApi] 调用获取热门活动接口，参数：', params);
    console.log('🚀 [mallApi] 请求地址:', '/api/activities/hot');
    
    return apiRequest('/api/activities/hot', {
      limit: 3,
      ...params
    }, 'GET')
      .then(data => {
        console.log('✅ [mallApi] 获取热门活动成功:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ [mallApi] 获取热门活动失败:', error);
        throw error;
      });
  }
};

// 导出商城API模块
module.exports = mallApi; 