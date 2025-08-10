// 评价相关API接口
import { apiRequest } from './utils/request';

/**
 * 评价API接口模块
 * 包含订单评价的各项功能：获取订单详情、上传媒体文件、获取标签、提交评价等
 */

/**
 * 获取订单详情（用于评价页面）
 * @param {String} orderId 订单ID
 * @returns {Promise} 返回订单详情数据
 */
export function getOrderDetail(orderId) {
  console.log('获取订单详情，订单ID：', orderId);
  
  return apiRequest('/api/evaluation/order-detail', {
    orderId: orderId
  }, 'GET');
}

/**
 * 上传媒体文件
 * @param {Object} params 上传参数
 * @param {String} params.type 文件类型（image/video）
 * @param {Array} params.files 文件列表
 * @returns {Promise} 返回上传结果
 */
export function uploadMedia(params) {
  console.log('上传媒体文件，参数：', params);
  
  return apiRequest('/api/evaluation/upload-media', {
    type: params.type,
    files: params.files
  }, 'POST');
}

/**
 * 获取评价标签
 * @param {Object} params 查询参数
 * @param {String} params.category 商品分类（可选）
 * @param {String} params.productType 商品类型（可选）
 * @returns {Promise} 返回标签列表
 */
export function getEvaluationTags(params = {}) {
  console.log('获取评价标签，参数：', params);
  
  return apiRequest('/api/evaluation/tags', {
    category: params.category || '',
    productType: params.productType || ''
  }, 'GET');
}

/**
 * 提交评价
 * @param {Object} evaluationData 评价数据
 * @param {String} evaluationData.orderId 订单ID
 * @param {Number} evaluationData.goodsId 商品ID
 * @param {Number} evaluationData.rating 星级评分（1-5）
 * @param {String} evaluationData.content 文字评价内容（可选）
 * @param {Array} evaluationData.tags 选中的标签列表（可选）
 * @param {Array} evaluationData.mediaUrls 媒体文件URL列表（可选）
 * @param {Boolean} evaluationData.isAnonymous 是否匿名评价（可选）
 * @param {Boolean} evaluationData.isPublic 是否公开评价（可选）
 * @returns {Promise} 返回评价提交结果
 */
export function submitEvaluation(evaluationData) {
  console.log('提交评价，数据：', evaluationData);
  
  return apiRequest('/api/evaluation/submit', {
    orderId: evaluationData.orderId,
    goodsId: evaluationData.goodsId,
    rating: evaluationData.rating,
    content: evaluationData.content || '',
    tags: evaluationData.tags || [],
    mediaUrls: evaluationData.mediaUrls || [],
    isAnonymous: evaluationData.isAnonymous || false,
    isPublic: evaluationData.isPublic !== false // 默认为true
  }, 'POST');
}

/**
 * 删除媒体文件
 * @param {String} fileUrl 文件URL
 * @returns {Promise} 返回删除结果
 */
export function deleteMediaFile(fileUrl) {
  console.log('删除媒体文件，URL：', fileUrl);
  
  return apiRequest('/api/evaluation/delete-media', {
    fileUrl: fileUrl
  }, 'POST');
}

/**
 * 小程序文件上传
 * @param {String} filePath 文件路径
 * @param {String} type 文件类型
 * @returns {Promise} 返回上传结果
 */
export function uploadFile(filePath, type = 'image') {
  console.log('小程序文件上传，路径：', filePath, '类型：', type);
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${wx.getStorageSync('apiBaseUrl') || ''}/api/evaluation/upload`,
      filePath: filePath,
      name: 'file',
      formData: {
        type: type
      },
      header: {
        'Authorization': wx.getStorageSync('token') || ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (error) {
          reject(new Error('上传响应解析失败'));
        }
      },
      fail: (error) => {
        console.error('文件上传失败：', error);
        reject(new Error('文件上传失败'));
      }
    });
  });
} 