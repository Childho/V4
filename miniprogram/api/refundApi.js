// 退款相关API接口
import { apiRequest } from './utils/request';

/**
 * 退款API接口模块
 * 包含退款详情查询等功能
 */

/**
 * 获取退款详情信息
 * @param {Object} params 请求参数
 * @param {String} params.orderNo 订单编号
 * @param {String} params.refundNo 退款编号
 * @returns {Promise} 返回退款详情数据
 */
export function getRefundDetail(params) {
  console.log('获取退款详情，参数：', params);
  
  return apiRequest('/api/refund/detail', {
    orderNo: params.orderNo,
    refundNo: params.refundNo
  }, 'POST');
}