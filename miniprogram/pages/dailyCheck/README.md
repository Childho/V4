# 每日签到页面实现说明

## 概述
本页面完全按照 `api-docs/dailyCheck.md` 接口文档实现，提供完整的每日签到功能。

## 功能特性

### 1. API对接完整性
- ✅ 获取积分信息：`/api/points/info`
- ✅ 用户每日签到：`/api/points/signIn`  
- ✅ 获取签到记录：`/api/points/signInRecord`

### 2. 数据字段映射
#### 积分信息接口 (`getPointsInfo`)
- `balance` → `userInfo.pointsBalance` (积分余额)
- `isSigned` → `signedToday` (今日是否已签到)

#### 签到接口 (`signIn`)
- `success` → 签到是否成功判断
- `points` → `signAnimationReward` (获得的积分)
- `continuousDays` → `continuousDays` (连续签到天数)
- `totalPoints` → `userInfo.pointsBalance` (签到后总积分)

#### 签到记录接口 (`getSignInRecord`)
- `days` → `signDays` (本月已签到的日期数组)
- `continuousDays` → `continuousDays` (当前连续签到天数)
- `totalDays` → `signStats.totalDays` (累计签到天数)
- `maxContinuous` → `signStats.maxContinuous` (最大连续签到天数)

### 3. 错误码处理
按照接口文档错误码标准处理：
- `0` - 成功：正常处理业务逻辑
- `401` - 未登录：自动跳转到登录页面
- `500` - 系统异常：显示系统错误提示
- `1001` - 今日已签到：更新本地状态并提示
- `1002` - 签到失败：提示用户重试

### 4. 奖励机制
严格按照接口文档的7天奖励周期：
- 第1天：5积分
- 第2天：10积分  
- 第3天：15积分
- 第4天：20积分
- 第5天：25积分
- 第6天：30积分
- 第7天：50积分（大奖励）

### 5. 数据安全性
实现了完善的数据安全处理：
- `safeParseInt()` - 安全解析整数，防止NaN
- `safeParseArray()` - 安全解析数组，防止类型错误
- `safeParseBoolean()` - 安全解析布尔值，兼容多种格式

### 6. 用户体验优化
- 签到成功动画效果
- 振动反馈
- 连续签到特殊庆祝（7天达成）
- 完整的加载状态管理
- 详细的错误提示

## 页面跳转
- 从个人中心点击"每日签到"任务 → 自动跳转到签到页面
- 支持积分查看跳转到积分兑换页面
- 完善的页面跳转错误处理

## 技术实现
- CommonJS模块化导入API函数
- async/await异步编程
- 统一的apiRequest请求封装
- 完整的生命周期管理
- 数据驱动的UI更新

## 注意事项
1. 所有API调用都需要用户登录状态
2. 签到状态与积分信息实时同步
3. 页面显示时自动刷新数据
4. 签到记录按月展示日历形式
5. 奖励计算基于后端返回数据，前端仅做展示

## 验证清单
- [x] API请求URL与接口文档一致
- [x] 请求参数格式与接口文档一致  
- [x] 响应数据字段与接口文档一致
- [x] 错误码处理与接口文档一致
- [x] 用户交互流程与接口文档一致
- [x] 数据安全性校验完整
- [x] 页面跳转逻辑正确
- [x] 签到奖励机制准确 