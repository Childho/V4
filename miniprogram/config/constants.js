// 常量配置文件
const API_CONSTANTS = {
  // API响应状态码
  SUCCESS_CODE: 0,      // 成功状态码
  UNAUTHORIZED: 401,    // 未授权状态码
  
  // API响应字段名
  RESPONSE_FIELDS: {
    ERROR: 'error',
    SUCCESS: 'success', 
    MESSAGE: 'message',
    BODY: 'body'
  },
  
  // 轮播图相关常量
  BANNER: {
    TYPE_ACTIVITY: 'activity',  // 活动类型轮播图
    TYPE_PRODUCT: 'product'     // 商品类型轮播图
  },
  
  // 搜索相关常量
  SEARCH: {
    TYPE_PRODUCT: 'product',    // 商品搜索类型
    DEFAULT_PAGE: 1,            // 默认页码
    DEFAULT_PAGE_SIZE: 10,      // 默认每页数量
    DEFAULT_SORT: 'relevance'   // 默认排序方式
  },
  
  // 客服统计相关常量
  CUSTOMER_SERVICE: {
    ACTION_START: 'contact_start',  // 客服联系开始动作
    SOURCE_INDEX: '首页导航'         // 来源：首页导航
  },
  
  // 加载状态字段名
  LOADING_FIELDS: {
    BANNERS: 'isLoading.banners',
    ACTIVITIES: 'isLoading.activities',
    FEATURED_EQUIPMENT: 'isLoading.featuredEquipment',
    USER_INFO: 'isLoading.userInfo'
  },
  
  // 本地存储键名
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER_ID: 'userId'
  }
}

// 导出常量
module.exports = {
  API_CONSTANTS
} 