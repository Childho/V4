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
 * 检查浏览器环境并设置兼容性配置
 */
function setupBrowserCompatibility() {
  try {
    // 禁用SharedArrayBuffer警告
    disableSharedArrayBufferWarning();
    
    // 检查是否在微信开发者工具中运行
    const isDevTool = typeof wx !== 'undefined' && wx.getSystemInfoSync;
    if (isDevTool) {
      console.log('✅ 浏览器兼容性配置已应用');
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
  disableSharedArrayBufferWarning
}; 