# 搜索结果页面使用说明

## 页面路径
`/pages/search-result/search-result`

## 页面参数
- `keyword`: 搜索关键词（必填）

## 使用方法

### 从其他页面跳转到搜索结果页

```javascript
// 示例1：从首页搜索栏跳转
wx.navigateTo({
  url: `/pages/search-result/search-result?keyword=${encodeURIComponent(searchKeyword)}`
});

// 示例2：从商城页面跳转
wx.navigateTo({
  url: `/pages/search-result/search-result?keyword=羽毛球拍`
});
```

### 页面功能

1. **顶部分类导航**
   - 支持横向滚动
   - 6个固定分类：羽毛球拍、球鞋、球服、球包、羽毛球、运动必备
   - 点击分类重新筛选商品

2. **排序与筛选**
   - 支持按销量/价格排序
   - 品牌多选筛选弹窗
   - 包含10个羽毛球运动品牌

3. **商品列表**
   - 双列瀑布流布局
   - 支持分页加载
   - 点击商品跳转详情页

4. **交互功能**
   - 下拉刷新
   - 上拉加载更多
   - 空状态提示

## 开发说明

- 页面使用小程序原生开发，无第三方框架依赖
- 支持开发环境mock数据测试
- 响应式设计，适配不同机型
- 遵循项目通用规范和命名约定

## API接口

页面使用的API接口：
- `POST /api/search/products` - 搜索商品
- `POST /api/search/categories` - 获取分类
- `POST /api/search/brands` - 获取品牌

## 注意事项

1. 搜索关键词需要进行URL编码
2. 开发环境会使用mock数据，生产环境需要配置真实接口
3. 图片资源建议使用CDN或本地资源 