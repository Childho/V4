# 订单确认页面接口文档（已对齐order-confirm.js字段，含详细注释）

## 获取订单预览信息

**接口名称：** 获取订单预览信息
**功能描述：** 获取订单确认页面所需的商品信息、地址信息、优惠券等数据
**接口地址：** /api/orders/preview
**请求方式：** POST

### 功能说明
用户从购物车结算或商品详情页"立即购买"进入订单确认页时，获取订单预览信息。包含商品详情、默认收货地址、可用优惠券数量、运费计算等。**此接口需要用户登录状态。**

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant Auth as 认证服务
    participant DB as 数据库
    Client->>Server: 请求订单预览
    Server->>Auth: 验证用户登录状态
    alt 用户已登录
        Auth-->>Server: 验证通过
        Server->>DB: 查询商品信息
        Server->>DB: 查询用户默认地址
        Server->>DB: 查询可用优惠券
        Server->>Server: 计算商品金额和运费
        Server-->>Client: 返回订单预览数据
    else 用户未登录
        Auth-->>Server: 验证失败
        Server-->>Client: 返回需要登录
        Client->>Client: 跳转登录页面
    end
```

### 请求参数
```json
{
  "goods": [
    {
      "id": 1, // 商品ID
      "quantity": 1 // 购买数量
    }
  ],
  "source": "cart" // 来源（cart购物车/detail商品详情）
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| goods | array | 是 | 商品列表 |  |
| goods[].id | int | 是 | 商品ID | 1 |
| goods[].quantity | int | 是 | 购买数量 | 1 |
| source | string | 是 | 来源（cart购物车/detail商品详情） | cart |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "orderGoods": [
      {
        "id": 1, // 商品ID
        "name": "NCS#75速【多啦A梦黄】【3只装】", // 商品名称
        "image": "https://via.placeholder.com/120x120/ff9800/fff?text=商品", // 商品图片
        "spec": "黄色 3只装", // 规格描述
        "price": 15.00, // 单价
        "quantity": 1 // 数量
      }
    ],
    "addressInfo": {
      "id": "addr_001", // 地址ID
      "name": "张三", // 收件人姓名
      "phone": "138****5678", // 联系电话
      "address": "广东省深圳市南山区科技园南区" // 完整地址
    },
    "availableCoupons": 3, // 可用优惠券数量
    "totalGoodsAmount": 15.00, // 商品总金额
    "shippingFee": 0.00, // 运费
    "finalAmount": 15.00 // 最终应付金额
  },
  "message": "获取订单预览成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录 | 0 |
| body | object | 是 | 响应数据 |  |
| body.orderGoods | array | 是 | 商品列表 |  |
| body.orderGoods[].id | int | 是 | 商品ID | 1 |
| body.orderGoods[].name | string | 是 | 商品名称 | NCS#75速【多啦A梦黄】 |
| body.orderGoods[].image | string | 是 | 商品图片 | https://via.placeholder.com/120x120/ff9800/fff?text=商品 |
| body.orderGoods[].spec | string | 否 | 规格描述 | 黄色 3只装 |
| body.orderGoods[].price | number | 是 | 单价 | 15.00 |
| body.orderGoods[].quantity | int | 是 | 数量 | 1 |
| body.addressInfo | object | 否 | 默认收货地址 |  |
| body.addressInfo.id | string | 是 | 地址ID | addr_001 |
| body.addressInfo.name | string | 是 | 收件人姓名 | 张三 |
| body.addressInfo.phone | string | 是 | 联系电话 | 138****5678 |
| body.addressInfo.address | string | 是 | 完整地址 | 广东省深圳市南山区科技园南区 |
| body.availableCoupons | int | 是 | 可用优惠券数量 | 3 |
| body.totalGoodsAmount | number | 是 | 商品总金额 | 15.00 |
| body.shippingFee | number | 是 | 运费 | 0.00 |
| body.finalAmount | number | 是 | 最终应付金额 | 15.00 |
| message | string | 是 | 响应消息 | 获取订单预览成功 |
| success | bool | 是 | 是否成功 | true |

**注释：**
- 商品主键为id，所有字段与order-confirm.js完全一致。
- 只保留JS实际用到的字段。
- 每个字段后均有注释，便于理解。

---

## 检查商品库存

**接口名称：** 检查商品库存
**功能描述：** 验证所选商品的库存是否充足，确保可以正常下单
**接口地址：** /api/goods/check-stock
**请求方式：** POST

### 功能说明
在订单确认页面加载时检查所有商品的库存状态，防止下单时出现库存不足的情况。如果库存不足，需要提示用户并阻止下单。

### 请求参数
```json
{
  "goods": [
    {
      "id": 1, // 商品ID
      "quantity": 1 // 购买数量
    }
  ]
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| goods | array | 是 | 需要检查的商品列表 |  |
| goods[].id | int | 是 | 商品ID | 1 |
| goods[].quantity | int | 是 | 购买数量 | 1 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "allInStock": true, // 是否全部有库存
    "details": [
      {
        "id": 1, // 商品ID
        "inStock": true, // 是否有库存
        "availableStock": 50, // 可用库存数量
        "requestedQuantity": 1 // 请求数量
      }
    ]
  },
  "message": "库存检查完成",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0表示成功 | 0 |
| body | object | 是 | 响应数据 |  |
| body.allInStock | bool | 是 | 是否全部有库存 | true |
| body.details | array | 是 | 各商品库存详情 |  |
| body.details[].id | int | 是 | 商品ID | 1 |
| body.details[].inStock | bool | 是 | 是否有库存 | true |
| body.details[].availableStock | int | 是 | 可用库存数量 | 50 |
| body.details[].requestedQuantity | int | 是 | 请求数量 | 1 |
| message | string | 是 | 响应消息 | 库存检查完成 |
| success | bool | 是 | 是否成功 | true |

**注释：**
- 商品主键为id，所有字段与order-confirm.js完全一致。
- 只保留JS实际用到的字段。
- 每个字段后均有注释，便于理解。

---

## 计算订单金额

**接口名称：** 计算订单金额
**功能描述：** 根据商品、地址、优惠券等信息重新计算订单总金额
**接口地址：** /api/orders/calculate-amount
**请求方式：** POST

### 功能说明
用户在订单确认页面选择优惠券或修改商品数量后，重新计算订单的各项金额，包括商品金额、运费、优惠金额和最终应付金额。

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求计算订单金额
    Server->>DB: 查询商品价格
    Server->>DB: 查询优惠券信息
    Server->>DB: 查询运费规则
    Server->>Server: 计算各项金额
    Server-->>Client: 返回计算结果
    Client->>Client: 更新页面金额显示
```

### 请求参数
```json
{
  "goods": [
    {
      "goodsId": "goods_001",
      "quantity": 1,
      "price": 15.00
    }
  ],
  "addressId": "addr_001",
  "couponId": "coupon_001"
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| goods | array | 是 | 商品列表 | |
| goods[].goodsId | string | 是 | 商品ID | goods_001 |
| goods[].quantity | int | 是 | 数量 | 1 |
| goods[].price | number | 是 | 单价 | 15.00 |
| addressId | string | 否 | 收货地址ID（用于计算运费） | addr_001 |
| couponId | string | 否 | 优惠券ID | coupon_001 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "amounts": {
      "goodsAmount": 15.00,
      "shippingFee": 0.00,
      "discountAmount": 5.00,
      "finalAmount": 10.00
    },
    "couponInfo": {
      "couponId": "coupon_001",
      "name": "满10元减5元",
      "discount": 5.00
    }
  },
  "message": "金额计算成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0表示成功 | 0 |
| body | object | 是 | 响应数据 | |
| body.amounts | object | 是 | 金额信息 | |
| body.amounts.goodsAmount | number | 是 | 商品总金额 | 15.00 |
| body.amounts.shippingFee | number | 是 | 运费 | 0.00 |
| body.amounts.discountAmount | number | 是 | 优惠金额 | 5.00 |
| body.amounts.finalAmount | number | 是 | 最终应付金额 | 10.00 |
| body.couponInfo | object | 否 | 优惠券信息（使用优惠券时返回） | |
| body.couponInfo.couponId | string | 是 | 优惠券ID | coupon_001 |
| body.couponInfo.name | string | 是 | 优惠券名称 | 满10元减5元 |
| body.couponInfo.discount | number | 是 | 优惠金额 | 5.00 |
| message | string | 是 | 响应消息 | 金额计算成功 |
| success | bool | 是 | 是否成功 | true |

---

## 获取用户收货地址

**接口名称：** 获取用户收货地址
**功能描述：** 获取用户的默认收货地址信息
**接口地址：** /api/user/address/default
**请求方式：** GET

### 功能说明
在订单确认页面显示用户的默认收货地址。如果用户还没有设置地址，返回空数据，前端提示用户添加地址。**此接口需要用户登录状态。**

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求获取默认地址
    Server->>DB: 查询用户默认地址
    alt 有默认地址
        DB-->>Server: 返回地址信息
        Server-->>Client: 返回地址数据
    else 无地址
        DB-->>Server: 无地址记录
        Server-->>Client: 返回空地址
        Client->>Client: 提示用户添加地址
    end
```

### 请求参数
无需传入参数（需要用户登录态）

### 响应参数
```json
{
  "error": 0,
  "body": {
    "address": {
      "addressId": "addr_001",
      "name": "张三",
      "phone": "13800138000",
      "region": "广东省 深圳市 南山区",
      "detailAddress": "科技园南区深圳软件园",
      "address": "广东省深圳市南山区科技园南区深圳软件园",
      "isDefault": true
    }
  },
  "message": "获取地址成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录 | 0 |
| body | object | 是 | 响应数据 | |
| body.address | object | 否 | 默认地址信息（无地址时为null） | |
| body.address.addressId | string | 是 | 地址ID | addr_001 |
| body.address.name | string | 是 | 收件人姓名 | 张三 |
| body.address.phone | string | 是 | 联系电话 | 13800138000 |
| body.address.region | string | 是 | 省市区 | 广东省 深圳市 南山区 |
| body.address.detailAddress | string | 是 | 详细地址 | 科技园南区深圳软件园 |
| body.address.address | string | 是 | 完整地址 | 广东省深圳市南山区科技园南区深圳软件园 |
| body.address.isDefault | bool | 是 | 是否默认地址 | true |
| message | string | 是 | 响应消息 | 获取地址成功 |
| success | bool | 是 | 是否成功 | true |

---

## 获取可用优惠券数量

**接口名称：** 获取可用优惠券数量
**功能描述：** 获取当前订单可使用的优惠券数量
**接口地址：** /api/user/coupons/available
**请求方式：** GET

### 功能说明
根据当前订单的商品和金额，查询用户可以使用的优惠券数量，用于在订单确认页面显示可用优惠券数量。**此接口需要用户登录状态。**

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求可用优惠券数量
    Server->>DB: 查询用户优惠券
    Server->>Server: 根据订单条件筛选可用券
    Server-->>Client: 返回可用券数量
```

### 请求参数
```json
{
  "orderAmount": 15.00,
  "goodsIds": ["goods_001"]
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| orderAmount | number | 是 | 订单商品总金额 | 15.00 |
| goodsIds | array | 是 | 商品ID列表 | ["goods_001"] |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "availableCount": 3,
    "totalSavings": 25.00
  },
  "message": "获取优惠券数量成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录 | 0 |
| body | object | 是 | 响应数据 | |
| body.availableCount | int | 是 | 可用优惠券数量 | 3 |
| body.totalSavings | number | 是 | 最大可节省金额 | 25.00 |
| message | string | 是 | 响应消息 | 获取优惠券数量成功 |
| success | bool | 是 | 是否成功 | true |

---

## 提交订单

**接口名称：** 提交订单
**功能描述：** 提交订单信息，创建新订单并返回订单ID用于支付
**接口地址：** /api/orders/create
**请求方式：** POST

### 功能说明
用户在订单确认页面填写完所有信息后，提交订单创建新的订单记录。需要验证库存、优惠券有效性等，成功后返回订单ID供支付使用。**此接口需要用户登录状态。**

### 请求参数
```json
{
  "goods": [
    {
      "id": 1, // 商品ID
      "name": "NCS#75速【多啦A梦黄】【3只装】", // 商品名称
      "image": "https://via.placeholder.com/120x120/ff9800/fff?text=商品", // 商品图片
      "spec": "黄色 3只装", // 规格描述
      "price": 15.00, // 单价
      "quantity": 1 // 数量
    }
  ],
  "address": {
    "id": "addr_001", // 地址ID
    "name": "张三", // 收件人姓名
    "phone": "138****5678", // 联系电话
    "address": "广东省深圳市南山区科技园南区" // 完整地址
  },
  "coupon": {
    "id": 101, // 优惠券ID
    "title": "新球友专享大礼包", // 优惠券标题
    "discount": 10 // 优惠金额
  },
  "remark": "请小心包装", // 订单备注
  "amounts": {
    "goodsAmount": 15.00, // 商品总金额
    "shippingFee": 0.00, // 运费
    "finalAmount": 15.00 // 最终应付金额
  }
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| goods | array | 是 | 订单商品列表 |  |
| goods[].id | int | 是 | 商品ID | 1 |
| goods[].name | string | 是 | 商品名称 | NCS#75速【多啦A梦黄】 |
| goods[].image | string | 是 | 商品图片 | https://via.placeholder.com/120x120/ff9800/fff?text=商品 |
| goods[].spec | string | 否 | 规格描述 | 黄色 3只装 |
| goods[].price | number | 是 | 单价 | 15.00 |
| goods[].quantity | int | 是 | 数量 | 1 |
| address | object | 是 | 收货地址信息 |  |
| address.id | string | 是 | 地址ID | addr_001 |
| address.name | string | 是 | 收件人姓名 | 张三 |
| address.phone | string | 是 | 联系电话 | 138****5678 |
| address.address | string | 是 | 完整地址 | 广东省深圳市南山区科技园南区 |
| coupon | object | 否 | 优惠券信息 |  |
| coupon.id | int | 是 | 优惠券ID | 101 |
| coupon.title | string | 是 | 优惠券标题 | 新球友专享大礼包 |
| coupon.discount | number | 是 | 优惠金额 | 10 |
| remark | string | 否 | 订单备注 | 请小心包装 |
| amounts | object | 是 | 金额信息 |  |
| amounts.goodsAmount | number | 是 | 商品总金额 | 15.00 |
| amounts.shippingFee | number | 是 | 运费 | 0.00 |
| amounts.finalAmount | number | 是 | 最终应付金额 | 15.00 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "order": {
      "orderId": "order_20241215001", // 订单ID
      "orderNo": "ORD202412150001", // 订单号
      "status": "pending_payment", // 订单状态
      "totalAmount": 15.00, // 订单总金额
      "createTime": "2024-12-15 14:30:00", // 创建时间
      "payDeadline": "2024-12-15 16:30:00" // 支付截止时间
    }
  },
  "message": "订单创建成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录/400参数错误 | 0 |
| body | object | 是 | 响应数据 |  |
| body.order | object | 是 | 订单信息 |  |
| body.order.orderId | string | 是 | 订单ID | order_20241215001 |
| body.order.orderNo | string | 是 | 订单号 | ORD202412150001 |
| body.order.status | string | 是 | 订单状态 | pending_payment |
| body.order.totalAmount | number | 是 | 订单总金额 | 15.00 |
| body.order.createTime | string | 是 | 创建时间 | 2024-12-15 14:30:00 |
| body.order.payDeadline | string | 是 | 支付截止时间 | 2024-12-15 16:30:00 |
| message | string | 是 | 响应消息 | 订单创建成功 |
| success | bool | 是 | 是否成功 | true |

**注释：**
- 商品主键为id，所有字段与order-confirm.js完全一致。
- 只保留JS实际用到的字段。
- 每个字段后均有注释，便于理解。
</rewritten_file> 