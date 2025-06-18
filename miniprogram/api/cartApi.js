/**
 * 购物车相关API接口
 * 遵循项目API规范，包含token验证和错误处理
 */

// 导入通用请求函数（如果存在的话）
// import { apiRequest } from './request';

/**
 * 获取购物车列表
 * @returns {Promise} 返回购物车商品列表
 */
export function getCartList() {
  return new Promise((resolve, reject) => {
    // 获取本地存储的token
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: 'https://your-api-domain.com/api/cart/list', // 替换为实际的API地址
      method: 'POST',
      header: {
        'auth': token, // 按照API规范设置header中的auth字段
        'content-type': 'application/json'
      },
      data: {}, // 空参数也使用{}格式
      success(res) {
        const { error, body, message } = res.data;
        switch (error) {
          case 0: // 成功
            resolve(body);
            break;
          case 401: // 未登录
            wx.showToast({ title: '请先登录', icon: 'none' });
            wx.navigateTo({ url: '/pages/login/index' });
            reject(new Error('未登录'));
            break;
          case 500: // 系统异常
            wx.showToast({ title: '系统异常', icon: 'none' });
            reject(new Error('系统异常'));
            break;
          default: // 其他业务异常
            wx.showToast({ title: message, icon: 'none' });
            reject(new Error(message));
        }
      },
      fail(err) {
        console.error('获取购物车列表失败:', err);
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 添加商品到购物车
 * @param {Object} params 商品参数
 * @param {number} params.productId 商品ID
 * @param {string} params.spec 商品规格
 * @param {number} params.quantity 数量
 * @returns {Promise} 返回添加结果
 */
export function addToCart(params) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: 'https://your-api-domain.com/api/cart/add',
      method: 'POST',
      header: {
        'auth': token,
        'content-type': 'application/json'
      },
      data: params,
      success(res) {
        const { error, body, message } = res.data;
        switch (error) {
          case 0:
            wx.showToast({ title: '添加成功', icon: 'success' });
            resolve(body);
            break;
          case 401:
            wx.showToast({ title: '请先登录', icon: 'none' });
            wx.navigateTo({ url: '/pages/login/index' });
            reject(new Error('未登录'));
            break;
          case 500:
            wx.showToast({ title: '系统异常', icon: 'none' });
            reject(new Error('系统异常'));
            break;
          default:
            wx.showToast({ title: message, icon: 'none' });
            reject(new Error(message));
        }
      },
      fail(err) {
        console.error('添加到购物车失败:', err);
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 更新购物车商品数量
 * @param {Object} params 更新参数
 * @param {number} params.cartId 购物车项ID
 * @param {number} params.quantity 新数量
 * @returns {Promise} 返回更新结果
 */
export function updateCartQuantity(params) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: 'https://your-api-domain.com/api/cart/update',
      method: 'POST',
      header: {
        'auth': token,
        'content-type': 'application/json'
      },
      data: params,
      success(res) {
        const { error, body, message } = res.data;
        switch (error) {
          case 0:
            resolve(body);
            break;
          case 401:
            wx.showToast({ title: '请先登录', icon: 'none' });
            wx.navigateTo({ url: '/pages/login/index' });
            reject(new Error('未登录'));
            break;
          case 500:
            wx.showToast({ title: '系统异常', icon: 'none' });
            reject(new Error('系统异常'));
            break;
          default:
            wx.showToast({ title: message, icon: 'none' });
            reject(new Error(message));
        }
      },
      fail(err) {
        console.error('更新购物车数量失败:', err);
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 删除购物车商品
 * @param {Object} params 删除参数
 * @param {Array} params.cartIds 要删除的购物车项ID数组
 * @returns {Promise} 返回删除结果
 */
export function deleteCartItems(params) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: 'https://your-api-domain.com/api/cart/delete',
      method: 'POST',
      header: {
        'auth': token,
        'content-type': 'application/json'
      },
      data: params,
      success(res) {
        const { error, body, message } = res.data;
        switch (error) {
          case 0:
            wx.showToast({ title: '删除成功', icon: 'success' });
            resolve(body);
            break;
          case 401:
            wx.showToast({ title: '请先登录', icon: 'none' });
            wx.navigateTo({ url: '/pages/login/index' });
            reject(new Error('未登录'));
            break;
          case 500:
            wx.showToast({ title: '系统异常', icon: 'none' });
            reject(new Error('系统异常'));
            break;
          default:
            wx.showToast({ title: message, icon: 'none' });
            reject(new Error(message));
        }
      },
      fail(err) {
        console.error('删除购物车商品失败:', err);
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * 清空购物车
 * @returns {Promise} 返回清空结果
 */
export function clearCart() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: 'https://your-api-domain.com/api/cart/clear',
      method: 'POST',
      header: {
        'auth': token,
        'content-type': 'application/json'
      },
      data: {},
      success(res) {
        const { error, body, message } = res.data;
        switch (error) {
          case 0:
            wx.showToast({ title: '清空成功', icon: 'success' });
            resolve(body);
            break;
          case 401:
            wx.showToast({ title: '请先登录', icon: 'none' });
            wx.navigateTo({ url: '/pages/login/index' });
            reject(new Error('未登录'));
            break;
          case 500:
            wx.showToast({ title: '系统异常', icon: 'none' });
            reject(new Error('系统异常'));
            break;
          default:
            wx.showToast({ title: message, icon: 'none' });
            reject(new Error(message));
        }
      },
      fail(err) {
        console.error('清空购物车失败:', err);
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
} 