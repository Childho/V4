// 通用API请求函数 - 符合@api.mdc规范
// header中必须设置auth，参数使用json格式，返参格式：{error, body, message}

/**
 * 通用API请求函数
 * @param {string} url - 请求URL
 * @param {object} data - 请求参数，默认{}
 * @param {string} method - 请求方式，默认POST
 * @returns {Promise} 返回业务数据
 */
export async function apiRequest(url, data = {}, method = 'POST') {
  // 获取存储的token
  const token = wx.getStorageSync('token') || '';
  
  try {
    console.log(`[API请求] ${method} ${url}`, data);
    
    const res = await wx.request({
      url: url, // 这里应该是完整的URL，包含域名
      method: method,
      data: data, // 参数使用json格式，就算为空也使用{}
      header: {
        'content-type': 'application/json',
        'auth': token // header中必须设置auth
      }
    });
    
    console.log(`[API响应] ${method} ${url}`, res.data);
    
    // 解析后端返回的通用格式
    const { error, body, message } = res.data;
    
    // 根据error码处理不同情况
    switch (error) {
      case 0: // 成功
        return body;
        
      case 401: // 未登录
        wx.showToast({ title: '请先登录', icon: 'none' });
        wx.navigateTo({ url: '/pages/login/login' });
        throw new Error('未登录');
        
      case 500: // 系统异常
        wx.showToast({ title: '系统异常', icon: 'none' });
        throw new Error('系统异常');
        
      default: // 其他业务异常
        wx.showToast({ title: message || '请求失败', icon: 'none' });
        throw new Error(message || '请求失败');
    }
    
  } catch (error) {
    console.error(`[API错误] ${method} ${url}`, error);
    
    // 网络错误或其他异常
    if (!error.message.includes('未登录') && !error.message.includes('系统异常')) {
      wx.showToast({
        title: '网络异常，请重试',
        icon: 'none'
      });
    }
    
    throw error;
  }
} 