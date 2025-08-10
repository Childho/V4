# 退款详情页面调用示例

## 页面路径
```
miniprogram/pages/refund-detail/refund-detail
```

## 跳转方法

### 从订单列表跳转（推荐方式）
```javascript
// 在订单列表页面的退款/售后订单卡片中添加"退款详情"按钮
gotoRefundDetail(orderNo, refundNo) {
  wx.navigateTo({
    url: `/pages/refund-detail/refund-detail?orderNo=${orderNo}&refundNo=${refundNo}`
  });
}

// 调用示例
this.gotoRefundDetail('ORDER123456', 'REFUND789012');
```

### 从其他页面跳转
```javascript
// 通用跳转方法
wx.navigateTo({
  url: '/pages/refund-detail/refund-detail?orderNo=ORDER123456&refundNo=REFUND789012'
});
```

## 页面参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderNo | String | 是 | 订单号，用于识别具体订单 |
| refundNo | String | 是 | 退款编号，用于识别具体退款申请 |

## Mock数据测试

页面会根据`refundNo`的最后一位数字自动选择不同状态的测试数据：

### 测试退款编号示例：
- `REFUND001` → 退款中状态（苹果iPhone 15 Pro Max）
- `REFUND002` → 已完成状态（华为Mate 60 Pro）
- `REFUND003` → 已驳回状态（小米14 Ultra）

### 快速测试方法：
```javascript
// 测试退款中状态
wx.navigateTo({
  url: '/pages/refund-detail/refund-detail?orderNo=ORDER001&refundNo=REFUND001'
});

// 测试已完成状态
wx.navigateTo({
  url: '/pages/refund-detail/refund-detail?orderNo=ORDER002&refundNo=REFUND002'
});

// 测试已驳回状态
wx.navigateTo({
  url: '/pages/refund-detail/refund-detail?orderNo=ORDER003&refundNo=REFUND003'
});
```

## 页面功能

### 主要展示内容：
1. ✅ 订单号和退款编号（支持复制）
2. ✅ 商品信息（图片、标题、规格、价格、数量）
3. ✅ 退款信息（金额、状态、方式、原因、时间）
4. ✅ 退款进度时间线
5. ✅ 联系客服按钮

### 交互功能：
1. ✅ 点击复制订单号/退款编号
2. ✅ 下拉刷新更新数据
3. ✅ 点击联系客服（在线客服/电话客服）
4. ✅ 右上角分享功能

## 样式特色

### 卡片设计
- 圆角阴影卡片，现代简洁
- 清晰的信息分组和层次结构
- 适配不同屏幕尺寸

### 状态标识
- 退款中：蓝色标识 `status-refunding`
- 已完成：绿色标识 `status-completed`  
- 已驳回：红色标识 `status-rejected`

### 时间线设计
- 圆点+连线的经典时间轴样式
- 不同状态用不同颜色标识
- 当前步骤有高亮效果

## 开发规范

### 文件结构
```
pages/refund-detail/
├── refund-detail.js     // 页面逻辑
├── refund-detail.json   // 页面配置
├── refund-detail.wxml   // 页面结构
└── refund-detail.wxss   // 页面样式
```

### 命名规范
- 文件名：小写+中划线 `refund-detail`
- 变量名：小驼峰 `refundInfo`、`productInfo`
- 函数名：小驼峰 `loadRefundDetail`、`copyOrderNo`

### 注释说明
- 所有代码都有详细的中文注释
- 适合0基础用户理解和学习
- 标注了关键业务逻辑和实现思路

## 后续API对接

当后端API准备就绪时，只需要修改以下部分：

```javascript
// 在 loadRefundDetail() 方法中替换
// 当前代码：
const refundData = this.getMockRefundData();

// 替换为：
const refundData = await apiRequest('/api/refund/detail', {
  orderNo: this.data.orderNo,
  refundNo: this.data.refundNo
}, 'POST');
```

API接口需要返回的数据格式参考mock数据结构。 