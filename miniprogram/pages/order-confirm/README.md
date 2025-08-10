# 订单确认页面 API 集成说明

**状态：✅ API集成已完成**

## 更新概览

订单确认页面(`/pages/order-confirm/order-confirm.js`)已完成静态数据向真实API的转换，严格按照接口文档(`/api-docs/order-confirm.md`)进行字段映射。

## 主要变更

### 1. API模块导入
```javascript
import { 
  getOrderPreview, 
  checkStock, 
  calculateOrderAmount, 
  getUserDefaultAddress, 
  getAvailableCoupons, 
  createOrder 
} from '../../api/orderApi.js';
```

### 2. 页面数据结构
- 新增 `loading: true` 状态管理页面加载
- 保持原有数据结构不变，确保页面渲染兼容性

### 3. 核心方法改造

#### initOrderData() - 替代原getOrderData()
- **接口**：`/api/orders/preview` (POST)
- **功能**：获取订单预览信息，包括商品详情、默认地址、可用优惠券等
- **字段映射**：严格按照接口文档进行数据映射
- **错误处理**：提供重试机制和友好的错误提示

#### checkGoodsStock() - 库存验证
- **接口**：`/api/goods/check-stock` (POST) 
- **功能**：验证商品库存是否充足
- **数据转换**：`{ goodsId, quantity }` 格式
- **错误处理**：库存不足时阻止下单并提示用户

#### getUserAddress() - 获取默认地址
- **接口**：`/api/user/address/default` (GET)
- **功能**：获取用户默认收货地址
- **字段转换**：`addressId` → `id` 确保页面兼容性
- **错误处理**：静默处理，不阻断主流程

#### getAvailableCoupons() - 优惠券数量
- **接口**：`/api/user/coupons/available` (GET)
- **功能**：获取当前订单可用优惠券数量
- **参数**：订单金额和商品ID列表
- **错误处理**：设置默认值0，不影响下单流程

#### calculateOrderAmountFromServer() - 服务端金额计算
- **接口**：`/api/orders/calculate-amount` (POST)
- **功能**：服务端重新计算订单金额（地址/优惠券变更时）
- **字段映射**：按照接口文档格式传参
- **错误处理**：失败时保持本地计算结果

#### submitOrder() - 订单提交
- **接口**：`/api/orders/create` (POST)
- **功能**：创建订单并返回订单ID
- **数据结构**：完全按照接口文档格式构建
- **成功处理**：跳转到支付页面或订单列表
- **错误处理**：提供重试机制

### 4. 生命周期优化

#### onShow() - 页面显示处理
- `checkAddressUpdate()` - 检查地址选择更新
- `checkCouponUpdate()` - 检查优惠券选择更新
- 自动触发金额重算

#### onPullDownRefresh() - 下拉刷新
- 重新获取地址和优惠券信息
- 保持当前商品数据不变

## 接口对应关系

| 功能 | 接口地址 | 请求方式 | 状态 |
|-----|---------|---------|-----|
| 订单预览 | `/api/orders/preview` | POST | ✅ 已集成 |
| 库存检查 | `/api/goods/check-stock` | POST | ✅ 已集成 |
| 金额计算 | `/api/orders/calculate-amount` | POST | ✅ 已集成 |
| 默认地址 | `/api/user/address/default` | GET | ✅ 已集成 |
| 优惠券数量 | `/api/user/coupons/available` | GET | ✅ 已集成 |
| 创建订单 | `/api/orders/create` | POST | ✅ 已集成 |

## 错误处理策略

1. **页面加载错误**：提供重试和返回选项
2. **库存检查错误**：阻止下单，要求重新选择商品
3. **地址获取错误**：静默处理，允许用户手动选择
4. **优惠券错误**：设置默认值，不影响主流程
5. **金额计算错误**：使用本地计算，显示异常提示
6. **订单提交错误**：提供重试机制

## 兼容性保证

- 保持原有页面数据结构不变
- 字段缺失时使用合理默认值
- 渐进式降级，API失败不阻断核心流程
- 保持与WXML模板的字段映射一致

## 开发者注意事项

1. 所有API调用都包含详细的console.log，便于调试
2. 错误信息对用户友好，对开发者详细
3. 关键业务逻辑（如库存检查）有严格的错误处理
4. 支持重试机制，提升用户体验
5. 遵循小程序异步编程最佳实践

## 测试建议

1. 测试各种商品组合的订单预览
2. 测试库存不足场景的处理
3. 测试网络异常时的错误处理
4. 测试地址和优惠券选择的数据更新
5. 测试订单提交的成功和失败场景 