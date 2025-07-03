# 活动详情页面接口文档

## 获取活动详情

**接口名称：** 获取活动详情信息
**功能描述：** 根据活动ID获取活动的详细信息，包含活动内容、规则、报名状态等
**接口地址：** /api/activities/detail
**请求方式：** GET

### 功能说明
获取指定活动的详细信息，包含活动的完整描述、HTML格式的活动内容、活动规则、报名信息等。用户可根据活动详情决定是否参与报名。

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求活动详情（活动ID）
    Server->>DB: 查询活动信息
    DB-->>Server: 返回活动数据
    Server->>Server: 检查用户报名状态
    Server-->>Client: 返回活动详情和报名状态
    Client->>Client: 渲染活动详情页面
```

### 请求参数
```json
{
  "eventId": "event_1"
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| eventId | string | 是 | 活动唯一ID | event_1 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "eventId": "event_1",
    "title": "门店周年庆活动",
    "description": "羽你同行实体店两周年店庆，全场商品8折，会员额外95折，还有精美礼品赠送！快来参与我们的庆典活动吧！",
    "startTime": "2024-12-18T10:00:00Z",
    "endTime": "2024-12-24T18:00:00Z",
    "location": "倍特爱运动专卖店",
    "organizer": "倍特爱运动专卖店",
    "content": "<p>🎉 为庆祝倍特爱运动专卖店周年庆，我们特举办盛大庆典活动！</p><p><strong>活动亮点：</strong></p><p>• 全场商品8折优惠</p><p>• 会员额外享受95折</p><p>• 购物满299元送精美礼品</p><p>• 现场抽奖有机会获得专业球拍</p><p><strong>活动地址：</strong>倍特爱运动专卖店</p>",
    "rules": "1. 活动期间每天限量100份礼品，先到先得\n2. 会员折扣与商品折扣可叠加使用\n3. 抽奖活动每人每天限参与一次\n4. 活动最终解释权归商家所有",
    "coverImage": "https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?w=800",
    "maxParticipants": 100,
    "currentParticipants": 38,
    "signupDeadline": "2024-12-23T18:00:00Z",
    "isPublished": true,
    "status": "ongoing",
    "userSignupStatus": {
      "isJoined": false,
      "canSignup": true,
      "signupId": null,
      "signupTime": null
    },
    "signupRequiredFields": [
      {
        "fieldName": "name",
        "fieldType": "text",
        "label": "真实姓名",
        "required": true,
        "placeholder": "请输入您的真实姓名"
      },
      {
        "fieldName": "phone",
        "fieldType": "phone",
        "label": "联系电话",
        "required": true,
        "placeholder": "请输入手机号码"
      }
    ]
  },
  "message": "获取活动详情成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0表示成功 | 0 |
| body | object | 是 | 响应数据 | |
| body.eventId | string | 是 | 活动唯一ID | event_1 |
| body.title | string | 是 | 活动标题 | 门店周年庆活动 |
| body.description | string | 是 | 活动详细描述 | 羽你同行实体店两周年店庆... |
| body.startTime | string | 是 | 活动开始时间（ISO 8601格式） | 2024-12-18T10:00:00Z |
| body.endTime | string | 是 | 活动结束时间（ISO 8601格式） | 2024-12-24T18:00:00Z |
| body.location | string | 是 | 活动地点 | 倍特爱运动专卖店 |
| body.organizer | string | 是 | 主办方名称 | 倍特爱运动专卖店 |
| body.content | string | 是 | 活动内容（HTML格式） | <p>🎉 为庆祝倍特爱运动专卖店周年庆... |
| body.rules | string | 是 | 活动规则（换行符分隔） | 1. 活动期间每天限量100份礼品... |
| body.coverImage | string | 是 | 活动封面图URL | https://example.com/cover.jpg |
| body.maxParticipants | int | 是 | 最大报名人数 | 100 |
| body.currentParticipants | int | 是 | 当前报名人数 | 38 |
| body.signupDeadline | string | 是 | 报名截止时间 | 2024-12-23T18:00:00Z |
| body.isPublished | bool | 是 | 是否已发布 | true |
| body.status | string | 是 | 活动状态 | ongoing |
| body.userSignupStatus | object | 是 | 用户报名状态 | |
| body.userSignupStatus.isJoined | bool | 是 | 是否已报名 | false |
| body.userSignupStatus.canSignup | bool | 是 | 是否可以报名 | true |
| body.userSignupStatus.signupId | string | 否 | 报名记录ID（已报名时返回） | signup_123 |
| body.userSignupStatus.signupTime | string | 否 | 报名时间（已报名时返回） | 2024-12-18T14:30:00Z |
| body.signupRequiredFields | array | 是 | 报名所需字段配置 | |
| body.signupRequiredFields[].fieldName | string | 是 | 字段名称 | name |
| body.signupRequiredFields[].fieldType | string | 是 | 字段类型 | text |
| body.signupRequiredFields[].label | string | 是 | 字段标签 | 真实姓名 |
| body.signupRequiredFields[].required | bool | 是 | 是否必填 | true |
| body.signupRequiredFields[].placeholder | string | 是 | 输入提示 | 请输入您的真实姓名 |
| message | string | 是 | 响应消息 | 获取活动详情成功 |
| success | bool | 是 | 是否成功 | true |

---

## 报名活动

**接口名称：** 报名参加活动
**功能描述：** 用户提交报名信息参加指定活动
**接口地址：** /api/activities/signup
**请求方式：** POST

### 功能说明
用户填写报名表单并提交报名申请。系统会检查报名条件（是否超过人数限制、是否已截止报名、用户是否已报名等），通过验证后创建报名记录。

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 提交报名信息
    Server->>Server: 验证报名条件
    alt 条件满足
        Server->>DB: 创建报名记录
        DB-->>Server: 返回报名成功
        Server-->>Client: 报名成功响应
    else 条件不满足
        Server-->>Client: 返回错误信息
    end
```

### 请求参数
```json
{
  "eventId": "event_1",
  "signupData": {
    "name": "张三",
    "phone": "13812345678"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| eventId | string | 是 | 活动唯一ID | event_1 |
| signupData | object | 是 | 报名信息 | |
| signupData.name | string | 是 | 报名人姓名 | 张三 |
| signupData.phone | string | 是 | 联系电话 | 13812345678 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "signupId": "signup_123456",
    "eventId": "event_1",
    "signupTime": "2024-12-18T14:30:00Z",
    "status": "confirmed",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?data=signup_123456",
    "message": "报名成功！请保存好报名二维码，活动当天凭此码参与活动。"
  },
  "message": "活动报名成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0表示成功 | 0 |
| body | object | 是 | 响应数据 | |
| body.signupId | string | 是 | 报名记录唯一ID | signup_123456 |
| body.eventId | string | 是 | 活动ID | event_1 |
| body.signupTime | string | 是 | 报名成功时间 | 2024-12-18T14:30:00Z |
| body.status | string | 是 | 报名状态 | confirmed |
| body.qrCode | string | 是 | 报名二维码URL | https://api.qrserver.com/... |
| body.message | string | 是 | 报名成功提示信息 | 报名成功！请保存好报名二维码... |
| message | string | 是 | 响应消息 | 活动报名成功 |
| success | bool | 是 | 是否成功 | true |

### 错误响应示例
```json
{
  "error": 1001,
  "body": null,
  "message": "报名人数已满，无法继续报名",
  "success": false
}
```

**常见错误码说明：**
- `1001`：报名人数已满
- `1002`：报名已截止
- `1003`：用户已报名该活动
- `1004`：活动不存在或已下线
- `1005`：用户信息验证失败
- `1006`：活动状态不允许报名

---

## 取消报名

**接口名称：** 取消活动报名
**功能描述：** 用户取消已报名的活动
**接口地址：** /api/activities/cancel-signup
**请求方式：** POST

### 功能说明
用户可以取消已报名的活动，系统会删除或标记报名记录为已取消状态。取消报名后，活动的当前报名人数会相应减少。

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求取消报名
    Server->>Server: 验证取消条件
    alt 可以取消
        Server->>DB: 更新报名状态
        DB-->>Server: 更新成功
        Server-->>Client: 取消成功响应
    else 不能取消
        Server-->>Client: 返回错误信息
    end
```

### 请求参数
```json
{
  "eventId": "event_1",
  "signupId": "signup_123456"
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| eventId | string | 是 | 活动唯一ID | event_1 |
| signupId | string | 是 | 报名记录ID | signup_123456 |

### 响应参数
```json
{
  "error": 0,
  "body": {
    "eventId": "event_1",
    "signupId": "signup_123456",
    "cancelTime": "2024-12-19T09:15:00Z",
    "refundAmount": 0,
    "message": "取消报名成功"
  },
  "message": "取消报名成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0表示成功 | 0 |
| body | object | 是 | 响应数据 | |
| body.eventId | string | 是 | 活动ID | event_1 |
| body.signupId | string | 是 | 报名记录ID | signup_123456 |
| body.cancelTime | string | 是 | 取消时间 | 2024-12-19T09:15:00Z |
| body.refundAmount | number | 是 | 退款金额（如有） | 0 |
| body.message | string | 是 | 取消成功提示 | 取消报名成功 |
| message | string | 是 | 响应消息 | 取消报名成功 |
| success | bool | 是 | 是否成功 | true |

---

## 查询用户报名记录

**接口名称：** 查询用户活动报名记录
**功能描述：** 获取用户的活动报名历史记录
**接口地址：** /api/activities/my-signups
**请求方式：** GET

### 功能说明
获取当前用户的所有活动报名记录，包含已报名、已取消、已完成等各种状态的报名记录，支持分页查询。

```mermaid
sequenceDiagram
    participant Client as 小程序客户端
    participant Server as 后端服务
    participant DB as 数据库
    Client->>Server: 请求报名记录
    Server->>DB: 查询用户报名数据
    DB-->>Server: 返回报名记录
    Server-->>Client: 返回报名记录列表
    Client->>Client: 渲染报名记录页面
```

### 请求参数
```json
{
  "page": 1,
  "pageSize": 10,
  "status": "all"
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| page | int | 否 | 页码（默认1） | 1 |
| pageSize | int | 否 | 每页数量（默认10） | 10 |
| status | string | 否 | 报名状态筛选（默认all） | all |

**status参数说明：**
- `all`：全部记录
- `confirmed`：已确认报名
- `cancelled`：已取消
- `completed`：已完成活动

### 响应参数
```json
{
  "error": 0,
  "body": {
    "signups": [
      {
        "signupId": "signup_123456",
        "eventId": "event_1",
        "eventTitle": "门店周年庆活动",
        "eventCoverImage": "https://images.unsplash.com/photo-1626224583764-f87db24ac5e4?w=400",
        "eventStartTime": "2024-12-18T10:00:00Z",
        "eventEndTime": "2024-12-24T18:00:00Z",
        "eventLocation": "倍特爱运动专卖店",
        "signupTime": "2024-12-18T14:30:00Z",
        "status": "confirmed",
        "qrCode": "https://api.qrserver.com/v1/create-qr-code/?data=signup_123456"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 5,
      "totalPages": 1,
      "hasMore": false
    }
  },
  "message": "获取报名记录成功",
  "success": true
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|----|---|-----|---|-----|
| error | int | 是 | 错误码，0表示成功 | 0 |
| body | object | 是 | 响应数据 | |
| body.signups | array | 是 | 报名记录列表 | |
| body.signups[].signupId | string | 是 | 报名记录ID | signup_123456 |
| body.signups[].eventId | string | 是 | 活动ID | event_1 |
| body.signups[].eventTitle | string | 是 | 活动标题 | 门店周年庆活动 |
| body.signups[].eventCoverImage | string | 是 | 活动封面图 | https://example.com/cover.jpg |
| body.signups[].eventStartTime | string | 是 | 活动开始时间 | 2024-12-18T10:00:00Z |
| body.signups[].eventEndTime | string | 是 | 活动结束时间 | 2024-12-24T18:00:00Z |
| body.signups[].eventLocation | string | 是 | 活动地点 | 倍特爱运动专卖店 |
| body.signups[].signupTime | string | 是 | 报名时间 | 2024-12-18T14:30:00Z |
| body.signups[].status | string | 是 | 报名状态 | confirmed |
| body.signups[].qrCode | string | 否 | 报名二维码（confirmed状态时返回） | https://api.qrserver.com/... |
| body.pagination | object | 是 | 分页信息 | |
| body.pagination.page | int | 是 | 当前页码 | 1 |
| body.pagination.pageSize | int | 是 | 每页数量 | 10 |
| body.pagination.total | int | 是 | 总记录数 | 5 |
| body.pagination.totalPages | int | 是 | 总页数 | 1 |
| body.pagination.hasMore | bool | 是 | 是否有更多数据 | false |
| message | string | 是 | 响应消息 | 获取报名记录成功 |
| success | bool | 是 | 是否成功 | true | 