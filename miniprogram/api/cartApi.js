/**
 * 购物车相关API接口
 * 遵循项目API规范，包含token验证和错误处理
 */

const { api } = require('./utils/request');

/**
 * 获取购物车商品列表
 * @returns {Promise} 返回购物车商品列表
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   cartList: Array  // 购物车商品列表
 * }
 */
function getCartList() {
  return api.get('/api/cart/list', {});
}

/**
 * 添加商品到购物车
 * @param {Object} params 添加参数
 * @param {string} params.productId 商品唯一ID
 * @param {number} params.quantity 添加数量
 * @param {Object} params.selectedSpecs 选择的规格键值对
 * @returns {Promise} 返回添加结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   cartId: string,        // 购物车条目ID
 *   action: string,        // 操作类型（added新增/updated更新数量）
 *   newQuantity: number,   // 该条目的最新数量
 *   cartCount: number      // 购物车总商品数量
 * }
 */
function addToCart(params) {
  return api.post('/api/cart/add', params);
}

/**
 * 修改购物车商品数量
 * @param {Object} params 修改参数
 * @param {string} params.cartId 购物车条目ID
 * @param {number} params.quantity 新的数量（1-99）
 * @returns {Promise} 返回修改结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   cartId: string,           // 购物车条目ID
 *   newQuantity: number,      // 更新后的数量
 *   newSubtotal: number,      // 更新后的小计金额
 *   cartSummary: Object       // 购物车汇总信息
 * }
 */
function updateQuantity(params) {
  return api.put('/api/cart/update-quantity', params);
}

/**
 * 修改购物车商品规格
 * @param {Object} params 修改参数
 * @param {string} params.cartId 购物车条目ID
 * @param {Object} params.newSpecs 新选择的规格键值对
 * @param {number} params.quantity 商品数量
 * @returns {Promise} 返回修改结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   cartId: string,           // 购物车条目ID
 *   action: string,           // 操作类型（updated更新/merged合并）
 *   newSpec: string,          // 新的规格描述
 *   merged: boolean,          // 是否与已有条目合并
 *   cartSummary: Object       // 购物车汇总信息
 * }
 */
function updateSpecs(params) {
  return api.put('/api/cart/update-specs', params);
}

/**
 * 切换购物车商品选择状态
 * @param {Object} params 切换参数
 * @param {Array} params.cartIds 购物车条目ID列表（单选或多选时使用）
 * @param {boolean} params.selected 选择状态
 * @param {boolean} params.selectAll 是否全选操作（true时忽略cartIds）
 * @returns {Promise} 返回切换结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   updatedItems: Array,      // 已更新的购物车条目ID列表
 *   cartSummary: Object       // 购物车汇总信息
 * }
 */
function toggleSelect(params) {
  return api.put('/api/cart/toggle-select', params);
}

/**
 * 删除购物车商品
 * @param {Object} params 删除参数
 * @param {Array} params.cartIds 要删除的购物车条目ID列表
 * @returns {Promise} 返回删除结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   deletedItems: Array,      // 已删除的购物车条目ID列表
 *   deletedCount: number,     // 删除的商品数量
 *   cartSummary: Object       // 删除后的购物车汇总
 * }
 */
function removeItems(params) {
  return api.delete('/api/cart/remove', params);
}

/**
 * 购物车结算准备
 * @param {Object} params 结算参数
 * @param {Array} params.cartIds 指定结算的购物车条目ID（不传则使用所有选中商品）
 * @returns {Promise} 返回结算准备信息
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   checkoutItems: Array,       // 结算商品列表
 *   defaultAddress: Object,     // 用户默认收货地址
 *   availableCoupons: Array,    // 可用优惠券列表
 *   priceDetail: Object         // 价格明细
 * }
 */
function checkoutPrepare(params = {}) {
  return api.post('/api/cart/checkout-prepare', params);
}

/**
 * 清空购物车
 * @returns {Promise} 返回清空结果
 * 
 * 响应数据结构（符合接口文档）：
 * {
 *   clearedCount: number  // 清空的商品数量
 * }
 */
function clearCart() {
  return api.delete('/api/cart/clear', {});
}

// 导出所有API函数 - 使用CommonJS规范
module.exports = {
  getCartList,        // 获取购物车商品列表
  addToCart,          // 添加商品到购物车
  updateQuantity,     // 修改购物车商品数量
  updateSpecs,        // 修改购物车商品规格
  toggleSelect,       // 切换购物车商品选择状态
  removeItems,        // 删除购物车商品
  checkoutPrepare,    // 购物车结算准备
  clearCart           // 清空购物车
}; 