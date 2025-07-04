# 优惠券页面接口文档（已对齐index.js字段，含详细注释）

## 获取优惠券列表

**接口名称：** 获取优惠券列表
**功能描述：** 获取用户的优惠券列表，支持按状态筛选和分页加载
**接口地址：** /api/user/coupons/list
**请求方式：** GET

### 功能说明
在优惠券页面显示用户所有的优惠券，支持按状态筛选（全部、可使用、即将过期），支持分页加载。**此接口需要用户登录状态。**

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant Auth as 认证服务
    participant DB as 数据库
    Client->>Server: 请求优惠券列表
    Server->>Auth: 验证用户登录状态
    alt 用户已登录
        Auth-->>Server: 验证通过
        Server->>DB: 根据状态查询优惠券
        Server->>DB: 分页查询用户优惠券
        Server-->>Client: 返回优惠券列表
    else 用户未登录
        Auth-->>Server: 验证失败
        Server-->>Client: 返回需要登录
    end
```

### 请求参数
```json
{
  "status": 1, // 优惠券状态（0全部/1可使用/4即将过期）
  "page": 1, // 页码
  "pageSize": 10 // 每页数量
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| status | int | 否 | 优惠券状态（0全部/1可使用/4即将过期） | 1 |
| page | int | 否 | 页码（默认1） | 1 |
| pageSize | int | 否 | 每页数量（默认10） | 10 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "couponList": [
      {
        "id": 101, // 优惠券ID
        "title": "新球友专享大礼包", // 优惠券标题
        "amount": 50, // 优惠金额（满减券）或折扣（折扣券）
        "minAmount": 299, // 最低使用金额
        "type": 1, // 优惠券类型（1满减券/2折扣券/3免邮券）
        "scope": "全场羽毛球用品", // 适用范围
        "startTime": "2024-01-01", // 生效时间
        "endTime": "2024-12-31", // 到期时间
        "status": 1, // 状态（1可使用/4即将过期）
        "useTime": null, // 使用时间（未使用为null）
        "description": "新用户注册即得，购买羽毛球拍、球鞋等满299元可用", // 优惠券描述
        "discount": 50 // 实际优惠金额（满减券/折扣券/免邮券）
      }
    ],
    "currentPage": 1, // 当前页码
    "pageSize": 10, // 每页数量
    "hasMore": true // 是否还有更多数据
  },
  "message": "获取优惠券列表成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录 | 0 |
| body | object | 是 | 响应数据 |  |
| body.couponList | array | 是 | 优惠券列表 |  |
| body.couponList[].id | int | 是 | 优惠券ID | 101 |
| body.couponList[].title | string | 是 | 优惠券标题 | 新球友专享大礼包 |
| body.couponList[].amount | number | 是 | 优惠金额（满减券）或折扣（折扣券） | 50 |
| body.couponList[].minAmount | number | 是 | 最低使用金额 | 299 |
| body.couponList[].type | int | 是 | 优惠券类型（1满减券/2折扣券/3免邮券） | 1 |
| body.couponList[].scope | string | 是 | 适用范围 | 全场羽毛球用品 |
| body.couponList[].startTime | string | 是 | 生效时间 | 2024-01-01 |
| body.couponList[].endTime | string | 是 | 到期时间 | 2024-12-31 |
| body.couponList[].status | int | 是 | 状态（1可使用/4即将过期） | 1 |
| body.couponList[].useTime | string | 否 | 使用时间（未使用为null） | null |
| body.couponList[].description | string | 否 | 优惠券描述 | 新用户注册即得... |
| body.couponList[].discount | number | 是 | 实际优惠金额 | 50 |
| body.currentPage | int | 是 | 当前页码 | 1 |
| body.pageSize | int | 是 | 每页数量 | 10 |
| body.hasMore | bool | 是 | 是否还有更多数据 | true |
| message | string | 是 | 响应消息 | 获取优惠券列表成功 |
| success | bool | 是 | 是否成功 | true |

**注释：**
- 优惠券主键为id，所有字段与index.js完全一致。
- 只保留JS实际用到的字段。
- 分页通过currentPage、pageSize、hasMore控制，无嵌套分页对象。
- 状态只用0（全部）、1（可使用）、4（即将过期）。
- 每个字段后均有注释，便于理解。

---

## 选择优惠券（订单确认页使用）

> 由于index.js为本地模拟数据，实际接口字段请参考上方结构，所有涉及优惠券的字段均以id、title、amount、minAmount、type、scope、startTime、endTime、status、useTime、description、discount为主。
> 
> 其它接口如选择、使用、统计等，参数和返回结构请严格参照上方字段，去除文档中未在JS出现的字段。

---

**友情提示：**
- 文档字段已与index.js完全对齐，开发时如有字段变动请同步更新本接口文档。
- 每个字段后均有注释，方便理解和开发。

## 使用优惠券

**接口名称：** 使用优惠券
**功能描述：** 直接使用优惠券，跳转到对应商品或商城页面
**接口地址：** /api/user/coupons/use
**请求方式：** POST

### 功能说明
用户在优惠券页面点击"立即使用"按钮时，标记优惠券为使用状态，并返回跳转页面信息。**此接口需要用户登录状态。**

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 使用优惠券
    Server->>DB: 查询优惠券信息
    Server->>DB: 验证优惠券状态
    alt 优惠券可用
        Server->>DB: 标记优惠券为使用状态
        Server-->>Client: 返回使用成功和跳转信息
    else 优惠券不可用
        Server-->>Client: 返回使用失败原因
    end
```

### 请求参数
```json
{
  "couponId": 101
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| couponId | int | 是 | 优惠券ID | 101 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "useResult": {
      "success": true,
      "couponInfo": {
        "title": "新球友专享大礼包",
        "type": 1,
        "scope": "全场羽毛球用品"
      },
      "jumpInfo": {
        "type": "mall",
        "url": "/pages/mall/index",
        "productId": null
      },
      "message": "优惠券使用成功，正在跳转到商城"
    }
  },
  "message": "优惠券使用成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录/400优惠券不可用 | 0 |
| body | object | 是 | 响应数据 | |
| body.useResult | object | 是 | 使用结果 | |
| body.useResult.success | bool | 是 | 是否使用成功 | true |
| body.useResult.couponInfo | object | 是 | 优惠券信息 | |
| body.useResult.couponInfo.title | string | 是 | 优惠券标题 | 新球友专享大礼包 |
| body.useResult.couponInfo.type | int | 是 | 优惠券类型 | 1 |
| body.useResult.couponInfo.scope | string | 是 | 适用范围 | 全场羽毛球用品 |
| body.useResult.jumpInfo | object | 是 | 跳转信息 | |
| body.useResult.jumpInfo.type | string | 是 | 跳转类型（mall商城/product商品详情） | mall |
| body.useResult.jumpInfo.url | string | 是 | 跳转页面路径 | /pages/mall/index |
| body.useResult.jumpInfo.productId | string | 否 | 指定商品ID（全场券为null） | null |
| body.useResult.message | string | 是 | 使用结果消息 | 优惠券使用成功，正在跳转到商城 |
| message | string | 是 | 响应消息 | 优惠券使用成功 |
| success | bool | 是 | 是否成功 | true |

---

## 获取可用优惠券数量

**接口名称：** 获取可用优惠券数量
**功能描述：** 获取用户可用优惠券的数量统计
**接口地址：** /api/user/coupons/count
**请求方式：** GET

### 功能说明
获取用户各种状态的优惠券数量，用于个人页面优惠券数量显示。**此接口需要用户登录状态。**

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求优惠券数量
    Server->>DB: 统计各状态优惠券数量
    Server-->>Client: 返回优惠券统计数据
```

### 请求参数
无需传入参数（需要用户登录态）

### 响应参数
```json
{
  "error": 0,
  "body": {
    "couponCounts": {
      "total": 15,
      "available": 8,
      "used": 4,
      "expired": 1,
      "expiringSoon": 2
    }
  },
  "message": "获取优惠券数量成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录 | 0 |
| body | object | 是 | 响应数据 | |
| body.couponCounts | object | 是 | 优惠券数量统计 | |
| body.couponCounts.total | int | 是 | 总优惠券数 | 15 |
| body.couponCounts.available | int | 是 | 可使用优惠券数 | 8 |
| body.couponCounts.used | int | 是 | 已使用优惠券数 | 4 |
| body.couponCounts.expired | int | 是 | 已过期优惠券数 | 1 |
| body.couponCounts.expiringSoon | int | 是 | 即将过期优惠券数 | 2 |
| message | string | 是 | 响应消息 | 获取优惠券数量成功 |
| success | bool | 是 | 是否成功 | true |

---

## 获取适用优惠券

**接口名称：** 获取适用优惠券
**功能描述：** 根据订单信息获取可用的优惠券列表
**接口地址：** /api/orders/available-coupons
**请求方式：** POST

### 功能说明
在订单确认页面显示当前订单可以使用的优惠券列表，按优惠力度排序。**此接口需要用户登录状态。**

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求适用优惠券
    Server->>DB: 查询用户可用优惠券
    Server->>Server: 根据订单条件筛选
    Server->>Server: 计算优惠金额并排序
    Server-->>Client: 返回适用优惠券列表
```

### 请求参数
```json
{
  "orderAmount": 350.00,
  "goodsIds": ["goods_001", "goods_002"],
  "goodsCategories": ["羽毛球拍", "羽毛球鞋"]
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| orderAmount | number | 是 | 订单商品总金额 | 350.00 |
| goodsIds | array | 是 | 商品ID列表 | ["goods_001", "goods_002"] |
| goodsCategories | array | 是 | 商品分类列表 | ["羽毛球拍", "羽毛球鞋"] |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "availableCoupons": [
      {
        "id": 101,
        "title": "新球友专享大礼包",
        "amount": 50,
        "minAmount": 299,
        "type": 1,
        "scope": "全场羽毛球用品",
        "endTime": "2024-12-31",
        "description": "新用户注册即得，购买羽毛球拍、球鞋等满299元可用",
        "canUse": true,
        "discountAmount": 50.00,
        "finalAmount": 300.00,
        "savingRank": 1
      },
      {
        "id": 102,
        "title": "羽毛球拍8折优惠券",
        "amount": 80,
        "minAmount": 500,
        "type": 2,
        "scope": "羽毛球拍类",
        "endTime": "2024-08-31",
        "description": "尤尼克斯、胜利、李宁等知名品牌球拍享8折优惠",
        "canUse": false,
        "discountAmount": 0,
        "finalAmount": 350.00,
        "savingRank": 0,
        "reason": "订单金额不足500元"
      }
    ],
    "bestCoupon": {
      "id": 101,
      "discountAmount": 50.00
    }
  },
  "message": "获取适用优惠券成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0成功/401未登录 | 0 |
| body | object | 是 | 响应数据 | |
| body.availableCoupons | array | 是 | 适用优惠券列表 | |
| body.availableCoupons[].id | int | 是 | 优惠券ID | 101 |
| body.availableCoupons[].title | string | 是 | 优惠券标题 | 新球友专享大礼包 |
| body.availableCoupons[].amount | number | 是 | 优惠金额或折扣 | 50 |
| body.availableCoupons[].minAmount | number | 是 | 最低使用金额 | 299 |
| body.availableCoupons[].type | int | 是 | 优惠券类型 | 1 |
| body.availableCoupons[].scope | string | 是 | 适用范围 | 全场羽毛球用品 |
| body.availableCoupons[].endTime | string | 是 | 到期时间 | 2024-12-31 |
| body.availableCoupons[].description | string | 是 | 优惠券描述 | 新用户注册即得，购买羽毛球拍、球鞋等满299元可用 |
| body.availableCoupons[].canUse | bool | 是 | 是否可用 | true |
| body.availableCoupons[].discountAmount | number | 是 | 实际优惠金额 | 50.00 |
| body.availableCoupons[].finalAmount | number | 是 | 使用后金额 | 300.00 |
| body.availableCoupons[].savingRank | int | 是 | 优惠排名（按优惠力度） | 1 |
| body.availableCoupons[].reason | string | 否 | 不可用原因（不可用时返回） | 订单金额不足500元 |
| body.bestCoupon | object | 是 | 最优优惠券推荐 | |
| body.bestCoupon.id | int | 是 | 最优优惠券ID | 101 |
| body.bestCoupon.discountAmount | number | 是 | 最大优惠金额 | 50.00 |
| message | string | 是 | 响应消息 | 获取适用优惠券成功 |
| success | bool | 是 | 是否成功 | true |
``` 