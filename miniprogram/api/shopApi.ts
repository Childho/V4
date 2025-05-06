import { request } from '../utils/request'

// 获取商品列表
export const getProductList = (data: {
  category?: string
  keyword?: string
  page?: number
  pageSize?: number
}) => {
  return request('/api/shop/products', data)
}

// 获取商品详情
export const getProductDetail = (data: {
  productId: string
}) => {
  return request('/api/shop/product/detail', data)
}

// 创建订单
export const createOrder = (data: {
  productId: string
  quantity: number
  addressId: string
}) => {
  return request('/api/shop/order/create', data)
}

// 获取订单列表
export const getOrderList = (data: {
  status?: 'all' | 'unpaid' | 'paid' | 'shipped' | 'completed'
  page?: number
  pageSize?: number
}) => {
  return request('/api/shop/order/list', data)
} 