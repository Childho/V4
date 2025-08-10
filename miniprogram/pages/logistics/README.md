# 物流查询页面实现说明

## 概述
本页面完全按照 `api-docs/logistics.md` 接口文档实现，提供完整的物流查询功能。

## 功能特性

### 1. API对接完整性
- ✅ 物流信息查询：`/api/logistics/query`
- ✅ 完全移除Mock数据依赖
- ✅ 使用真实API数据渲染页面

### 2. 数据字段映射
#### 物流查询接口 (`queryLogistics`)
- `status` → `logisticsInfo.status` (物流状态：pending/shipping/delivered/exception)
- `statusText` → `logisticsInfo.statusText` (物流状态文本描述)
- `companyName` → `logisticsInfo.companyName` (物流公司名称)
- `trackingNo` → `logisticsInfo.trackingNo` (物流单号)
- `tracks` → `logisticsInfo.tracks` (物流轨迹数组)
- `tracks[].time` → 物流节点时间
- `tracks[].status` → 物流节点状态描述
- `tracks[].location` → 物流节点位置
- `companyInfo` → `logisticsInfo.companyInfo` (物流公司详细信息对象)
- `companyInfo.name` → 物流公司名称
- `companyInfo.phone` → 物流公司客服电话
- `companyInfo.logo` → 物流公司logo图片URL

### 3. 错误码处理
按照接口文档错误码标准处理：
- `0` - 成功：正常处理业务逻辑
- `401` - 未登录：自动跳转到登录页面
- `500` - 系统异常：显示系统错误提示
- `1001` - 参数错误：提示订单参数错误
- `1002` - 订单不存在：提示订单不存在
- `1003` - 暂无物流信息：显示待发货状态

### 4. 物流状态枚举
严格按照接口文档的状态定义：
- `pending` - 待发货：订单已创建，等待商家发货
- `shipping` - 运输中：商品已发货，正在运输途中
- `delivered` - 已签收：商品已送达并完成签收
- `exception` - 异常：物流过程中出现异常情况

### 5. 数据安全性
实现了完善的数据安全处理：
- 所有API字段都有默认值兜底
- `tracks`数组安全检查，防止类型错误
- `companyInfo`对象安全访问
- 页面参数验证和错误处理

### 6. 用户交互功能
- **复制订单号**：支持一键复制订单号到剪贴板
- **复制物流单号**：支持一键复制物流单号到剪贴板
- **拨打客服电话**：支持直接拨打物流公司客服电话
- **下拉刷新**：支持下拉刷新最新物流信息
- **页面分享**：支持分享物流查询页面

## 页面跳转
- 从订单列表页面传递`orderId`参数跳转到物流查询页面
- 支持从其他页面通过URL参数方式访问
- 完善的参数验证和错误处理

## 技术实现
- CommonJS模块化导入API函数
- async/await异步编程
- 统一的apiRequest请求封装
- 完整的生命周期管理
- 数据驱动的UI更新

## 注意事项
1. 所有API调用都需要用户登录状态
2. 物流信息实时从后端获取，不再使用本地缓存
3. 页面显示时可选择性刷新物流信息
4. 轨迹信息按时间倒序显示（最新在前）
5. 物流公司信息完全依赖API返回

## 验证清单
- [x] API请求URL与接口文档一致
- [x] 请求参数格式与接口文档一致  
- [x] 响应数据字段与接口文档一致
- [x] 错误码处理与接口文档一致
- [x] 物流状态枚举与接口文档一致
- [x] 数据安全性校验完整
- [x] 页面跳转逻辑正确
- [x] 用户交互功能完善
- [x] 完全移除Mock数据依赖

## 已移除的内容
- ❌ `getMockLogisticsData()` 函数
- ❌ 所有Mock数据集
- ❌ API失败时的Mock数据降级逻辑
- ❌ 静态物流轨迹数据

## 新增的功能
- ✅ 完善的错误码处理机制
- ✅ 登录状态检查
- ✅ 数据安全验证
- ✅ 拨打电话确认对话框
- ✅ 详细的调试日志输出 