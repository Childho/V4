// 优惠券相关API接口 - 基于接口文档coupon.md实现
import { apiRequest } from './request';

/**
 * 获取优惠券列表
 * @param {number} status - 优惠券状态（0全部/1可使用/4即将过期）
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页数量，默认10
 * @returns {Promise<Object>} 优惠券列表数据
 */
export function getCouponList(status = 1, page = 1, pageSize = 10) {
  return apiRequest('/api/user/coupons/list', {
    status,
    page,
    pageSize
  }, 'GET');
}

/**
 * 使用优惠券
 * @param {number} couponId - 优惠券ID
 * @returns {Promise<Object>} 使用结果
 */
export function useCoupon(couponId) {
  return apiRequest('/api/user/coupons/use', {
    couponId
  }, 'POST');
}

/**
 * 获取可用优惠券数量
 * @returns {Promise<Object>} 优惠券数量统计
 */
export function getAvailableCouponCount() {
  return apiRequest('/api/user/coupons/count', {}, 'GET');
}

/**
 * 获取适用优惠券（订单确认页使用）
 * @param {number} orderAmount - 订单商品总金额
 * @param {Array} goodsIds - 商品ID列表
 * @param {Array} goodsCategories - 商品分类列表
 * @returns {Promise<Object>} 适用优惠券列表
 */
export function getAvailableCoupons(orderAmount, goodsIds, goodsCategories) {
  return apiRequest('/api/orders/available-coupons', {
    orderAmount,
    goodsIds,
    goodsCategories
  }, 'POST');
} 