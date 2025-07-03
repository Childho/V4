# 微信小程序项目

## 项目结构

### 页面目录 (/pages)
- `index/` - 首页
- `login/` - 登录页面
- `personal/` - 个人中心页面
- `activity/` - 活动页面
- `mall/` - 商城页面
- `cart/` - 购物车页面
- `order-confirm/` - 订单确认页面
- `order-list/` - 我的订单页面
- `refund-detail/` - 退款详情页面
- `booking/` - 服务预订页面
- `seckill/` - 秒杀页面
- `activityDetail/` - 活动详情页面
- `productDetail/` - 商品详情页面
- `courseDetail/` - 课程详情页面
- `pointsExchange/` - 积分兑换页面
- `dailyCheck/` - 每日签到页面
- `search-result/` - 搜索结果页面
- `address-list/` - 地址管理页面
- `address-form/` - 地址新增/编辑页面
- `logistics/` - 物流查询页面
- `coupon/` - 优惠券页面

### API目录 (/api)
- `userApi.js` - 用户相关API
- `addressApi.js` - 地址管理相关API
- `utils/request.js` - 网络请求工具

### 组件目录 (/components)
- 公共组件存放位置

### 静态资源目录 (/assets)
- `icons/` - 图标文件
- `images/` - 图片文件

## 开发规范

### 技术栈
- 使用微信小程序原生框架（wxml + wxss + js/json）
- 不使用第三方前端框架

### 命名规范
- 页面、组件命名使用小写字母+中划线（如: order-list, product-detail）
- 变量、函数名用小驼峰（如: productList, getOrderDetail）

### 目录结构
- 页面文件统一存放于 /pages 目录，每个页面单独文件夹，含 wxml、wxss、js、json 四个文件
- 复用组件存放于 /components 目录
- 公共方法、工具函数存放于 /utils 目录
- 静态资源存放于 /assets 目录
- 后端接口封装统一放在 /api 目录

### 代码规范
- 所有代码都添加详细的中文注释，便于理解
- 单文件内函数、方法不超过300行，保持函数单一职责
- 所有请求必须处理失败/异常情况
- 需要鉴权的接口，header 必须带 token

## 功能说明

### 主要功能模块
1. **用户系统** - 登录、个人中心、积分管理
2. **商城系统** - 商品浏览、购物车、订单管理
3. **服务系统** - 预约服务、活动报名
4. **地址管理** - 收货地址增删改查
5. **优惠券系统** - 优惠券领取和使用

### 开发状态
- ✅ 基础页面结构已完成
- ✅ 用户登录和个人中心功能
- ✅ 商城和购物车功能
- ✅ 订单管理系统
- ✅ 地址管理功能
- ✅ 服务预约功能
- 🔄 优惠券和积分系统（开发中）

## 使用说明

### 开发环境
1. 安装微信开发者工具
2. 导入项目目录
3. 配置AppID
4. 启动项目进行开发和调试

### 测试数据
项目中包含丰富的mock数据用于开发测试，位于 `api/utils/request.js` 文件中。

### 部署上线
1. 完善所有功能开发
2. 替换mock数据为真实API接口
3. 提交微信小程序审核
4. 发布上线