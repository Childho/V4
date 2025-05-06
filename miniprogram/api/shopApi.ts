import { apiRequest } from './utils/request';

/**
 * 商品分类
 */
export interface Category {
  id: number;      // 分类ID
  name: string;    // 分类名称
  iconUrl: string; // 分类图标URL
}

/**
 * 获取商品分类
 * @returns 分类列表
 */
export function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/api/shop/categories', {});
}

/**
 * 商品项
 */
export interface ProductItem {
  id: number;         // 商品ID
  name: string;       // 商品名称
  imageUrl: string;   // 商品图片URL
  price: number;      // 商品价格（单位：分）
  originalPrice: number; // 原价（单位：分）
  sales: number;      // 销量
  inventory: number;  // 库存
  categoryId: number; // 所属分类ID
}

/**
 * 商品列表分页结果
 */
export interface ProductListResult {
  list: ProductItem[]; // 商品列表
  total: number;      // 总数量
  page: number;       // 当前页码
  pageSize: number;   // 每页数量
}

/**
 * 获取商品列表
 * @param params 查询参数
 * @returns 商品列表及分页信息
 */
export function getProductList(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  keyword?: string;
} = {}): Promise<ProductListResult> {
  return apiRequest<ProductListResult>('/api/shop/products', params);
}

/**
 * 商品详情
 */
export interface ProductDetail extends ProductItem {
  description: string; // 商品详细描述
  images: string[];    // 商品图片列表
  specs: {             // 商品规格
    id: number;
    name: string;
    price: number;
    inventory: number;
  }[];
}

/**
 * 获取商品详情
 * @param id 商品ID
 * @returns 商品详情
 */
export function getProductDetail(id: number): Promise<ProductDetail> {
  return apiRequest<ProductDetail>('/api/shop/product/detail', { id });
}

/**
 * 创建订单参数
 */
export interface CreateOrderParams {
  productId: number;  // 商品ID
  count: number;      // 购买数量
  specId?: number;    // 规格ID
  address?: {         // 收货地址
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  };
}

/**
 * 创建订单结果
 */
export interface CreateOrderResult {
  orderId: string;    // 订单ID
  totalAmount: number; // 订单总金额（单位：分）
}

/**
 * 创建订单
 * @param params 订单参数
 * @returns 创建结果
 */
export function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  return apiRequest<CreateOrderResult>('/api/shop/order/create', params);
}

/**
 * 订单项
 */
export interface OrderItem {
  id: string;         // 订单ID
  productId: number;  // 商品ID
  productName: string; // 商品名称
  productImage: string; // 商品图片
  price: number;      // 订单价格（单位：分）
  count: number;      // 购买数量
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'; // 订单状态
  createTime: string; // 创建时间
}

/**
 * 订单列表分页结果
 */
export interface OrderListResult {
  list: OrderItem[];  // 订单列表
  total: number;      // 总数量
  page: number;       // 当前页码
  pageSize: number;   // 每页数量
}

/**
 * 获取订单列表
 * @param params 查询参数
 * @returns 订单列表及分页信息
 */
export function getOrderList(params: {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
} = {}): Promise<OrderListResult> {
  return apiRequest<OrderListResult>('/api/shop/order/list', params);
} 