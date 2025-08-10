# 商城页面使用说明

## API集成完成情况

✅ **已完成静态数据到真实API的转换**

### 主要变更

1. **导入API模块**
   ```javascript
   const mallApi = require('../../api/mallApi');
   ```

2. **数据初始化**
   - 所有静态Mock数据已移除
   - 数据通过API动态获取
   - 初始值设为空数组，避免页面报错

3. **API方法映射**
   - `loadSeckillProducts()` → `mallApi.getSeckillProducts()`
   - `loadBannerList()` → `mallApi.getBannerList()`
   - `loadProductGroups()` → `mallApi.getProductGroups()`
   - `getCartCount()` → `mallApi.getCartCount()`
   - `quickSearchProducts()` → `mallApi.searchProducts()`

## 错误处理机制

### 1. 加载错误处理
```javascript
// 每个API调用都包含完整的错误处理
mallApi.getSeckillProducts()
  .then(data => {
    // 确保数据结构正确
    const seckillProducts = data.seckillProducts || [];
    this.setData({ seckillProducts });
  })
  .catch(error => {
    // 设置默认空数据，避免页面崩溃
    this.setData({ seckillProducts: [] });
    // 显示用户友好的错误提示
    wx.showToast({ title: '获取秒杀商品失败', icon: 'none' });
  });
```

### 2. 购物车特殊处理
- API失败时使用本地存储作为备用
- 不显示错误提示，避免影响用户体验

### 3. 搜索错误处理
- 静默处理搜索失败
- 不中断用户的正常操作流程

## 数据结构映射

### 轮播图数据 (bannerList)
```javascript
// API返回格式
{
  "bannerList": [
    {
      "id": 1,                    // 轮播图ID
      "imageUrl": "...",          // 图片URL
      "link": "..."               // 跳转链接
    }
  ]
}
```

### 秒杀商品数据 (seckillProducts)
```javascript
// API返回格式
{
  "seckillProducts": [
    {
      "id": 1,                    // 商品ID
      "title": "...",             // 商品标题
      "imageUrl": "...",          // 商品图片URL
      "originalPrice": 899,       // 原价
      "seckillPrice": 599         // 秒杀价
    }
  ]
}
```

### 商品分组数据 (productGroups)
```javascript
// API返回格式
{
  "productGroups": [
    {
      "groupId": "racket",        // 分组ID
      "groupName": "羽毛球拍",    // 分组名称
      "groupDesc": "...",         // 分组描述
      "products": [               // 商品列表
        {
          "id": 101,              // 商品ID
          "name": "...",          // 商品名称
          "imageUrl": "...",      // 图片URL
          "price": 899,           // 价格
          "salesCount": 268,      // 销量
          "tag": "热销"           // 商品标签
        }
      ]
    }
  ]
}
```

### 购物车数量 (cartCount)
```javascript
// API返回格式
{
  "cartCount": 3                  // 购物车商品数量
}
```

## 使用注意事项

### 1. 页面加载流程
1. `onLoad()` - 页面初始化，调用数据加载方法
2. `initPageData()` - 批量加载所有数据
3. `onShow()` - 页面显示时更新购物车数量

### 2. 性能优化
- 使用 `wx.showLoading()` 显示加载状态
- 错误时快速回退到空数据状态
- 购物车数量使用本地存储备用

### 3. 开发调试
- 所有API调用都有详细的console.log输出
- 可以在开发者工具中查看网络请求和响应
- 错误信息会同时显示在控制台和用户界面

## 后续扩展建议

### 1. 分页加载
当前商品分组数据没有分页，后续可以考虑添加：
```javascript
loadMoreProducts(groupId) {
  // 实现商品分组的分页加载
}
```

### 2. 缓存机制
可以添加数据缓存，减少重复请求：
```javascript
// 缓存轮播图数据30分钟
if (this.bannerCache && Date.now() - this.bannerCacheTime < 30 * 60 * 1000) {
  return this.bannerCache;
}
```

### 3. 离线处理
可以考虑添加离线数据支持：
```javascript
// 保存数据到本地存储作为离线备用
wx.setStorageSync('mallData', { bannerList, seckillProducts, productGroups });
```

## 测试指导

### 1. 功能测试
- [ ] 页面正常加载所有数据
- [ ] 轮播图可以正常点击跳转
- [ ] 秒杀商品展示正确
- [ ] 商品分组数据完整
- [ ] 购物车数量显示正确
- [ ] 搜索功能正常工作

### 2. 异常测试
- [ ] 网络断开时的错误处理
- [ ] API返回错误时的用户提示
- [ ] 数据为空时的界面展示
- [ ] 本地存储异常时的处理

### 3. 性能测试
- [ ] 页面加载速度
- [ ] 内存使用情况
- [ ] 网络请求效率 