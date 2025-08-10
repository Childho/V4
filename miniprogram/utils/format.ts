// 日期格式化
export const formatDate = (date: Date | string | number, format = 'YYYY-MM-DD'): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()

  return format
    .replace('YYYY', String(year))
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hour.toString().padStart(2, '0'))
    .replace('mm', minute.toString().padStart(2, '0'))
    .replace('ss', second.toString().padStart(2, '0'))
}

// 价格格式化
export const formatPrice = (price: number | string): string => {
  const num = Number(price)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

// 手机号格式化
export const formatPhone = (phone: string): string => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
} 