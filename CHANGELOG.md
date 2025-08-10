# 首页代码重构日志

## 2024年重构 - 静态数据替换为API调用

### 主要变更

#### 1. 数据结构优化
- ✅ 移除所有硬编码的静态数据
- ✅ 将轮播图、活动、精选装备数据改为动态获取
- ✅ 添加用户信息数据字段
- ✅ 新增加载状态管理

#### 2. API集成
根据接口文档实现了以下API调用：

##### 轮播图接口 `/api/banners`
- 请求方式：GET
- 响应格式：符合接口文档标准
- 错误处理：网络失败和业务失败分别处理

##### 活动接口 `/api/activities`
- 请求方式：GET  
- 请求参数：`limit=2, isRecommended=true, featured=true`
- 功能：获取首页精选活动（后台运营手动设置）

##### 精选装备接口 `/api/featured-equipment`
- 请求方式：GET
- 请求参数：`limit=4, isFeatured=true`
- 功能：获取首页精选商品

##### 用户信息接口 `/api/user/info`
- 请求方式：GET
- 认证：Bearer Token
- 功能：获取登录用户的会员信息、积分等

##### 客服统计接口 `/api/analytics/customer-service`
- 请求方式：POST
- 功能：记录用户使用客服的行为统计

#### 3. 代码规范化

##### 配置文件管理
- 📄 `config/index.js` - API地址配置
- 📄 `config/constants.js` - 常量定义

##### 常量使用
- ✅ API状态码常量化
- ✅ 响应字段名常量化  
- ✅ 加载状态字段常量化
- ✅ 本地存储键名常量化
- ✅ 搜索参数常量化
- ✅ 轮播图类型常量化

#### 4. 搜索功能优化
- ✅ 支持空关键词搜索（兜底逻辑）
- ✅ 搜索参数符合接口文档格式
- ✅ URL参数包含完整的分页和排序信息

#### 5. 用户体验改进
- ✅ 加载状态显示
- ✅ 错误提示优化
- ✅ 数据重试机制
- ✅ 网络异常处理

#### 6. 安全性提升
- ✅ Token过期自动清理
- ✅ 用户ID安全存储
- ✅ API错误状态码检查

---

## 🔧 正式API对接优化 (最新更新)

### 7. 环境配置管理

#### 多环境支持
- 📄 `config/index.js` - 支持开发、测试、生产环境切换
- 📄 `config/env.example.js` - 环境配置示例和说明文档
- 🔧 一键切换环境：修改 `currentEnv` 变量即可

```javascript
// 当前环境设置 - 根据实际情况修改
const currentEnv = 'production' // 'development' | 'testing' | 'production'
```

#### 环境配置说明
| 环境 | API地址 | 超时时间 | 调试模式 | 用途 |
|------|---------|----------|----------|------|
| development | https://dev-api.example.com | 10秒 | 开启 | 本地开发 |
| testing | https://test-api.example.com | 8秒 | 开启 | 测试验证 |
| production | https://api.example.com | 6秒 | 关闭 | 正式发布 |

### 8. 统一请求工具

#### 新增 `utils/request.js`
- 🚀 统一的API请求封装
- 🔐 自动token认证处理
- 🔄 自动重试机制
- 📝 详细的请求日志
- ⚡ HTTP2和QUIC支持

#### 功能特性
```javascript
// 简化的API调用方式
get('/api/banners', {}, { showLoading: false })
post('/api/analytics/customer-service', data, { needAuth: true })
```

- ✅ **自动认证** - `needAuth: true` 自动添加Bearer Token
- ✅ **错误处理** - 统一处理网络错误和业务错误
- ✅ **重试机制** - 网络失败自动重试，可配置次数和延迟
- ✅ **加载提示** - 可选择是否显示系统loading
- ✅ **日志记录** - 开发环境自动记录请求和响应详情

### 9. 错误处理升级

#### 智能错误处理
- 🎯 **分类处理** - 区分网络错误、业务错误、认证错误
- 🔄 **自动重试** - 网络失败时自动重试（可配置）
- 🛡️ **认证保护** - Token过期自动清理并提示重新登录
- 💬 **友好提示** - 根据错误类型显示合适的用户提示

#### 错误类型说明
| 错误类型 | 处理方式 | 用户提示 |
|----------|----------|----------|
| 网络错误 | 自动重试 | "网络连接失败，请检查网络" |
| 业务错误 | 显示服务器消息 | 服务器返回的具体错误信息 |
| 认证失败 | 清除token | "登录已过期，请重新登录" |
| 响应格式错误 | 记录日志 | "服务器响应格式错误" |

### 10. 性能优化

#### 网络性能
- ⚡ 启用HTTP2加速网络请求
- 🚀 启用QUIC协议提升连接速度
- ⏱️ 分环境配置合理的超时时间
- 🔄 智能重试避免无效请求

#### 代码性能
- 📦 模块化的请求工具，减少重复代码
- 🎯 Promise链式调用，避免回调地狱
- 📝 开发环境才输出详细日志，生产环境提升性能

### 11. 开发体验

#### 调试支持
```javascript
// 开发环境自动输出详细日志
console.log('📤 API请求:', {
  URL: 'https://api.example.com/api/banners',
  方法: 'GET',
  数据: {},
  需要认证: false
})

console.log('📥 API响应:', {
  URL: 'https://api.example.com/api/banners', 
  状态码: 200,
  数据: { banners: [...] }
})
```

#### 配置指南
- 📚 详细的环境配置示例 (`config/env.example.js`)
- 🔧 常见问题解决方案
- 📖 API路径说明文档
- 🎯 一步步配置指引

### 代码注释说明

所有新增代码都包含详细的中文注释，方便程序新手理解：

```javascript
// 引入API配置 - 用于获取服务器地址
const { config } = require('../../config/index.js')

// 引入常量配置 - 避免硬编码，便于维护
const { API_CONSTANTS } = require('../../config/constants.js')

// 引入统一请求工具 - 简化API调用，统一错误处理
const { get, post } = require('../../utils/request.js')

// 使用统一请求工具 - 自动处理认证、重试、错误等
get('/api/banners', {}, {
  showLoading: false  // 使用自己的加载状态，不显示系统loading
})
.then((data) => {
  // 请求成功，data已经是解析后的业务数据
  console.log('轮播图数据获取成功:', data)
})
.catch((error) => {
  // 请求失败，错误已在request工具中统一处理
  console.error('获取轮播图失败:', error)
})
```

### 第一性原理解释

为什么要这样重构？

1. **数据来源统一** - 将分散的静态数据统一为API获取，便于数据管理和更新
2. **前后端分离** - 前端专注展示逻辑，后端负责数据逻辑，职责清晰
3. **常量化管理** - 将魔法数字和字符串提取为常量，避免拼写错误和重复代码
4. **错误处理规范** - 统一的错误处理模式，提升用户体验
5. **可维护性** - 模块化的代码结构，便于后期功能扩展和维护
6. **环境隔离** - 开发、测试、生产环境独立配置，避免环境混乱
7. **请求标准化** - 统一的请求封装，减少重复代码，提高开发效率

### 兼容性说明
- ✅ 向下兼容现有功能
- ✅ 支持token过期重新登录
- ✅ 网络异常时的用户提示
- ✅ 数据为空时的重试机制
- ✅ 多环境无缝切换
- ✅ 旧的wx.request调用方式仍然可用

### 快速配置指南

#### 1. 配置正式API地址
编辑 `miniprogram/config/index.js`：
```javascript
// 修改这里的API地址为您的正式服务器地址
production: {
  apiBaseUrl: 'https://api.yourcompany.com',  // 替换为您的API地址
  timeout: 6000,
  enableMock: false,
  debug: false
}
```

#### 2. 切换到生产环境
```javascript
// 修改当前环境为生产环境
const currentEnv = 'production'
```

#### 3. 小程序后台配置
- 在小程序后台添加request合法域名
- 确保API地址使用HTTPS协议
- 检查域名备案状态

### 测试建议
1. 测试网络正常情况下的数据加载
2. 测试网络异常时的错误处理
3. 测试登录状态的自动检查
4. 测试搜索功能的参数传递
5. 测试客服统计功能的数据记录
6. 测试多环境切换功能
7. 测试自动重试机制
8. 测试token过期处理 