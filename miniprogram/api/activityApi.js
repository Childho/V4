const { request, api } = require('./utils/request');

/**
 * 获取活动列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码（默认1）
 * @param {number} params.pageSize 每页数量（默认10）
 * @param {string} params.status 活动状态筛选（默认all）：all-全部，ongoing-进行中，coming-即将开始，finished-已结束
 * @param {string} params.searchKeyword 搜索关键词
 * @returns {Promise} 返回活动列表及分页信息
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   activities: ActivityItem[], // 活动列表
 *   pagination: {               // 分页信息
 *     page: number,             // 当前页码
 *     pageSize: number,         // 每页数量
 *     hasMore: boolean,         // 是否有更多数据
 *     loading: boolean          // 加载状态
 *   }
 * }
 */
function getActivityList(params = {}) {
  // 设置默认值，确保参数完整性
  const requestParams = {
    page: 1,
    pageSize: 10,
    status: 'all',
    searchKeyword: '',
    ...params
  };
  
  // 调用通用请求函数，使用GET方法
  return api.get('/api/activities/list', requestParams);
}

/**
 * 搜索活动
 * @param {Object} params 搜索参数
 * @param {string} params.searchKeyword 搜索关键词（必填）
 * @param {number} params.page 页码（默认1，搜索时重置为1）
 * @param {number} params.pageSize 每页数量（默认10）
 * @param {string} params.status 活动状态筛选（默认all）
 * @returns {Promise} 返回搜索结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   activities: ActivityItem[], // 搜索结果活动列表
 *   pagination: {               // 分页信息
 *     page: number,
 *     pageSize: number,
 *     hasMore: boolean,
 *     loading: boolean
 *   },
 *   searchSummary: {            // 搜索汇总信息
 *     searchKeyword: string,    // 搜索关键词
 *     totalMatched: number,     // 匹配到的活动总数
 *     searchTime: number        // 搜索耗时（毫秒）
 *   }
 * }
 */
function searchActivities(params) {
  // 设置默认值
  const requestParams = {
    page: 1,
    pageSize: 10,
    status: 'all',
    ...params
  };
  
  // 调用通用请求函数，使用GET方法
  return api.get('/api/activities/search', requestParams);
}

/**
 * 获取活动状态统计
 * @returns {Promise} 返回活动状态统计数据
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   stats: {
 *     all: number,      // 全部活动数量
 *     ongoing: number,  // 进行中活动数量
 *     coming: number,   // 即将开始活动数量
 *     finished: number  // 已结束活动数量
 *   },
 *   lastUpdated: string // 最后更新时间
 * }
 */
function getActivityStats() {
  return api.get('/api/activities/stats', {});
}

/**
 * 获取活动详情
 * @param {string} activityId 活动ID
 * @returns {Promise} 返回活动详情信息
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   id: string,           // 活动唯一ID
 *   title: string,        // 活动标题
 *   description: string,  // 活动详细描述
 *   startTime: string,    // 活动开始时间（格式化字符串）
 *   endTime: string,      // 活动结束时间（格式化字符串）
 *   location: string,     // 活动地点
 *   organizer: string,    // 主办方名称
 *   content: string,      // 活动内容（HTML格式）
 *   rules: string,        // 活动规则（换行符分隔）
 *   coverUrl: string,     // 活动封面图片URL
 *   isJoined: boolean     // 是否已报名
 * }
 */
function getActivityDetail(activityId) {
  return api.get('/api/activities/detail', { id: activityId });
}

/**
 * 活动报名
 * @param {string} activityId 活动ID
 * @returns {Promise} 返回报名结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   signupId: string,    // 报名记录唯一ID
 *   activityId: string,  // 活动ID
 *   signupTime: string,  // 报名成功时间
 *   status: string,      // 报名状态
 *   message: string      // 报名成功提示信息
 * }
 */
function signupActivity(activityId) {
  return api.post('/api/activities/signup', { id: activityId });
}

/**
 * 取消活动报名
 * @param {string} eventId 活动ID
 * @param {string} signupId 报名记录ID
 * @returns {Promise} 返回取消结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   eventId: string,     // 活动ID
 *   signupId: string,    // 报名记录ID
 *   cancelTime: string,  // 取消时间
 *   refundAmount: number,// 退款金额（如有）
 *   message: string      // 取消成功提示
 * }
 */
function cancelSignup(eventId, signupId) {
  return api.post('/api/activities/cancel-signup', { eventId, signupId });
}

/**
 * 查询用户报名记录
 * @param {Object} params 查询参数
 * @param {number} params.page 页码（默认1）
 * @param {number} params.pageSize 每页数量（默认10）
 * @param {string} params.status 报名状态筛选（默认all）
 * @returns {Promise} 返回用户报名记录列表
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   signups: Array,      // 报名记录列表
 *   pagination: Object   // 分页信息
 * }
 */
function getMySignups(params = {}) {
  const requestParams = {
    page: 1,
    pageSize: 10,
    status: 'all',
    ...params
  };
  
  return api.get('/api/activities/my-signups', requestParams);
}

/**
 * ActivityItem 活动数据项结构（符合接口文档）
 * {
 *   id: number,           // 活动唯一ID
 *   title: string,        // 活动标题
 *   description: string,  // 活动描述
 *   coverUrl: string,     // 活动封面图URL
 *   startTime: string,    // 活动开始时间（简化格式，如"12月18日"）
 *   endTime: string,      // 活动结束时间（简化格式，如"12月24日"）
 *   location: string,     // 活动地点
 *   status: string,       // 活动状态：ongoing-进行中，coming-即将开始，finished-已结束
 *   isFull: boolean       // 是否已满员
 * }
 */

// 导出所有API函数 - 使用CommonJS规范，确保小程序能正确引用
module.exports = {
  getActivityList,        // 获取活动列表
  searchActivities,       // 搜索活动
  getActivityStats,       // 获取活动状态统计
  getActivityDetail,      // 获取活动详情
  signupActivity,         // 活动报名
  cancelSignup,           // 取消报名
  getMySignups            // 查询用户报名记录
}; 