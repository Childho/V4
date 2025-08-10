// 测试request工具函数
const { get, post } = require('./request.js')

// 测试GET请求
console.log('🧪 开始测试request工具函数...')

// 测试基本GET请求
get('/api/test', {}, { showLoading: false })
  .then(data => {
    console.log('✅ GET请求测试成功:', data)
  })
  .catch(error => {
    console.log('⚠️ GET请求测试失败（这是预期的）:', error.message)
  })

// 测试POST请求
post('/api/test', { test: 'data' }, { showLoading: false })
  .then(data => {
    console.log('✅ POST请求测试成功:', data)
  })
  .catch(error => {
    console.log('⚠️ POST请求测试失败（这是预期的）:', error.message)
  })

console.log('🧪 request工具函数测试完成')