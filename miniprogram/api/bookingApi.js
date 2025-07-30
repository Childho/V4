const { request, api } = require('./utils/request');

/**
 * 获取线材列表
 * @param {Object} params 查询参数
 * @param {string} params.brand 品牌筛选（all全部/yonex/victor/li_ning/gosen）
 * @returns {Promise} 返回线材列表和品牌列表
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   brands: Array,    // 品牌列表
 *   strings: Array    // 线材列表
 * }
 */
function getStringsList(params = {}) {
  const requestParams = {
    brand: 'all',
    ...params
  };
  
  return api.get('/api/strings/list', requestParams);
}

/**
 * 提交穿线订单
 * @param {Object} orderData 订单数据
 * @param {string} orderData.racket_brand 球拍品牌型号
 * @param {number} orderData.pounds 磅数要求（18-30）
 * @param {string} orderData.string_id 选择的线材ID
 * @param {string} orderData.remark 备注信息
 * @returns {Promise} 返回订单创建结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   orderId: string,        // 订单ID
 *   orderNo: string,        // 订单号
 *   racket_brand: string,   // 球拍品牌型号
 *   pounds: number,         // 磅数
 *   string_name: string,    // 线材名称
 *   total_price: number,    // 总价格
 *   status: string,         // 订单状态
 *   status_text: string,    // 状态描述
 *   estimated_time: string, // 预计完成时间
 *   create_time: string     // 创建时间
 * }
 */
function createStringOrder(orderData) {
  return api.post('/api/string-service/create', orderData);
}

/**
 * 获取积分兑换信息
 * @returns {Promise} 返回用户积分余额和可兑换商品列表
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   user_points: number,        // 用户当前积分
 *   goods: Array,               // 可兑换商品列表
 *   recent_exchanges: Array     // 最近兑换记录
 * }
 */
function getPointsExchangeInfo() {
  return api.get('/api/points/exchange-info', {});
}

/**
 * 积分商品兑换
 * @param {Object} exchangeData 兑换数据
 * @param {number} exchangeData.goodsId 商品ID
 * @param {number} exchangeData.points 消耗积分
 * @returns {Promise} 返回兑换结果
 */
function exchangeGoods(exchangeData) {
  return api.post('/api/points/exchange', exchangeData);
}

/**
 * 获取推广返佣信息
 * @returns {Promise} 返回推广统计数据和明细记录
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   total_earnings: number,      // 累计收益
 *   invited_users: number,       // 累计邀请人数
 *   this_month_earnings: number, // 本月收益
 *   today_earnings: number,      // 今日收益
 *   account_balance: number,     // 账户余额
 *   invite_code: string,         // 邀请码
 *   invite_link: string,         // 邀请链接
 *   qr_code_url: string,         // 推广二维码URL
 *   commission_records: Array,   // 佣金记录
 *   withdraw_records: Array      // 提现记录
 * }
 */
function getPromotionInfo() {
  return api.get('/api/promotion/info', {});
}

/**
 * 申请提现
 * @param {Object} withdrawData 提现数据
 * @param {number} withdrawData.amount 提现金额
 * @returns {Promise} 返回提现申请结果
 */
function applyWithdraw(withdrawData) {
  return api.post('/api/promotion/withdraw', withdrawData);
}

/**
 * 获取我的服务记录
 * @param {Object} params 查询参数
 * @param {string} params.type 服务类型（all全部/穿线进度/奖品物流/返佣记录）
 * @param {number} params.page 页码（默认1）
 * @param {number} params.pageSize 每页数量（默认10）
 * @returns {Promise} 返回服务记录列表
 * 
 * 响应数据结构（符合接口文档）：
 * Array - 服务记录数组，直接返回数组类型
 */
function getServiceRecords(params = {}) {
  const requestParams = {
    type: 'all',
    page: 1,
    pageSize: 10,
    ...params
  };
  
  return api.get('/api/user/service-records', requestParams);
}

// 导出所有API函数 - 使用CommonJS规范
module.exports = {
  getStringsList,        // 获取线材列表
  createStringOrder,     // 提交穿线订单
  getPointsExchangeInfo, // 获取积分兑换信息
  exchangeGoods,         // 积分商品兑换
  getPromotionInfo,      // 获取推广返佣信息
  applyWithdraw,         // 申请提现
  getServiceRecords      // 获取我的服务记录
}; 