// API配置 - 支持多环境
const environments = {
  // 开发环境配置
  development: {
    apiBaseUrl: 'http://127.0.0.1:5200',  // 开发环境API地址 - 使用真实API地址
    timeout: 10000,                            // 请求超时时间(毫秒)
    enableMock: true,                          // 是否启用Mock数据 - 临时启用测试API集成
    debug: true                                // 是否开启调试模式
  },
  
  // 测试环境配置  
  testing: {
    apiBaseUrl: 'https://test-api.example.com', // 测试环境API地址
    timeout: 8000,
    enableMock: false,
    debug: true
  },
  
  // 生产环境配置
  production: {
    apiBaseUrl: 'https://api2222.example.com',      // 正式环境API地址
    timeout: 6000,
    enableMock: false,
    debug: true  // 👈 临时开启生产环境日志，便于调试API对接
  }
}

// 当前环境设置 - 根据实际情况修改
const currentEnv = 'development' // 'development' | 'testing' | 'production'

// 获取当前环境配置
const config = {
  ...environments[currentEnv],
  version: '1.0.0',
  env: currentEnv,
  
  // API请求配置
  request: {
    header: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: environments[currentEnv].timeout,
    enableHttp2: true,                          // 启用HTTP2
    enableQuic: true                            // 启用QUIC
  },
  
  // 错误处理配置
  errorHandling: {
    showToast: true,                            // 是否显示错误提示
    retryTimes: 2,                              // 自动重试次数
    retryDelay: 1000                            // 重试延迟(毫秒)
  }
}

// 强制开启调试日志（用于API对接调试）
config.debug = true

// 打印配置加载信息
console.log('🚀 ===========================================')
console.log('📱 倍特爱小程序 - API配置加载')
console.log('🚀 ===========================================')
console.log('🔧 当前环境:', config.env)
console.log('🌐 API地址:', config.apiBaseUrl)
console.log('⏰ 超时时间:', config.timeout + 'ms')
console.log('🐛 调试模式:', config.debug ? '已开启' : '已关闭')
console.log('📅 加载时间:', new Date().toLocaleString())
console.log('🚀 ===========================================')

// 测试日志输出
console.log('✅ 配置文件加载完成，请查看控制台获取API请求日志')

module.exports = {
  config,
  environments,
  currentEnv
}