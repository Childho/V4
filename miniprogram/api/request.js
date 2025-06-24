// 通用API请求函数
// 符合小程序开发规范的接口封装

/**
 * 后端返回的通用接口格式
 */
export const ApiErrorCode = {
  SUCCESS: 0,      // 成功
  SYSTEM: 500,     // 系统异常  
  UNAUTHORIZED: 401 // 未登录
};

/**
 * 通用请求函数
 * @param {string} url - 请求地址
 * @param {Object} data - 请求参数，默认为空对象
 * @param {string} method - 请求方式，默认POST
 * @returns {Promise} 返回处理后的业务数据
 */
export async function apiRequest(url, data = {}, method = 'POST') {
  // 获取当前登录状态的token
  const token = wx.getStorageSync('token') || '';
  
  try {
    // 发起微信小程序请求
    const res = await new Promise((resolve, reject) => {
      wx.request({
        url,                      // 请求地址
        method,                   // 请求方式
        data,                     // 请求参数（JSON格式）
        header: { 
          auth: token,            // header中设置auth字段传递token
          'content-type': 'application/json'
        },
        success: resolve,         // 请求成功回调
        fail: reject             // 请求失败回调
      });
    });

    // 解析后端响应数据
    const { error, body, message } = res.data;
    
    // 根据错误码进行统一处理
    switch (error) {
      case ApiErrorCode.SUCCESS:
        // 请求成功，返回业务数据
        return body;
        
      case ApiErrorCode.SYSTEM:
        // 系统异常
        wx.showToast({ 
          title: '系统异常，请稍后重试', 
          icon: 'none' 
        });
        throw new Error('系统异常');
        
      case ApiErrorCode.UNAUTHORIZED:
        // 未登录，显示提示并跳转登录页
        wx.showToast({ 
          title: '请先登录', 
          icon: 'none' 
        });
        // 延迟跳转，让用户看到提示
        setTimeout(() => {
          wx.navigateTo({ 
            url: '/pages/login/index' 
          });
        }, 1500);
        throw new Error('未登录');
        
      default:
        // 其他业务异常，显示后端返回的错误信息
        wx.showToast({ 
          title: message || '请求失败', 
          icon: 'none' 
        });
        throw new Error(message || '请求失败');
    }
    
  } catch (error) {
    // 网络请求异常处理
    console.error('[API Request Error]', error);
    
    // 如果是网络错误，显示友好提示
    if (error.errMsg && error.errMsg.includes('request:fail')) {
      wx.showToast({
        title: '网络连接失败，请检查网络',
        icon: 'none'
      });
    }
    
    // 抛出错误，让调用方处理
    throw error;
  }
}

/**
 * GET请求的便捷方法
 * @param {string} url - 请求地址
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回处理后的业务数据
 */
export function apiGet(url, params = {}) {
  return apiRequest(url, params, 'GET');
}

/**
 * POST请求的便捷方法
 * @param {string} url - 请求地址  
 * @param {Object} data - 请求参数
 * @returns {Promise} 返回处理后的业务数据
 */
export function apiPost(url, data = {}) {
  return apiRequest(url, data, 'POST');
}

/**
 * 文件上传请求
 * @param {string} filePath - 本地文件路径
 * @param {string} uploadUrl - 上传地址，默认使用通用上传接口
 * @param {Object} formData - 额外的表单数据
 * @returns {Promise} 返回上传结果
 */
export async function uploadFile(filePath, uploadUrl = '/api/upload', formData = {}) {
  const token = wx.getStorageSync('token') || '';
  
  try {
    const res = await new Promise((resolve, reject) => {
      wx.uploadFile({
        url: uploadUrl,
        filePath,
        name: 'file',          // 文件对应的 key
        formData,              // 额外的表单数据
        header: {
          auth: token          // 传递token进行身份验证
        },
        success: resolve,
        fail: reject
      });
    });

    // 解析上传结果
    const result = JSON.parse(res.data);
    const { error, body, message } = result;
    
    if (error === ApiErrorCode.SUCCESS) {
      return body;
    } else {
      wx.showToast({
        title: message || '上传失败',
        icon: 'none'
      });
      throw new Error(message || '上传失败');
    }
    
  } catch (error) {
    console.error('[Upload File Error]', error);
    wx.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    });
    throw error;
  }
} 