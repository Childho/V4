// 评论相关API接口 - 基于接口文档comment-detail.md实现
import { apiRequest } from './request';

/**
 * 获取商品评论详情
 * @param {string} productId - 商品ID
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页数量，默认10  
 * @param {string} filter - 筛选类型：all/withImage/positive/negative，默认all
 * @returns {Promise<Object>} 评论详情数据
 */
export function getProductCommentsDetail(productId, page = 1, pageSize = 10, filter = 'all') {
  return apiRequest('/api/products/comments/detail', {
    productId,
    page,
    pageSize,
    filter
  }, 'GET');
}

/**
 * 切换评论点赞状态
 * @param {string} commentId - 评论ID
 * @returns {Promise<Object>} 点赞操作结果
 */
export function toggleCommentLike(commentId) {
  return apiRequest('/api/comments/toggle-like', {
    commentId
  }, 'POST');
}

/**
 * 获取评论图片列表
 * @param {string} commentId - 评论ID
 * @returns {Promise<Object>} 评论图片数据
 */
export function getCommentImages(commentId) {
  return apiRequest('/api/comments/images', {
    commentId
  }, 'GET');
}

/**
 * 举报评论
 * @param {string} commentId - 评论ID
 * @param {string} reason - 举报原因：spam/inappropriate/fake/harassment/other
 * @param {string} description - 详细描述（可选）
 * @returns {Promise<Object>} 举报结果
 */
export function reportComment(commentId, reason, description = '') {
  return apiRequest('/api/comments/report', {
    commentId,
    reason,
    description
  }, 'POST');
}

/**
 * 获取用户评论历史
 * @param {string} userId - 用户ID
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页数量，默认5
 * @returns {Promise<Object>} 用户评论历史数据
 */
export function getUserCommentHistory(userId, page = 1, pageSize = 5) {
  return apiRequest('/api/users/comment-history', {
    userId,
    page,
    pageSize
  }, 'GET');
} 