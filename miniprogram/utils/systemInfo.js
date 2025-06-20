/**
 * 系统信息工具类
 * 用于获取设备和系统相关信息，替代已弃用的wx.getSystemInfoSync方法
 */

/**
 * 获取完整的系统信息
 * 包含设备信息、窗口信息、应用基础信息等
 */
export function getSystemInfo() {
  try {
    // 获取设备信息（屏幕、硬件相关）
    const deviceInfo = wx.getDeviceInfo();
    
    // 获取窗口信息（屏幕尺寸、安全区域等）
    const windowInfo = wx.getWindowInfo();
    
    // 获取应用基础信息（版本、语言等）
    const appBaseInfo = wx.getAppBaseInfo();
    
    // 合并所有信息，保持与旧API兼容
    const systemInfo = {
      // 设备相关
      brand: deviceInfo.brand,
      model: deviceInfo.model,
      system: deviceInfo.system,
      platform: deviceInfo.platform,
      
      // 窗口和显示相关  
      screenWidth: windowInfo.screenWidth,
      screenHeight: windowInfo.screenHeight,
      windowWidth: windowInfo.windowWidth,
      windowHeight: windowInfo.windowHeight,
      pixelRatio: windowInfo.pixelRatio,
      statusBarHeight: windowInfo.statusBarHeight,
      safeArea: windowInfo.safeArea,
      
      // 应用相关
      version: appBaseInfo.version,
      SDKVersion: appBaseInfo.SDKVersion,
      language: appBaseInfo.language,
      theme: appBaseInfo.theme
    };
    
    return systemInfo;
  } catch (error) {
    console.error('获取系统信息失败:', error);
    
    // 如果新API不可用，使用默认值
    return {
      statusBarHeight: 44, // 默认状态栏高度
      screenWidth: 375,
      screenHeight: 667,
      windowWidth: 375,
      windowHeight: 667,
      pixelRatio: 2,
      platform: 'unknown',
      version: '1.0.0',
      SDKVersion: '2.0.0'
    };
  }
}

/**
 * 仅获取状态栏高度
 * 这是最常用的功能，单独提取
 */
export function getStatusBarHeight() {
  try {
    const windowInfo = wx.getWindowInfo();
    return windowInfo.statusBarHeight || 44; // 默认44px
  } catch (error) {
    console.error('获取状态栏高度失败:', error);
    return 44; // 使用默认值
  }
}

/**
 * 获取设备信息
 */
export function getDeviceInfo() {
  try {
    return wx.getDeviceInfo();
  } catch (error) {
    console.error('获取设备信息失败:', error);
    return {
      brand: 'unknown',
      model: 'unknown',
      system: 'iOS 14.0.0',
      platform: 'ios'
    };
  }
}

/**
 * 获取窗口信息
 */
export function getWindowInfo() {
  try {
    return wx.getWindowInfo();
  } catch (error) {
    console.error('获取窗口信息失败:', error);
    return {
      screenWidth: 375,
      screenHeight: 667,
      windowWidth: 375,
      windowHeight: 667,
      statusBarHeight: 44,
      pixelRatio: 2
    };
  }
} 