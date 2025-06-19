# 订单确认页面说明

## 页面功能
该页面是微信小程序的订单确认页面，用户从购物车结算后进入此页面确认订单信息并提交。

## 页面结构
- `order-confirm.wxml` - 页面结构文件
- `order-confirm.wxss` - 页面样式文件  
- `order-confirm.js` - 页面逻辑文件
- `order-confirm.json` - 页面配置文件

## 主要功能模块

### 1. 收货地址模块
- 显示收件人姓名、电话、详细地址
- 如果还没有地址，显示"请选择收货地址"
- 点击跳转地址管理页面

### 2. 商品列表模块
- 每个商品包含：商品图片、名称、规格、数量、实付价
- 样式紧凑美观，不会超出屏幕
- 支持多个商品展示

### 3. 优惠券选择模块
- 展示当前可用优惠券数量
- 默认显示"未使用"状态
- 点击跳转优惠券选择页面

### 4. 备注模块
- 输入框，提示"可填写备注内容（选填）"
- 最大输入长度100字符
- 内容实时保存到页面数据中

### 5. 金额明细模块
- 显示商品金额
- 显示优惠券优惠（如果有选择）
- 显示运费（默认免运费）
- 实付金额使用红色字体、加粗、高亮显示

## 页面跳转方式

### 从购物车进入
```javascript
// 购物车页面跳转示例
const selectedGoods = [
  {
    id: 1,
    name: '商品名称',
    image: '商品图片URL',
    spec: '商品规格',
    price: 15.00,
    quantity: 1
  }
];

wx.navigateTo({
  url: `/pages/order-confirm/order-confirm?goods=${encodeURIComponent(JSON.stringify(selectedGoods))}`
});
```

### 从商品详情页进入
```javascript
// 商品详情页直接下单
const orderGoods = [{
  id: productId,
  name: productName,
  image: productImage,
  spec: selectedSpec,
  price: productPrice,
  quantity: buyQuantity
}];

wx.navigateTo({
  url: `/pages/order-confirm/order-confirm?goods=${encodeURIComponent(JSON.stringify(orderGoods))}`
});
```

## 数据流程

### 页面加载时
1. 获取传入的商品数据
2. 获取用户收货地址（从本地存储）
3. 获取可用优惠券数量
4. 计算商品总金额

### 用户操作
1. 选择收货地址 → 跳转地址管理页面
2. 选择优惠券 → 跳转优惠券选择页面  
3. 填写备注 → 实时更新数据
4. 提交订单 → 调用API接口

### 页面返回时
1. 检查地址更新（从本地存储）
2. 检查优惠券选择更新（从本地存储）
3. 重新计算金额

## 接口调用

### 订单创建接口
```javascript
import { createOrder } from '../../api/orderApi.js';

const orderData = {
  goods: this.data.orderGoods,
  address: this.data.addressInfo,
  coupon: this.data.selectedCoupon,
  remark: this.data.remark,
  amounts: {
    goodsAmount: this.data.totalGoodsAmount,
    shippingFee: this.data.shippingFee,
    finalAmount: this.data.finalAmount
  }
};

const result = await createOrder(orderData);
```

### 库存检查接口
```javascript
import { checkStock } from '../../api/orderApi.js';

const stockData = goods.map(item => ({
  goodsId: item.id,
  quantity: item.quantity
}));

const stockResult = await checkStock(stockData);
```

## 样式特点
- 采用现代化卡片式设计
- 支持深色模式适配
- 响应式布局，兼容不同屏幕尺寸
- 底部固定操作栏，适配安全区域
- 优雅的动画过渡效果

## 注意事项
1. 必须先选择收货地址才能提交订单
2. 商品数据不能为空
3. 提交订单时会显示加载状态
4. 支持下拉刷新重新获取数据
5. 页面卸载时会清理相关数据

## 依赖页面
- `/pages/address-list/address-list` - 地址管理页面
- `/pages/coupon-list/coupon-list` - 优惠券选择页面
- `/pages/payment/payment` - 支付页面

## 本地存储使用
- `selectedAddress` - 选择的收货地址
- `selectedCoupon` - 选择的优惠券（临时存储）
- `cartSelectedItems` - 购物车选中商品（提交后清除） 