# 退款详情页面 API 集成说明

**状态：✅ API集成已完成**

## 更新概览

退款详情页面(`/pages/refund-detail/refund-detail.js`)已完成静态数据向真实API的转换，严格按照接口文档(`/api-docs/refund-detail.md`)进行字段映射。

## 主要变更

### 1. API模块创建
新建 `refundApi.js` 包含退款详情接口：
```javascript
import { getRefundDetail } from '../../api/refundApi.js';
```

### 2. 核心方法改造

#### loadRefundDetail() - 退款详情加载
- **接口**：`/api/refund/detail` (POST)
- **功能**：根据订单号和退款编号获取退款详细信息
- **参数映射**：`{ orderNo, refundNo }`
- **响应处理**：解析`body.productInfo`、`body.refundInfo`、`body.progressList`
- **错误处理**：API失败时显示错误对话框并提供重试机制

#### processRefundData() - 数据处理优化
- **功能**：处理API返回数据，确保字段映射与接口文档一致
- **默认值处理**：所有字段都有合理的默认值，避免页面报错
- **数据验证**：验证数据结构的完整性

### 3. 数据结构映射

#### 接口响应结构
```javascript
{
  "error": 0,
  "body": {
    "productInfo": {
      "image": "https://img.alicdn.com/tfs/TB1V4g3d.H1gK0jSZSyXXXtlpXa-400-400.png",
      "title": "苹果iPhone 15 Pro Max 1TB 天然钛金色",
      "spec": "天然钛金色 1TB",
      "quantity": 1,
      "price": 9999.00
    },
    "refundInfo": {
      "amount": 9999.00,
      "status": "refunding",
      "statusText": "退款中",
      "refundMethod": "original",
      "refundMethodText": "原路退回",
      "reason": "不想要了",
      "applyTime": "2024-01-16 10:30:25",
      "processTime": "2024-01-16 14:20:30",
      "completeTime": ""
    },
    "progressList": [...]
  },
  "message": "获取退款详情成功",
  "success": true
}
```

#### 页面数据结构
- `productInfo`: 商品信息，包含图片、标题、规格、数量、价格
- `refundInfo`: 退款信息，包含金额、状态、方式、原因、时间节点
- `progressList`: 退款进度时间线数组

### 4. 错误处理策略

#### 网络错误处理
- **显示方式**：使用`wx.showModal`显示友好的错误对话框
- **重试机制**：提供"重试"按钮，允许用户重新加载数据
- **状态管理**：设置`hasError`和`errorMessage`状态

#### 数据缺失处理
- **商品信息**：缺失时显示"商品信息缺失"
- **退款信息**：使用默认状态"退款中"和"原路退回"
- **进度列表**：确保数组结构，避免渲染错误

### 5. 用户体验优化

#### 加载状态管理
- `loading: true` - 控制页面加载状态
- 加载完成后自动关闭loading状态

#### 下拉刷新优化
- 重置错误状态
- 重新调用API获取最新数据
- 自动停止刷新动画

#### 操作反馈
- 复制功能的成功/失败反馈
- 网络错误的友好提示
- 重试机制的引导

## 接口对应关系

| 功能 | 接口地址 | 请求方式 | 状态 |
|-----|---------|---------|-----|
| 退款详情 | `/api/refund/detail` | POST | ✅ 已集成 |

## 字段映射详情

### 请求参数
```javascript
{
  orderNo: this.data.orderNo,    // 订单编号
  refundNo: this.data.refundNo   // 退款编号
}
```

### 响应数据映射
```javascript
// 商品信息映射
productInfo: {
  image: refundData.productInfo?.image || '',
  title: refundData.productInfo?.title || '商品信息缺失',
  spec: refundData.productInfo?.spec || '',
  quantity: refundData.productInfo?.quantity || 0,
  price: refundData.productInfo?.price || 0
}

// 退款信息映射
refundInfo: {
  amount: refundData.refundInfo?.amount || 0,
  status: refundData.refundInfo?.status || 'refunding',
  statusText: refundData.refundInfo?.statusText || '退款中',
  refundMethod: refundData.refundInfo?.refundMethod || 'original',
  refundMethodText: refundData.refundInfo?.refundMethodText || '原路退回',
  reason: refundData.refundInfo?.reason || '',
  applyTime: refundData.refundInfo?.applyTime || '',
  processTime: refundData.refundInfo?.processTime || '',
  completeTime: refundData.refundInfo?.completeTime || ''
}

// 进度列表映射
progressList: Array.isArray(refundData.progressList) ? refundData.progressList : []
```

## 移除的功能

1. **getMockRefundData()方法**：移除模拟退款数据生成方法
2. **静态Mock数据**：移除所有硬编码的退款状态数据
3. **数据选择逻辑**：移除根据退款编号选择Mock数据的逻辑

## 兼容性保证

- 保持原有页面数据结构和字段名不变
- 保持与WXML模板的完整兼容性
- 退款状态显示逻辑保持一致
- 进度时间线渲染逻辑保持不变

## 安全性考虑

1. **权限验证**：API接口需要用户登录token
2. **数据校验**：验证用户只能查看自己的退款记录
3. **参数验证**：订单号和退款编号格式验证
4. **错误信息**：不泄露敏感的系统信息

## 性能优化

1. **错误恢复**：API失败不完全阻断用户操作
2. **状态缓存**：避免重复的网络请求
3. **加载优化**：合理的loading状态管理
4. **内存管理**：页面卸载时清理资源

## 开发者注意事项

1. 所有API调用都包含详细的console.log，便于调试
2. 错误信息对用户友好，对开发者详细
3. 字段映射严格按照接口文档执行
4. 支持重试机制，提升用户体验
5. 遵循小程序异步编程最佳实践

## 测试建议

1. 测试不同退款状态的数据显示
2. 测试网络异常时的错误处理
3. 测试参数缺失时的错误提示
4. 测试下拉刷新功能
5. 测试复制功能的交互
6. 测试权限验证的场景

## 错误码处理

根据接口文档，处理以下错误码：
- `1001`: 退款记录不存在
- `1002`: 订单号格式错误
- `1003`: 退款编号格式错误
- `1004`: 无权限查看该退款记录
- `5000`: 服务器内部错误

## 数据流程

### 页面加载流程
1. 获取页面参数（orderNo, refundNo）
2. 验证参数完整性
3. 调用API获取退款详情
4. 处理数据并渲染页面

### 错误处理流程
1. API调用失败
2. 设置错误状态
3. 显示错误对话框
4. 提供重试选项
5. 用户确认后重新加载

现在退款详情页面已经完全集成了真实API，可以显示准确的退款信息和处理进度！