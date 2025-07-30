USE baitelove_miniapp;
-- ----------------------------
-- 微信小程序电商系统数据库设计
-- ----------------------------

-- ----------------------------
-- 数据库初始化
-- ----------------------------

-- ----------------------------
-- 用户相关表
-- ----------------------------

-- 用户基础信息表
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
  `openid` varchar(128) NOT NULL COMMENT '微信唯一标识',
  `unionid` varchar(128) DEFAULT NULL COMMENT '微信开放平台唯一标识',
  `nickname` varchar(100) DEFAULT NULL COMMENT '用户昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '用户头像URL',
  `gender` tinyint DEFAULT 0 COMMENT '性别：0未知，1男，2女',
  `country` varchar(50) DEFAULT NULL COMMENT '国家',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `language` varchar(20) DEFAULT NULL COMMENT '语言',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `register_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `last_login_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '最后登录时间',
  `status` tinyint DEFAULT 1 COMMENT '用户状态：0禁用，1正常',
  `is_vip` tinyint DEFAULT 0 COMMENT '是否VIP：0否，1是',
  `vip_expire_time` datetime DEFAULT NULL COMMENT 'VIP过期时间',
  `user_level` tinyint DEFAULT 1 COMMENT '用户等级：1普通用户，2白银会员，3黄金会员，4钻石会员',
  `points` int DEFAULT 0 COMMENT '用户积分',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_openid` (`openid`),
  KEY `idx_unionid` (`unionid`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基础信息表';

-- 用户收货地址表
CREATE TABLE `user_address` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '地址ID，主键',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `consignee` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) NOT NULL COMMENT '收货人手机号',
  `country` varchar(50) DEFAULT NULL COMMENT '国家',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) NOT NULL COMMENT '区县',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `zip_code` varchar(20) DEFAULT NULL COMMENT '邮政编码',
  `is_default` tinyint DEFAULT 0 COMMENT '是否默认地址：0否，1是',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

-- 用户收藏表
CREATE TABLE `user_favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '收藏ID，主键',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_product` (`user_id`,`product_id`),
  KEY `idx_product_id` (`product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- 用户浏览历史表
CREATE TABLE `user_browse_history` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '浏览记录ID，主键',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `browse_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `device_info` varchar(255) DEFAULT NULL COMMENT '设备信息',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_browse_time` (`browse_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户浏览历史表';

-- ----------------------------
-- 商品相关表
-- ----------------------------

-- 商品分类表
CREATE TABLE `product_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID，主键',
  `parent_id` bigint DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
  `category_name` varchar(100) NOT NULL COMMENT '分类名称',
  `category_image` varchar(255) DEFAULT NULL COMMENT '分类图片URL',
  `sort_order` int DEFAULT 0 COMMENT '排序值，值越小越靠前',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 商品品牌表
CREATE TABLE `product_brand` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '品牌ID，主键',
  `brand_name` varchar(100) NOT NULL COMMENT '品牌名称',
  `brand_logo` varchar(255) DEFAULT NULL COMMENT '品牌Logo URL',
  `brand_desc` text COMMENT '品牌描述',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_brand_name` (`brand_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品品牌表';

-- 商品表
CREATE TABLE `product` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID，主键',
  `product_name` varchar(200) NOT NULL COMMENT '商品名称',
  `category_id` bigint NOT NULL COMMENT '分类ID，关联product_category表',
  `brand_id` bigint DEFAULT NULL COMMENT '品牌ID，关联product_brand表',
  `product_sn` varchar(100) DEFAULT NULL COMMENT '商品编号',
  `market_price` decimal(10,2) NOT NULL COMMENT '市场价格',
  `sale_price` decimal(10,2) NOT NULL COMMENT '销售价格',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '成本价格',
  `stock` int DEFAULT 0 COMMENT '库存数量',
  `min_stock` int DEFAULT 0 COMMENT '库存预警值',
  `weight` decimal(10,2) DEFAULT NULL COMMENT '商品重量（kg）',
  `volume` decimal(10,2) DEFAULT NULL COMMENT '商品体积（m³）',
  `brief` varchar(255) DEFAULT NULL COMMENT '商品简介',
  `description` text COMMENT '商品详情描述',
  `is_on_sale` tinyint DEFAULT 0 COMMENT '是否上架：0否，1是',
  `is_hot` tinyint DEFAULT 0 COMMENT '是否热销：0否，1是',
  `is_new` tinyint DEFAULT 0 COMMENT '是否新品：0否，1是',
  `is_recommend` tinyint DEFAULT 0 COMMENT '是否推荐：0否，1是',
  `sales_volume` int DEFAULT 0 COMMENT '销量',
  `views` int DEFAULT 0 COMMENT '浏览量',
  `comments` int DEFAULT 0 COMMENT '评论数',
  `sort_order` int DEFAULT 0 COMMENT '排序值，值越小越靠前',
  `status` tinyint DEFAULT 1 COMMENT '状态：0删除，1正常',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_brand_id` (`brand_id`),
  KEY `idx_is_on_sale` (`is_on_sale`),
  KEY `idx_sort_order` (`sort_order`),
  FOREIGN KEY (`category_id`) REFERENCES `product_category` (`id`),
  FOREIGN KEY (`brand_id`) REFERENCES `product_brand` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 商品图片表
CREATE TABLE `product_image` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '图片ID，主键',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `image_url` varchar(255) NOT NULL COMMENT '图片URL',
  `sort_order` int DEFAULT 0 COMMENT '排序值，值越小越靠前',
  `is_cover` tinyint DEFAULT 0 COMMENT '是否封面图：0否，1是',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品图片表';

-- 商品属性表
CREATE TABLE `product_attribute` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '属性ID，主键',
  `attr_name` varchar(100) NOT NULL COMMENT '属性名称',
  `attr_group` varchar(100) DEFAULT NULL COMMENT '属性分组',
  `is_filter` tinyint DEFAULT 0 COMMENT '是否用于筛选：0否，1是',
  `sort_order` int DEFAULT 0 COMMENT '排序值',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_attr_group` (`attr_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品属性表';

-- 商品属性值表
CREATE TABLE `product_attribute_value` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '属性值ID，主键',
  `attr_id` bigint NOT NULL COMMENT '属性ID，关联product_attribute表',
  `attr_value` varchar(255) NOT NULL COMMENT '属性值',
  `sort_order` int DEFAULT 0 COMMENT '排序值',
  PRIMARY KEY (`id`),
  KEY `idx_attr_id` (`attr_id`),
  FOREIGN KEY (`attr_id`) REFERENCES `product_attribute` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品属性值表';

-- 商品SKU表
CREATE TABLE `product_sku` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'SKU ID，主键',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `sku_code` varchar(100) DEFAULT NULL COMMENT 'SKU编码',
  `market_price` decimal(10,2) DEFAULT NULL COMMENT '市场价格',
  `sale_price` decimal(10,2) NOT NULL COMMENT '销售价格',
  `cost_price` decimal(10,2) DEFAULT NULL COMMENT '成本价格',
  `stock` int DEFAULT 0 COMMENT '库存数量',
  `weight` decimal(10,2) DEFAULT NULL COMMENT '重量（kg）',
  `barcode` varchar(100) DEFAULT NULL COMMENT '条形码',
  `attr_values` varchar(255) DEFAULT NULL COMMENT '属性值JSON字符串，格式：[{"attr_id":1,"attr_value":"黑色"},{"attr_id":2,"attr_value":"16G"}]',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sku_code` (`sku_code`),
  KEY `idx_product_id` (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU表';

-- 商品库存记录表
CREATE TABLE `product_stock_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID，主键',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `sku_id` bigint DEFAULT NULL COMMENT 'SKU ID，关联product_sku表',
  `original_stock` int NOT NULL COMMENT '原库存',
  `current_stock` int NOT NULL COMMENT '现库存',
  `change_quantity` int NOT NULL COMMENT '变化数量',
  `change_reason` varchar(255) DEFAULT NULL COMMENT '变化原因',
  `operator_id` bigint DEFAULT NULL COMMENT '操作人ID',
  `operator_name` varchar(50) DEFAULT NULL COMMENT '操作人姓名',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_sku_id` (`sku_id`),
  KEY `idx_create_time` (`create_time`),
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品库存记录表';

-- ----------------------------
-- 购物车相关表
-- ----------------------------

-- 购物车表
CREATE TABLE `shopping_cart` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '购物车ID，主键',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `sku_id` bigint DEFAULT NULL COMMENT 'SKU ID，关联product_sku表',
  `quantity` int NOT NULL DEFAULT 1 COMMENT '购买数量',
  `selected` tinyint DEFAULT 1 COMMENT '是否选中：0否，1是',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_product_sku` (`user_id`,`product_id`,`sku_id`),
  KEY `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- ----------------------------
-- 订单相关表
-- ----------------------------

-- 订单主表
CREATE TABLE `order_master` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID，主键',
  `order_sn` varchar(50) NOT NULL COMMENT '订单编号',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `order_status` tinyint NOT NULL DEFAULT 1 COMMENT '订单状态：1待支付，2已支付，3待发货，4已发货，5已完成，6已取消，7已退款',
  `payment_type` tinyint DEFAULT NULL COMMENT '支付方式：1微信支付，2支付宝，3货到付款',
  `payment_time` datetime DEFAULT NULL COMMENT '支付时间',
  `shipping_time` datetime DEFAULT NULL COMMENT '发货时间',
  `receive_time` datetime DEFAULT NULL COMMENT '收货时间',
  `close_time` datetime DEFAULT NULL COMMENT '关闭时间',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `discount_amount` decimal(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  `shipping_amount` decimal(10,2) DEFAULT 0.00 COMMENT '运费金额',
  `actual_amount` decimal(10,2) NOT NULL COMMENT '实际支付金额',
  `consignee` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) NOT NULL COMMENT '收货人手机号',
  `country` varchar(50) DEFAULT NULL COMMENT '国家',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `coupon_id` bigint DEFAULT NULL COMMENT '优惠券ID',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) NOT NULL COMMENT '区县',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `zip_code` varchar(20) DEFAULT NULL COMMENT '邮政编码',
  `shipping_company` varchar(50) DEFAULT NULL COMMENT '物流公司',
  `shipping_number` varchar(100) DEFAULT NULL COMMENT '物流单号',
  `user_note` varchar(255) DEFAULT NULL COMMENT '用户备注',
  `admin_note` varchar(255) DEFAULT NULL COMMENT '管理员备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_sn` (`order_sn`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_create_time` (`create_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- 订单商品明细表
CREATE TABLE `order_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '明细ID，主键',
  `order_id` bigint NOT NULL COMMENT '订单ID，关联order_master表',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `product_name` varchar(200) NOT NULL COMMENT '商品名称',
  `product_image` varchar(255) DEFAULT NULL COMMENT '商品图片',
  `sku_id` bigint DEFAULT NULL COMMENT 'SKU ID，关联product_sku表',
  `attr_values` varchar(255) DEFAULT NULL COMMENT '属性值JSON字符串',
  `quantity` int NOT NULL COMMENT '购买数量',
  `price` decimal(10,2) NOT NULL COMMENT '商品单价',
  `total_price` decimal(10,2) NOT NULL COMMENT '商品总价',
  `status` tinyint DEFAULT 1 COMMENT '状态：1正常，2退货中，3已退货',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `order_master` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品明细表';

-- 订单操作日志表
CREATE TABLE `order_operation_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID，主键',
  `order_id` bigint NOT NULL COMMENT '订单ID，关联order_master表',
  `operation_type` tinyint NOT NULL COMMENT '操作类型：1创建订单，2支付订单，3发货，4确认收货，5取消订单，6申请退款，7退款完成',
  `operator_id` bigint DEFAULT NULL COMMENT '操作人ID',
  `operator_name` varchar(50) DEFAULT NULL COMMENT '操作人姓名',
  `operation_note` varchar(255) DEFAULT NULL COMMENT '操作备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  FOREIGN KEY (`order_id`) REFERENCES `order_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单操作日志表';

-- 退款申请表
CREATE TABLE `refund_application` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '退款申请ID，主键',
  `order_id` bigint NOT NULL COMMENT '订单ID，关联order_master表',
  `order_detail_id` bigint NOT NULL COMMENT '订单明细ID，关联order_detail表',
  `refund_reason` varchar(255) NOT NULL COMMENT '退款原因',
  `refund_amount` decimal(10,2) NOT NULL COMMENT '退款金额',
  `refund_status` tinyint NOT NULL DEFAULT 1 COMMENT '退款状态：1申请中，2已同意，3已拒绝，4已完成',
  `refund_type` tinyint NOT NULL COMMENT '退款类型：1仅退款，2退货退款',
  `refund_note` varchar(255) DEFAULT NULL COMMENT '退款备注',
  `refund_time` datetime DEFAULT NULL COMMENT '退款时间',
  `admin_note` varchar(255) DEFAULT NULL COMMENT '管理员备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_refund_status` (`refund_status`),
  FOREIGN KEY (`order_id`) REFERENCES `order_master` (`id`),
  FOREIGN KEY (`order_detail_id`) REFERENCES `order_detail` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款申请表';

-- ----------------------------
-- 促销相关表
-- ----------------------------

-- 优惠券表
CREATE TABLE `coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '优惠券ID，主键',
  `coupon_name` varchar(100) NOT NULL COMMENT '优惠券名称',
  `coupon_type` tinyint NOT NULL COMMENT '优惠券类型：1满减券，2折扣券，3无门槛券',
  `amount` decimal(10,2) NOT NULL COMMENT '优惠金额/折扣率',
  `min_amount` decimal(10,2) DEFAULT 0.00 COMMENT '最低消费金额',
  `total_count` int DEFAULT NULL COMMENT '总发行量，null表示无限',
  `received_count` int DEFAULT 0 COMMENT '已领取数量',
  `used_count` int DEFAULT 0 COMMENT '已使用数量',
  `valid_type` tinyint NOT NULL COMMENT '有效期类型：1固定时间，2领取后N天有效',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `valid_days` int DEFAULT NULL COMMENT '有效天数',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `applicable_type` tinyint DEFAULT 1 COMMENT '适用类型：1全场通用，2指定分类，3指定商品',
  `applicable_value` varchar(255) DEFAULT NULL COMMENT '适用值，JSON格式，存储分类ID或商品ID列表',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- 用户优惠券表
CREATE TABLE `user_coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户优惠券ID，主键',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `coupon_id` bigint NOT NULL COMMENT '优惠券ID，关联coupon表',
  `coupon_code` varchar(50) NOT NULL COMMENT '优惠券码',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1未使用，2已使用，3已过期',
  `use_time` datetime DEFAULT NULL COMMENT '使用时间',
  `order_id` bigint DEFAULT NULL COMMENT '订单ID，关联order_master表',
  `obtain_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_coupon_code` (`coupon_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_coupon_id` (`coupon_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `order_master` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';

-- 限时折扣活动表
CREATE TABLE `flash_sale` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '活动ID，主键',
  `activity_name` varchar(100) NOT NULL COMMENT '活动名称',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='限时折扣活动表';

-- 限时折扣商品表
CREATE TABLE `flash_sale_product` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID，主键',
  `activity_id` bigint NOT NULL COMMENT '活动ID，关联flash_sale表',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `flash_price` decimal(10,2) NOT NULL COMMENT '活动价格',
  `stock` int NOT NULL COMMENT '活动库存',
  `sales_volume` int DEFAULT 0 COMMENT '已售数量',
  `max_purchase` int DEFAULT 1 COMMENT '每人限购数量',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_activity_product` (`activity_id`,`product_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`activity_id`) REFERENCES `flash_sale` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='限时折扣商品表';

-- ----------------------------
-- 评论相关表
-- ----------------------------

-- 商品评论表
CREATE TABLE `product_review` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '评论ID，主键',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `order_id` bigint NOT NULL COMMENT '订单ID，关联order_master表',
  `order_detail_id` bigint NOT NULL COMMENT '订单明细ID，关联order_detail表',
  `product_id` bigint NOT NULL COMMENT '商品ID，关联product表',
  `rating` tinyint NOT NULL COMMENT '评分：1-5分',
  `content` text NOT NULL COMMENT '评论内容',
  `status` tinyint DEFAULT 1 COMMENT '状态：0待审核，1已通过，2已拒绝',
  `is_anonymous` tinyint DEFAULT 0 COMMENT '是否匿名：0否，1是',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `order_master` (`id`),
  FOREIGN KEY (`order_detail_id`) REFERENCES `order_detail` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评论表';

-- 评论图片表
CREATE TABLE `review_image` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '图片ID，主键',
  `review_id` bigint NOT NULL COMMENT '评论ID，关联product_review表',
  `image_url` varchar(255) NOT NULL COMMENT '图片URL',
  `sort_order` int DEFAULT 0 COMMENT '排序值',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_review_id` (`review_id`),
  FOREIGN KEY (`review_id`) REFERENCES `product_review` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论图片表';

-- ----------------------------
-- 系统设置相关表
-- ----------------------------

-- 系统配置表
CREATE TABLE `system_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置ID，主键',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text NOT NULL COMMENT '配置值',
  `config_group` varchar(100) DEFAULT 'default' COMMENT '配置分组',
  `config_desc` varchar(255) DEFAULT NULL COMMENT '配置描述',
  `config_type` tinyint DEFAULT 1 COMMENT '配置类型：1文本，2数字，3布尔，4JSON，5数组',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`config_key`),
  KEY `idx_config_group` (`config_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 轮播图表
CREATE TABLE `banner` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '轮播图ID，主键',
  `title` varchar(100) DEFAULT NULL COMMENT '标题',
  `image_url` varchar(255) NOT NULL COMMENT '图片URL',
  `link_type` tinyint DEFAULT 1 COMMENT '链接类型：1商品，2分类，3自定义链接，4无链接',
  `link_value` varchar(255) DEFAULT NULL COMMENT '链接值，根据链接类型存储商品ID、分类ID或URL',
  `sort_order` int DEFAULT 0 COMMENT '排序值，值越小越靠前',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- 广告表
CREATE TABLE `advertisement` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '广告ID，主键',
  `ad_name` varchar(100) NOT NULL COMMENT '广告名称',
  `ad_position` varchar(50) NOT NULL COMMENT '广告位置',
  `image_url` varchar(255) NOT NULL COMMENT '图片URL',
  `link_type` tinyint DEFAULT 1 COMMENT '链接类型：1商品，2分类，3自定义链接，4无链接',
  `link_value` varchar(255) DEFAULT NULL COMMENT '链接值，根据链接类型存储商品ID、分类ID或URL',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ad_position` (`ad_position`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告表';

-- ----------------------------
-- 支付相关表
-- ----------------------------

-- 支付记录表
CREATE TABLE `payment_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '支付记录ID，主键',
  `order_id` bigint NOT NULL COMMENT '订单ID，关联order_master表',
  `payment_sn` varchar(50) NOT NULL COMMENT '支付流水号',
  `payment_type` tinyint NOT NULL COMMENT '支付方式：1微信支付，2支付宝，3货到付款',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '支付状态：1待支付，2支付成功，3支付失败，4已关闭',
  `transaction_id` varchar(100) DEFAULT NULL COMMENT '第三方支付交易号',
  `payment_time` datetime DEFAULT NULL COMMENT '支付时间',
  `callback_time` datetime DEFAULT NULL COMMENT '回调时间',
  `callback_data` text COMMENT '回调数据',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payment_sn` (`payment_sn`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`order_id`) REFERENCES `order_master` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

-- 退款记录表
CREATE TABLE `refund_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '退款记录ID，主键',
  `refund_application_id` bigint NOT NULL COMMENT '退款申请ID，关联refund_application表',
  `refund_sn` varchar(50) NOT NULL COMMENT '退款流水号',
  `refund_amount` decimal(10,2) NOT NULL COMMENT '退款金额',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '退款状态：1待退款，2退款中，3退款成功，4退款失败',
  `transaction_id` varchar(100) DEFAULT NULL COMMENT '第三方退款交易号',
  `refund_time` datetime DEFAULT NULL COMMENT '退款时间',
  `callback_time` datetime DEFAULT NULL COMMENT '回调时间',
  `callback_data` text COMMENT '回调数据',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_refund_sn` (`refund_sn`),
  KEY `idx_refund_application_id` (`refund_application_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`refund_application_id`) REFERENCES `refund_application` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款记录表';

-- ----------------------------
-- 会员相关表
-- ----------------------------

-- 会员等级表
CREATE TABLE `member_level` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '等级ID，主键',
  `level_name` varchar(50) NOT NULL COMMENT '等级名称',
  `level_value` int NOT NULL COMMENT '等级值',
  `min_points` int NOT NULL COMMENT '最低积分',
  `max_points` int DEFAULT NULL COMMENT '最高积分，null表示无限',
  `discount_rate` decimal(5,2) DEFAULT 100.00 COMMENT '折扣率，例如95.00表示95折',
  `description` varchar(255) DEFAULT NULL COMMENT '等级描述',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_level_value` (`level_value`),
  KEY `idx_min_points` (`min_points`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员等级表';

-- 积分记录表
CREATE TABLE `points_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID，主键',
  `user_id` bigint NOT NULL COMMENT '用户ID，关联user表',
  `order_id` bigint DEFAULT NULL COMMENT '订单ID，关联order_master表',
  `points` int NOT NULL COMMENT '积分数量，正数表示增加，负数表示减少',
  `balance` int NOT NULL COMMENT '积分余额',
  `reason` varchar(255) NOT NULL COMMENT '积分变动原因',
  `expire_time` datetime DEFAULT NULL COMMENT '积分过期时间，null表示永不过期',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_create_time` (`create_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `order_master` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分记录表';

-- ----------------------------
-- 后台管理相关表
-- ----------------------------
-- 角色表
CREATE TABLE `admin_role` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID，主键',
  `role_name` varchar(50) NOT NULL COMMENT '角色名称',
  `role_desc` varchar(255) DEFAULT NULL COMMENT '角色描述',
  `permissions` text COMMENT '权限列表，JSON格式',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 管理员表
CREATE TABLE `admin_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '管理员ID，主键',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(50) DEFAULT NULL COMMENT '邮箱',
  `role_id` bigint DEFAULT NULL COMMENT '角色ID，关联admin_role表',
  `status` tinyint DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`),
  KEY `idx_role_id` (`role_id`),
  FOREIGN KEY (`role_id`) REFERENCES `admin_role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 操作日志表
CREATE TABLE `admin_operation_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID，主键',
  `admin_id` bigint DEFAULT NULL COMMENT '管理员ID，关联admin_user表',
  `admin_username` varchar(50) DEFAULT NULL COMMENT '管理员用户名',
  `operation_type` varchar(50) NOT NULL COMMENT '操作类型',
  `operation_content` text COMMENT '操作内容',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(255) DEFAULT NULL COMMENT '用户代理',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_create_time` (`create_time`),
  FOREIGN KEY (`admin_id`) REFERENCES `admin_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';  

CREATE TABLE sign_in (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '签到记录ID',
    user_id INT NOT NULL COMMENT '用户ID，外键关联users表',
    sign_date DATE NOT NULL COMMENT '签到日期',
    points INT NOT NULL COMMENT '获得积分',
    continuous_days INT DEFAULT 1 COMMENT '连续签到天数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='签到表';
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    name VARCHAR(50) NOT NULL COMMENT '任务名称',
    description VARCHAR(255) COMMENT '任务描述',
    icon VARCHAR(50) COMMENT '任务图标标识',
    points_reward INT NOT NULL COMMENT '奖励积分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='任务表';
CREATE TABLE user_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户任务ID',
    user_id INT NOT NULL COMMENT '用户ID，外键关联users表',
    task_id INT NOT NULL COMMENT '任务ID，外键关联tasks表',
    status INT NOT NULL COMMENT '完成状态（0未完成/1已完成）',
    completed_at TIMESTAMP COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT='用户任务表';

CREATE TABLE strings (
    id VARCHAR(50) PRIMARY KEY COMMENT '线材ID',
    name VARCHAR(50) NOT NULL COMMENT '线材名称',
    brand VARCHAR(50) NOT NULL COMMENT '品牌',
    description TEXT COMMENT '描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    stock INT NOT NULL COMMENT '库存',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='线材表';
CREATE TABLE string_service (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '穿线服务ID',
    user_id INT NOT NULL COMMENT '用户ID，外键关联users表',
    racket_brand VARCHAR(50) NOT NULL COMMENT '球拍品牌型号',
    pounds INT NOT NULL COMMENT '磅数',
    string_id VARCHAR(50) NOT NULL COMMENT '线材ID，外键关联strings表',
    remark TEXT COMMENT '备注',
    status VARCHAR(20) NOT NULL COMMENT '状态（pending待接单/processing处理中/completed已完成）',
    total_price DECIMAL(10,2) NOT NULL COMMENT '总价格',
    estimated_time VARCHAR(50) COMMENT '预计完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (string_id) REFERENCES strings(id)
) COMMENT='穿线服务表';

CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '推广ID',
    user_id INT NOT NULL COMMENT '用户ID，外键关联users表',
    invite_code VARCHAR(50) NOT NULL UNIQUE COMMENT '邀请码',
    total_earnings DECIMAL(10,2) DEFAULT 0 COMMENT '累计收益',
    account_balance DECIMAL(10,2) DEFAULT 0 COMMENT '账户余额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='推广返佣表';
CREATE TABLE commission_records (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '佣金记录ID',
    promotion_id INT NOT NULL COMMENT '推广ID，外键关联promotions表',
    amount DECIMAL(10,2) NOT NULL COMMENT '佣金金额',
    description VARCHAR(255) COMMENT '描述',
    type VARCHAR(20) NOT NULL COMMENT '类型（invite邀请/commission返佣）',
    status VARCHAR(20) NOT NULL COMMENT '状态（pending待到账/settled已到账）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
) COMMENT='佣金记录表';
CREATE TABLE withdraw_records (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '提现记录ID',
    promotion_id INT NOT NULL COMMENT '推广ID，外键关联promotions表',
    amount DECIMAL(10,2) NOT NULL COMMENT '提现金额',
    status VARCHAR(20) NOT NULL COMMENT '状态（pending待处理/settled已到账/rejected已拒绝）',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '提现单号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
) COMMENT='提现记录表';

CREATE TABLE product_groups (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分组ID',
    group_name VARCHAR(50) NOT NULL COMMENT '分组名称',
    group_desc VARCHAR(255) COMMENT '分组描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='商品分组表';
CREATE TABLE group_products (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '分组商品ID',
    group_id INT NOT NULL COMMENT '分组ID，外键关联product_groups表',
    product_id INT NOT NULL COMMENT '商品ID，外键关联products表',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (group_id) REFERENCES product_groups(id)
) COMMENT='分组商品表';
CREATE TABLE points_exchange_goods (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '兑换商品ID',
    name VARCHAR(255) NOT NULL COMMENT '商品名称',
    img VARCHAR(255) NOT NULL COMMENT '商品图片URL',
    points INT NOT NULL COMMENT '所需积分',
    stock INT NOT NULL COMMENT '库存',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='积分兑换商品表';
CREATE TABLE points_exchange_records (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '兑换记录ID',
    user_id INT NOT NULL COMMENT '用户ID，外键关联users表',
    goods_id INT NOT NULL COMMENT '兑换商品ID，外键关联points_exchange_goods表',
    points INT NOT NULL COMMENT '消耗积分',
    status VARCHAR(20) NOT NULL COMMENT '状态（pending待发货/shipped已发货/delivered已送达）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (goods_id) REFERENCES points_exchange_goods(id)
) COMMENT='积分兑换记录表';