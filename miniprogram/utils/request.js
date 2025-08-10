// API请求工具函数
let config

try {
  const configModule = require('../config/index.js')
  config = configModule.config
  console.log('config',config)
  console.log('config_modeule',configModule)
  if (!config) {
    console.warn('⚠️ 配置对象未正确加载，使用默认配置')
    config = {
      apiBaseUrl: '',
      timeout: 10000,
      debug: false,
      request: {
        header: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        enableHttp2: false,
        enableQuic: false
      },
      errorHandling: {
        showToast: true,
        retryTimes: 2,
        retryDelay: 1000
      }
    }
  }
} catch (error) {
  console.error('❌ 加载配置文件失败:', error)
  // 使用默认配置
  config = {
    apiBaseUrl: '',
    timeout: 10000,
    debug: false,
    request: {
      header: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      enableHttp2: false,
      enableQuic: false
    },
    errorHandling: {
      showToast: true,
      retryTimes: 2,
      retryDelay: 1000
    }
  }
}

const { API_CONSTANTS } = require('../config/constants.js')

/**
 * 统一的API请求函数
 * @param {Object} options 请求配置
 * @param {string} options.url API路径（不包含baseUrl）
 * @param {string} options.method 请求方式 GET|POST|PUT|DELETE
 * @param {Object} options.data 请求数据
 * @param {Object} options.header 请求头
 * @param {boolean} options.needAuth 是否需要认证
 * @param {boolean} options.showLoading 是否显示加载提示
 * @param {number} options.timeout 超时时间
 * @returns {Promise} 返回Promise对象
 */
function request(options = {}) {
  // 默认配置 - 添加安全的默认值处理
  const defaultOptions = {
    method: 'GET',
    data: {},
    header: {},
    needAuth: false,
    showLoading: false,
    timeout: (config && config.timeout) ? config.timeout : 10000,
    enableRetry: true
  }
  
  // 合并配置
  const requestOptions = { ...defaultOptions, ...options }
  
  // 构建完整URL - 添加安全的默认值处理
  const baseUrl = (config && config.apiBaseUrl) ? config.apiBaseUrl : ''
  const fullUrl = `${baseUrl}${requestOptions.url}`
  
  // 构建请求头 - 添加安全的默认值处理
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  
  const headers = {
    ...defaultHeaders,
    ...(config && config.request && config.request.header ? config.request.header : {}),
    ...requestOptions.header
  }
  
  // 添加认证头
  if (requestOptions.needAuth) {
    const token = wx.getStorageSync(API_CONSTANTS.STORAGE_KEYS.TOKEN)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      console.warn('需要认证但未找到token')
      // 可以在这里处理未登录的情况
      return Promise.reject({
        error: API_CONSTANTS.UNAUTHORIZED,
        message: '用户未登录'
      })
    }
  }
  
  // 显示加载提示
  if (requestOptions.showLoading) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
  }
  
  // 记录请求日志（仅调试模式）
  if (config && config.debug) {
    console.log('🌐 ===========================================')
    console.log('📤 发起API请求')
    console.log('🌐 ===========================================')
    console.log('🔗 请求URL:', fullUrl)
    console.log('📋 请求方法:', requestOptions.method)
    console.log('📦 请求数据:', JSON.stringify(requestOptions.data, null, 2))
    console.log('🔐 需要认证:', requestOptions.needAuth ? '是' : '否')
    console.log('📜 请求头:', JSON.stringify(headers, null, 2))
    console.log('⏰ 请求时间:', new Date().toLocaleString())
    console.log('🌐 ===========================================')
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: requestOptions.method,
      data: requestOptions.data,
      header: headers,
      timeout: requestOptions.timeout,
      enableHttp2: (config && config.request && config.request.enableHttp2) || false,
      enableQuic: (config && config.request && config.request.enableQuic) || false,
      
      success: (res) => {
        // 隐藏加载提示
        if (requestOptions.showLoading) {
          wx.hideLoading()
        }
        
        // 记录响应日志（仅调试模式）
        if (config && config.debug) {
          console.log('🎯 ===========================================')
          console.log('📥 收到API响应')
          console.log('🎯 ===========================================')
          console.log('🔗 响应URL:', fullUrl)
          console.log('📊 HTTP状态码:', res.statusCode)
          console.log('📄 响应数据:', JSON.stringify(res.data, null, 2))
          console.log('⏰ 响应时间:', new Date().toLocaleString())
          
          // 检查业务状态码
          if (res.data && typeof res.data === 'object') {
            console.log('✅ 业务状态码:', res.data[API_CONSTANTS.RESPONSE_FIELDS.ERROR])
            console.log('✅ 业务是否成功:', res.data[API_CONSTANTS.RESPONSE_FIELDS.SUCCESS])
            console.log('✅ 业务消息:', res.data[API_CONSTANTS.RESPONSE_FIELDS.MESSAGE])
          }
          console.log('🎯 ===========================================')
        }
        
        // 检查HTTP状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 检查业务状态码
          if (res.data && typeof res.data === 'object') {
            if (res.data[API_CONSTANTS.RESPONSE_FIELDS.SUCCESS] && 
                res.data[API_CONSTANTS.RESPONSE_FIELDS.ERROR] === API_CONSTANTS.SUCCESS_CODE) {
              // 请求成功
              resolve(res.data[API_CONSTANTS.RESPONSE_FIELDS.BODY] || res.data)
            } else {
              // 业务失败
              const errorMsg = res.data[API_CONSTANTS.RESPONSE_FIELDS.MESSAGE] || '请求失败'
              console.error('业务错误:', errorMsg)
              
              // 处理特殊错误码
              if (res.data[API_CONSTANTS.RESPONSE_FIELDS.ERROR] === API_CONSTANTS.UNAUTHORIZED) {
                // token过期，清除本地存储
                wx.removeStorageSync(API_CONSTANTS.STORAGE_KEYS.TOKEN)
                wx.removeStorageSync(API_CONSTANTS.STORAGE_KEYS.USER_ID)
                
                if (config && config.errorHandling && config.errorHandling.showToast) {
                wx.showToast({
                  title: '登录已过期，请重新登录',
                  icon: 'none'
                })
              }
              } else {
                if (config && config.errorHandling && config.errorHandling.showToast) {
                  wx.showToast({
                    title: errorMsg,
                    icon: 'none'
                  })
                }
              }
              
              reject({
                error: res.data[API_CONSTANTS.RESPONSE_FIELDS.ERROR],
                message: errorMsg,
                data: res.data
              })
            }
          } else {
            // 响应格式错误
            console.error('API响应格式错误:', res.data)
            reject({
              error: -1,
              message: '服务器响应格式错误',
              data: res.data
            })
          }
        } else {
          // HTTP状态码错误
          console.error('HTTP错误:', res.statusCode)
          
          if (config && config.errorHandling && config.errorHandling.showToast) {
            wx.showToast({
              title: `网络错误: ${res.statusCode}`,
              icon: 'none'
            })
          }
          
          reject({
            error: res.statusCode,
            message: `HTTP错误: ${res.statusCode}`,
            data: res.data
          })
        }
      },
      
      fail: (error) => {
        // 隐藏加载提示
        if (requestOptions.showLoading) {
          wx.hideLoading()
        }
        
        console.error('网络请求失败:', error)
        
        // 自动重试逻辑
        if (requestOptions.enableRetry && config && config.errorHandling && (config.errorHandling.retryTimes || 0) > 0) {
          const retryDelay = (config.errorHandling && config.errorHandling.retryDelay) || 1000
          console.log(`请求失败，${retryDelay}ms后重试...`)
          
          setTimeout(() => {
            // 减少重试次数
            const retryOptions = {
              ...requestOptions,
              enableRetry: false  // 防止无限重试
            }
            
            // 更新配置中的重试次数
            if (config && config.errorHandling) {
              config.errorHandling.retryTimes--
            }
            
            request(retryOptions).then(resolve).catch(reject)
          }, retryDelay)
          
          return
        }
        
        if (config && config.errorHandling && config.errorHandling.showToast) {
          wx.showToast({
            title: '网络连接失败，请检查网络',
            icon: 'none'
          })
        }
        
        reject({
          error: -2,
          message: '网络连接失败',
          detail: error
        })
      }
    })
  })
}

/**
 * GET请求
 */
function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST请求
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 */
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del
}