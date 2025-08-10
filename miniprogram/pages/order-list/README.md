# 订单列表页面 API 集成说明

**状态：✅ API集成已完成**

## 更新概览

订单列表页面(`/pages/order-list/index.js`)已完成静态数据向真实API的转换，严格按照接口文档(`/api-docs/order-list.md`)进行字段映射。

## 主要变更

### 1. API模块导入
```javascript
import { 
  getOrderList, 
  cancelOrder, 
  confirmReceive, 
  urgeShipping, 
  payOrder, 
  deleteOrder, 
  getOrderLogistics 
} from '../../api/orderApi.js';
```

### 2. 核心方法改造

#### loadOrderList() - 订单列表加载
- **接口**：`/api/order/list` (GET)
- **功能**：分页获取用户订单列表，支持状态筛选
- **参数映射**：`{ page, pageSize, status }`
- **响应处理**：解析`body.orders.list`和`body.pagination`
- **错误处理**：API失败时提供重试机制，不再使用备用硬编码数据

#### 订单操作方法集成

##### onCancelOrder() - 取消订单
- **接口**：`/api/order/cancel` (POST)
- **功能**：取消待付款订单
- **参数**：`{ orderId, reason }`
- **成功处理**：显示取消成功信息，刷新订单列表

##### onConfirmReceive() - 确认收货
- **接口**：`/api/order/confirm-receive` (POST)
- **功能**：确认收到商品，状态变为待评价
- **参数**：`{ orderId }`
- **成功处理**：显示确认成功信息，刷新订单列表

##### onUrgeShipping() - 催发货
- **接口**：`/api/order/urge-shipping` (POST)
- **功能**：催促商家尽快发货
- **参数**：`{ orderId }`
- **成功处理**：显示催发货成功信息

##### onPayOrder() - 订单支付
- **接口**：`/api/order/pay` (POST)
- **功能**：获取微信支付参数并调起支付
- **参数**：`{ orderId, paymentMethod }`
- **支付流程**：获取支付参数 → 调起微信支付 → 处理支付结果
- **错误处理**：支付失败提供重试机制

##### onDeleteOrder() - 删除订单
- **接口**：`/api/order/delete` (DELETE)
- **功能**：删除已完成或已取消的订单
- **参数**：`{ orderId }`
- **成功处理**：显示删除成功信息，刷新订单列表

### 3. 页面生命周期优化

#### onShow() - 页面显示
- 移除测试API调用
- 改为刷新订单数据，确保显示最新状态

#### onLoad() - 页面加载
- 保持原有tab参数处理逻辑
- 直接调用真实API加载数据

### 4. 数据结构映射

#### 接口响应结构
```javascript
{
  "error": 0,
  "body": {
    "orders": {
      "total": 156,
      "list": [订单数组]
    },
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 156,
      "totalPages": 16,
      "hasMore": true
    }
  },
  "success": true
}
```

#### 页面数据结构
- `orderList`: 对应`body.orders.list`
- `hasMore`: 对应`body.pagination.hasMore`
- `pageParams`: 分页参数控制

## 接口对应关系

| 功能 | 接口地址 | 请求方式 | 状态 |
|-----|---------|---------|-----|
| 订单列表 | `/api/order/list` | GET | ✅ 已集成 |
| 取消订单 | `/api/order/cancel` | POST | ✅ 已集成 |
| 确认收货 | `/api/order/confirm-receive` | POST | ✅ 已集成 |
| 催发货 | `/api/order/urge-shipping` | POST | ✅ 已集成 |
| 订单支付 | `/api/order/pay` | POST | ✅ 已集成 |
| 删除订单 | `/api/order/delete` | DELETE | ✅ 已集成 |
| 物流信息 | `/api/order/logistics` | GET | ✅ 已导入 |

## 错误处理策略

1. **订单列表加载错误**：显示重试对话框，用户可选择重试或取消
2. **订单操作错误**：显示具体错误信息，对于关键操作提供重试机制
3. **支付错误**：区分用户取消和支付失败，提供相应的提示和重试选项
4. **网络异常**：友好的错误提示，引导用户检查网络连接

## 用户体验优化

1. **加载状态管理**：订单加载时显示loading状态
2. **操作反馈**：每个操作都有明确的成功/失败反馈
3. **重试机制**：关键操作失败时提供重试选项
4. **支付流程优化**：完整的微信支付集成，处理各种支付状态
5. **列表刷新**：操作成功后自动刷新列表，确保数据一致性

## 移除的功能

1. **testApiCall()方法**：移除测试API调用方法
2. **备用硬编码数据**：完全移除静态订单数据，改为API驱动
3. **模拟延迟**：移除支付模拟延迟，改为真实API调用

## 支付集成

### 微信支付流程
1. 用户点击"立即付款"
2. 调用`/api/order/pay`获取支付参数
3. 调起`wx.requestPayment`微信支付
4. 处理支付成功/失败/取消状态
5. 支付成功后刷新订单列表

### 支付错误处理
- **用户取消**：显示"支付已取消"
- **支付失败**：显示"支付失败，请重试"并提供重试选项
- **网络错误**：显示具体错误信息和重试机制

## 兼容性保证

- 保持原有页面结构和数据字段名
- 保持与WXML模板的完整兼容性
- 订单操作按钮逻辑保持不变
- Tab切换和分页逻辑保持一致

## 性能优化

1. **智能刷新**：只在必要时刷新订单列表
2. **分页加载**：支持上拉加载更多订单
3. **状态缓存**：避免重复的网络请求
4. **错误恢复**：API失败不完全阻断用户操作

## 开发者注意事项

1. 所有API调用都包含详细的console.log，便于调试
2. 错误信息对用户友好，对开发者详细
3. 支付流程严格按照微信小程序支付规范
4. 订单状态变更后自动刷新列表
5. 遵循小程序异步编程最佳实践

## 测试建议

1. 测试各种订单状态的列表加载
2. 测试订单操作（取消、确认收货、催发货等）
3. 测试微信支付的完整流程
4. 测试网络异常时的错误处理
5. 测试分页加载和tab切换功能
6. 测试订单删除和数据刷新 