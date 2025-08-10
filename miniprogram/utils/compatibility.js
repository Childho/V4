/**
 * 浏览器兼容性处理工具
 * 用于解决微信开发者工具中的各种浏览器兼容性警告
 */

/**
 * 禁用SharedArrayBuffer警告
 * 这个函数在小程序启动时调用，用于处理开发环境中的警告
 */
function disableSharedArrayBufferWarning() {
  // 在开发环境中禁用SharedArrayBuffer相关警告
  if (typeof console !== 'undefined' && console.warn) {
    const originalWarn = console.warn;
    console.warn = function(...args) {
      // 过滤掉SharedArrayBuffer相关的警告信息
      const message = args.join(' ');
      if (message.includes('SharedArrayBuffer') || 
          message.includes('cross-origin isolation') ||
          message.includes('M92')) {
        // 不显示这些警告
        return;
      }
      // 其他警告正常显示
      return originalWarn.apply(console, args);
    };
  }
}

/**
 * 禁用Worker相关的警告和错误
 * 处理reportRealtimeAction等不支持的API调用
 */
function disableWorkerWarnings() {
  // 处理console中的worker相关错误
  if (typeof console !== 'undefined') {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // 过滤错误信息
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('reportRealtimeAction') || 
          message.includes('[worker]') ||
          message.includes('not support')) {
        // 在开发环境下可以显示简化信息，生产环境忽略
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 已忽略不兼容的API调用:', message.split(':')[0]);
        }
        return;
      }
      return originalError.apply(console, args);
    };
    
    // 过滤警告信息
    console.warn = function(...args) {
      const message = args.join(' ');
      if (message.includes('reportRealtimeAction') || 
          message.includes('[worker]')) {
        return;
      }
      return originalWarn.apply(console, args);
    };
  }
}

/**
 * 修复微信小程序API兼容性问题
 */
function fixWxApiCompatibility() {
  if (typeof wx !== 'undefined') {
    // 如果reportRealtimeAction不存在或不支持，提供一个空的实现
    if (!wx.reportRealtimeAction) {
      wx.reportRealtimeAction = function(options) {
        // 空实现，避免报错
        if (options && options.fail) {
          options.fail({
            errMsg: 'reportRealtimeAction:fail not support'
          });
        }
      };
    }
    
    // 检查其他可能不兼容的API
    const unsupportedApis = [
      'reportRealtimeAction',
      'reportMonitor', 
      'reportAnalytics'
    ];
    
    unsupportedApis.forEach(apiName => {
      if (!wx[apiName]) {
        wx[apiName] = function(options = {}) {
          // 静默处理，避免报错
          if (options.fail) {
            options.fail({
              errMsg: `${apiName}:fail not support`
            });
          }
        };
      }
    });
  }
}

/**
 * 检查浏览器环境并设置兼容性配置
 */
function setupBrowserCompatibility() {
  try {
    // 禁用SharedArrayBuffer警告
    disableSharedArrayBufferWarning();
    
    // 禁用Worker相关警告
    disableWorkerWarnings();
    
    // 修复微信API兼容性
    fixWxApiCompatibility();
    
    // 检查是否在微信开发者工具中运行
    const isDevTool = typeof wx !== 'undefined' && wx.getSystemInfoSync;
    if (isDevTool) {
      console.log('✅ 浏览器兼容性配置已应用');
      console.log('✅ Worker API兼容性修复已应用');
      console.log('✅ 微信小程序API兼容性修复已应用');
    }
  } catch (error) {
    console.error('设置浏览器兼容性时出错:', error);
  }
}

/**
 * 安全的数组缓冲区创建函数
 * 替代SharedArrayBuffer的安全实现
 */
function createSafeArrayBuffer(length) {
  try {
    // 使用普通的ArrayBuffer替代SharedArrayBuffer
    return new ArrayBuffer(length);
  } catch (error) {
    console.warn('创建ArrayBuffer失败，使用备用方案:', error);
    // 备用方案：使用普通数组
    return new Array(length).fill(0);
  }
}

/**
 * 导出工具函数
 */
module.exports = {
  setupBrowserCompatibility,
  createSafeArrayBuffer,
  disableSharedArrayBufferWarning,
  disableWorkerWarnings,
  fixWxApiCompatibility
}; 