/**
 * 优惠券相关API接口
 * 包含获取优惠券列表、使用优惠券等功能
 */

// 引入通用请求函数
import { request } from './utils/request.js';

/**
 * 获取用户优惠券列表
 * @param {Object} params - 查询参数
 * @param {number} params.status - 优惠券状态：0=全部，1=可使用，2=已使用，3=已过期
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认10
 * @returns {Promise} 返回优惠券列表数据
 */
export function getCouponList(params = {}) {
  return request({
    url: '/api/coupon/list',
    data: {
      status: 0,     // 默认查询全部
      page: 1,       // 默认第一页
      pageSize: 10,  // 默认每页10条
      ...params      // 合并传入的参数
    }
  });
}

/**
 * 使用优惠券
 * @param {number} couponId - 优惠券ID
 * @param {number} orderId - 订单ID（可选）
 * @returns {Promise} 返回使用结果
 */
export function useCoupon(couponId, orderId = null) {
  return request({
    url: '/api/coupon/use',
    data: {
      couponId,    // 优惠券ID
      orderId      // 订单ID（用于绑定订单）
    }
  });
}

/**
 * 获取可用优惠券数量
 * @returns {Promise} 返回可用优惠券数量
 */
export function getAvailableCouponCount() {
  return request({
    url: '/api/coupon/count',
    data: {}
  });
}

/**
 * 领取优惠券
 * @param {number} activityId - 活动ID
 * @param {number} couponId - 优惠券模板ID
 * @returns {Promise} 返回领取结果
 */
export function receiveCoupon(activityId, couponId) {
  return request({
    url: '/api/coupon/receive',
    data: {
      activityId,  // 活动ID
      couponId     // 优惠券模板ID
    }
  });
}

/**
 * 获取优惠券详情
 * @param {number} couponId - 优惠券ID
 * @returns {Promise} 返回优惠券详细信息
 */
export function getCouponDetail(couponId) {
  return request({
    url: '/api/coupon/detail',
    data: {
      couponId     // 优惠券ID
    }
  });
} 