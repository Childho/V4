/**
 * 小程序错误处理工具
 * 统一处理和过滤各种开发环境中的错误和警告
 */

/**
 * 全局错误处理器
 * 捕获并处理小程序中的各种错误
 */
function setupGlobalErrorHandler() {
  // 设置全局错误监听
  if (typeof wx !== 'undefined' && wx.onError) {
    wx.onError((error) => {
      console.log('🚨 捕获到全局错误:', error);
      
      // 过滤掉一些开发环境的无关错误
      const errorMessage = error.toString();
      if (errorMessage.includes('reportRealtimeAction') ||
          errorMessage.includes('SharedArrayBuffer') ||
          errorMessage.includes('cross-origin isolation')) {
        console.log('🔧 已忽略开发环境相关错误');
        return;
      }
      
      // 对于其他错误，可以上报或记录
      console.error('需要处理的错误:', error);
    });
  }
  
  // 设置未处理的Promise错误监听
  if (typeof wx !== 'undefined' && wx.onUnhandledRejection) {
    wx.onUnhandledRejection((error) => {
      console.log('🚨 捕获到未处理的Promise错误:', error);
      // 可以根据需要进行处理
    });
  }
}

/**
 * API调用错误处理装饰器
 * 用于包装可能失败的API调用
 */
function safeApiCall(apiFunction, fallback = () => {}) {
  return function(...args) {
    try {
      return apiFunction.apply(this, args);
    } catch (error) {
      console.warn('API调用失败，使用备用方案:', error);
      return fallback.apply(this, args);
    }
  };
}

/**
 * 网络请求错误处理
 */
function handleNetworkError(error) {
  const errorCode = error.errMsg || error.statusCode;
  
  switch (errorCode) {
    case 'request:fail timeout':
      wx.showToast({
        title: '请求超时，请重试',
        icon: 'none',
        duration: 2000
      });
      break;
    case 'request:fail':
      wx.showToast({
        title: '网络连接失败',
        icon: 'none',
        duration: 2000
      });
      break;
    default:
      wx.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none',
        duration: 2000
      });
  }
}

/**
 * 业务逻辑错误处理
 */
function handleBusinessError(error) {
  const { code, message } = error;
  
  // 根据错误码进行不同处理
  switch (code) {
    case 401:
      // 未授权，跳转到登录页
      wx.navigateTo({
        url: '/pages/login/index'
      });
      break;
    case 403:
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
      break;
    case 404:
      wx.showToast({
        title: '资源不存在',
        icon: 'none'
      });
      break;
    case 500:
      wx.showToast({
        title: '服务器异常',
        icon: 'none'
      });
      break;
    default:
      wx.showToast({
        title: message || '操作失败',
        icon: 'none'
      });
  }
}

/**
 * 页面错误处理混入
 * 可以在页面中使用的错误处理方法
 */
const pageErrorMixin = {
  // 统一的加载状态处理
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    });
  },
  
  hideLoading() {
    wx.hideLoading();
  },
  
  // 统一的错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },
  
  // 安全的数据更新
  safeSetData(data, callback) {
    try {
      this.setData(data, callback);
    } catch (error) {
      console.error('setData失败:', error);
      if (callback) callback();
    }
  }
};

module.exports = {
  setupGlobalErrorHandler,
  safeApiCall,
  handleNetworkError,
  handleBusinessError,
  pageErrorMixin
}; 