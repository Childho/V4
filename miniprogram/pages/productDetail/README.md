# 商品详情页面 API 集成说明

**状态：✅ API集成已完成**

## 更新概览

商品详情页面(`/pages/productDetail/index.js`)已完成静态数据向真实API的转换，严格按照接口文档(`/api-docs/product-detail.md`)进行字段映射。

## 主要变更

### 1. API模块更新
更新 `productApi.js` 中的接口路径和参数，确保与接口文档完全一致：

```javascript
import { 
  getProductDetail, 
  getProductComments, 
  getRelatedProducts, 
  addToCart, 
  getCartCount,
  buyNow 
} from '../../api/productApi';
```

### 2. 核心方法改造

#### getProductDetail() - 商品详情获取
- **接口**：`/api/products/detail` (GET)
- **功能**：获取商品完整详情信息，包括基本信息、规格、图片等
- **字段映射**：严格按照接口文档进行数据映射
- **错误处理**：API失败时返回默认数据结构，避免页面报错
- **默认值处理**：所有字段都有合理的默认值

#### getProductComments() - 商品评论获取
- **接口**：`/api/products/comments` (GET)
- **功能**：获取商品评论列表，包括评分、标签、评论内容
- **参数**：支持分页和筛选类型(all/withImage/positive/negative)
- **错误处理**：失败时返回空评论数据结构

#### getRelatedProducts() - 相关推荐获取
- **接口**：`/api/products/related` (GET)
- **功能**：获取相关推荐商品列表
- **参数**：支持限制推荐数量
- **错误处理**：失败时设置空数组，不显示推荐区域

#### getCartCount() - 购物车数量获取
- **接口**：`/api/cart/count` (GET)
- **功能**：获取用户购物车商品总数量
- **响应处理**：解析`body.cartCount`字段
- **错误处理**：失败时返回0

#### getAvailableCouponCount() - 优惠券数量获取
- **接口**：`/api/coupons/available-count` (GET)
- **功能**：获取当前商品可用的优惠券数量
- **响应处理**：解析`body.availableCount`字段
- **错误处理**：失败时返回0

#### confirmAddToCart() - 添加购物车
- **接口**：`/api/cart/add` (POST)
- **功能**：将选择的商品和规格添加到购物车
- **参数映射**：`{ productId, quantity, specs, remark }`
- **成功处理**：显示成功提示，更新购物车数量，关闭弹窗
- **错误处理**：显示错误信息并提供重试机制

#### confirmBuyNow() - 立即购买
- **接口**：`/api/orders/buy-now` (POST)
- **功能**：获取订单预览信息并跳转到订单确认页
- **参数映射**：`{ productId, quantity, specs, remark }`
- **成功处理**：解析订单数据并跳转到订单确认页
- **错误处理**：显示错误信息并提供重试机制

### 3. 数据结构映射

#### 商品详情结构映射
```javascript
// API响应: result.body.product
// 页面数据: this.data.product
{
  id: productData.id,
  name: productData.name,
  price: productData.price,
  originalPrice: productData.originalPrice,
  description: productData.description,
  brand: productData.brand,
  salesCount: productData.salesCount,
  shippingInfo: productData.shippingInfo,
  images: productData.images,
  specs: productData.specs,
  detailContent: productData.detailContent,
  optionGroups: productData.optionGroups
}
```

#### 评论数据结构映射
```javascript
// API响应: result.body.comments
// 页面数据: this.data.comments
{
  total: commentsData.total,
  averageRating: commentsData.averageRating,
  tags: commentsData.tags,
  list: commentsData.list
}
```

## 接口对应关系

| 功能 | 接口地址 | 请求方式 | 状态 |
|-----|---------|---------|-----|
| 商品详情 | `/api/products/detail` | GET | ✅ 已集成 |
| 商品评论 | `/api/products/comments` | GET | ✅ 已集成 |
| 相关推荐 | `/api/products/related` | GET | ✅ 已集成 |
| 添加购物车 | `/api/cart/add` | POST | ✅ 已集成 |
| 购物车数量 | `/api/cart/count` | GET | ✅ 已集成 |
| 优惠券数量 | `/api/coupons/available-count` | GET | ✅ 已集成 |
| 立即购买 | `/api/orders/buy-now` | POST | ✅ 已集成 |

## 错误处理策略

1. **商品详情加载错误**：返回默认数据结构，显示错误提示，避免页面崩溃
2. **评论加载错误**：返回空评论数据，不影响主要功能
3. **推荐商品错误**：隐藏推荐区域，不阻断用户操作
4. **购物车操作错误**：显示具体错误信息，提供重试机制
5. **购买流程错误**：显示错误对话框，允许用户重试

## 用户体验优化

1. **并行加载**：商品详情、评论、购物车数量等并行获取，提升加载速度
2. **优雅降级**：API失败时提供合理的默认值和错误处理
3. **操作反馈**：所有操作都有明确的成功/失败反馈
4. **重试机制**：关键操作失败时提供重试选项
5. **状态管理**：完善的loading状态和数据状态管理

## 移除的功能

1. **getMockProductData()方法**：移除模拟商品数据
2. **getMockCommentsData()方法**：移除模拟评论数据  
3. **getMockRelatedProducts()方法**：移除模拟推荐数据
4. **备用方案**：移除API失败时的模拟数据备用方案

## 兼容性保证

- 保持原有页面数据结构和字段名不变
- 保持与WXML模板的完整兼容性
- 规格选择、数量选择等交互逻辑保持不变
- 页面跳转和参数传递逻辑保持一致

## 性能优化

1. **并行请求**：多个数据源并行加载
2. **错误隔离**：单个API失败不影响其他功能
3. **缓存策略**：购物车数量等支持本地缓存
4. **按需加载**：相关推荐等非关键数据异步加载

## 开发者注意事项

1. 所有API调用都包含详细的console.log，便于调试
2. 错误信息对用户友好，对开发者详细
3. 字段映射严格按照接口文档执行
4. 支持重试机制，提升用户体验
5. 遵循小程序异步编程最佳实践

## 测试建议

1. 测试不同商品ID的详情加载
2. 测试评论数据的显示和筛选
3. 测试购物车添加和数量更新
4. 测试立即购买和页面跳转
5. 测试网络异常时的错误处理
6. 测试规格选择和数据验证
7. 测试相关推荐的显示和跳转

## 数据流程

### 页面加载流程
1. 检查商品ID参数
2. 并行加载商品详情、评论、购物车数量、优惠券数量
3. 异步加载相关推荐商品
4. 渲染页面数据

### 购物操作流程
1. 用户选择规格和数量
2. 验证选择完整性
3. 调用相应API（添加购物车/立即购买）
4. 处理成功/失败状态
5. 更新页面状态或跳转页面

现在商品详情页面已经完全集成了真实API，提供完整的商品浏览和购买体验！