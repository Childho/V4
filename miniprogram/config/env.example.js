// 环境配置示例文件
// 请根据实际情况修改 config/index.js 中的API地址

const environmentExamples = {
  // 开发环境示例
  development: {
    apiBaseUrl: 'https://dev-api.yourcompany.com',     // 开发环境API地址
    timeout: 10000,                                     // 10秒超时
    debug: true                                         // 开启调试日志
  },
  
  // 测试环境示例
  testing: {
    apiBaseUrl: 'https://test-api.yourcompany.com',     // 测试环境API地址
    timeout: 8000,                                      // 8秒超时
    debug: true                                         // 开启调试日志
  },
  
  // 生产环境示例
  production: {
    apiBaseUrl: 'https://api.yourcompany.com',          // 生产环境API地址
    timeout: 6000,                                      // 6秒超时
    debug: false                                        // 关闭调试日志
  }
}

// 配置说明
const configGuide = {
  setup: [
    '1. 复制 config/index.js 中的环境配置',
    '2. 将 apiBaseUrl 修改为您的实际API地址',
    '3. 根据需要调整 timeout 和 debug 设置',
    '4. 修改 currentEnv 变量切换环境'
  ],
  
  apiBaseUrl: {
    description: '后端API的基础地址',
    format: 'https://域名',
    example: 'https://api.example.com',
    note: '不要在末尾添加斜杠'
  },
  
  timeout: {
    description: '请求超时时间(毫秒)',
    recommend: {
      development: 10000,   // 开发环境可以设置长一些
      testing: 8000,        // 测试环境中等
      production: 6000      // 生产环境要快速响应
    }
  },
  
  debug: {
    description: '是否开启调试日志',
    recommend: {
      development: true,    // 开发时需要详细日志
      testing: true,        // 测试时也需要日志
      production: false     // 生产环境关闭日志提升性能
    }
  }
}

// 接口路径说明
const apiPaths = {
  banners: '/api/banners',                              // 轮播图接口
  activities: '/api/activities',                        // 活动接口
  featuredEquipment: '/api/featured-equipment',         // 精选装备接口
  userInfo: '/api/user/info',                          // 用户信息接口
  customerService: '/api/analytics/customer-service'   // 客服统计接口
}

// 常见问题解决方案
const troubleshooting = {
  '无法找到Mock API': {
    problem: '提示无法找到该 Mock API',
    solution: [
      '1. 检查 config/index.js 中的 apiBaseUrl 是否正确',
      '2. 确认当前环境设置 currentEnv 是否正确',
      '3. 确保API服务器正在运行',
      '4. 检查网络连接是否正常'
    ]
  },
  
  '请求方式不匹配': {
    problem: 'API 文档定义的请求方式与实际请求不一致',
    solution: [
      '1. 检查接口文档中定义的HTTP方法',
      '2. 确认代码中使用的请求方法正确',
      '3. 如需要可以关闭服务端的请求方式校验'
    ]
  },
  
  '认证失败': {
    problem: '用户认证相关接口返回401错误',
    solution: [
      '1. 检查token是否存在且有效',
      '2. 确认token格式是否正确(Bearer + 空格 + token)',
      '3. 检查服务端token验证逻辑'
    ]
  },
  
  '跨域问题': {
    problem: '小程序请求出现跨域错误',
    solution: [
      '1. 在小程序后台配置request合法域名',
      '2. 确保API地址使用HTTPS协议',
      '3. 检查域名是否已备案'
    ]
  }
}

module.exports = {
  environmentExamples,
  configGuide,
  apiPaths,
  troubleshooting
} 