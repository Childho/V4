# 商城页面API测试说明

## 修复问题总结

### 🐛 发现的问题
1. **模块导入错误**: `mallApi.js` 试图从 `./request` 导入，但实际应该从 `./utils/request` 导入
2. **缺少Mock数据**: Mock数据中没有商城相关的API端点
3. **API地址未配置**: 需要正确的API基础地址

### ✅ 已完成的修复

1. **修正导入路径**
   ```javascript
   // 修改前：
   const { apiRequest } = require('./request');
   
   // 修改后：
   const { apiRequest } = require('./utils/request');
   ```

2. **添加Mock数据**
   - `/api/mall/banners` - 轮播图数据
   - `/api/mall/seckill` - 秒杀商品数据  
   - `/api/mall/product-groups` - 商品分组数据
   - `/api/mall/cart/count` - 购物车数量
   - `/api/mall/search` - 搜索功能

3. **增强调试日志**
   - 添加详细的API调用日志
   - 成功和失败的区分标识
   - 请求地址和参数的完整记录

4. **配置优化**
   - 更新API基础地址
   - 临时启用Mock数据进行测试

## 测试验证步骤

### 1. 查看控制台日志
打开小程序开发者工具，进入商城页面，在控制台中应该看到：

```
🚀 [mallApi] 调用获取秒杀商品接口
🚀 [mallApi] 请求地址: /api/mall/seckill
🎭 [使用模拟数据] /api/mall/seckill {}
🎭 [模拟数据返回] {seckillProducts: [...]}
✅ [mallApi] 获取秒杀商品成功: {...}
```

### 2. 检查网络请求
在开发者工具的Network面板中，应该能看到API请求，或者看到Mock数据的使用日志。

### 3. 页面数据渲染
商城页面应该能正常显示：
- 轮播图
- 秒杀商品列表
- 商品分组数据
- 购物车数量

## 切换到真实API

当准备使用真实API时，按以下步骤操作：

1. **配置真实API地址**
   ```javascript
   // config/index.js
   development: {
     apiBaseUrl: 'https://你的真实API地址',
     enableMock: false,  // 禁用Mock数据
   }
   ```

2. **移除Mock数据**（可选）
   从 `utils/request.js` 中移除商城相关的Mock数据

3. **验证字段映射**
   确保真实API返回的数据结构与接口文档一致

## 故障排除

### 如果仍然没有网络请求
1. 检查控制台是否有错误日志
2. 确认 `mallApi` 模块是否正确导入
3. 验证页面生命周期函数是否被调用

### 如果数据格式不匹配
1. 检查API返回的数据结构
2. 对比接口文档的字段定义
3. 在API方法中添加数据格式验证

### 如果网络请求失败
1. 检查API地址是否正确
2. 验证网络连接
3. 查看服务器端日志 