/**
 * 订单确认页面测试辅助工具
 * 用于快速设置测试数据和测试各种场景
 * 注意：此文件仅用于开发测试，生产环境请删除
 */

// 环境判断 - 只在开发环境启用
const isDev = process.env.NODE_ENV === 'development' || __wxConfig.envVersion === 'develop';

/**
 * 设置测试收货地址
 */
export function setTestAddress() {
  if (!isDev) {
    console.warn('测试功能仅限开发环境使用');
    return null;
  }
  
  const testAddress = {
    id: 'addr_001',
    name: '张三',
    phone: '13800138000',
    address: '北京市朝阳区三里屯街道工体北路8号院1号楼1单元101室',
    isDefault: true
  };
  
  try {
    wx.setStorageSync('selectedAddress', testAddress);
    console.log('测试地址设置成功：', testAddress);
    return testAddress;
  } catch (error) {
    console.error('设置测试地址失败：', error);
    return null;
  }
}

/**
 * 设置测试优惠券
 */
export function setTestCoupon() {
  if (!isDev) {
    console.warn('测试功能仅限开发环境使用');
    return null;
  }
  
  const testCoupon = {
    id: 'coupon_001',
    name: '新用户优惠券',
    discount: 10.00,
    minAmount: 50.00,
    type: 'cash', // cash: 现金券, percent: 折扣券
    expireTime: '2024-12-31 23:59:59'
  };
  
  try {
    wx.setStorageSync('selectedCoupon', testCoupon);
    console.log('测试优惠券设置成功：', testCoupon);
    return testCoupon;
  } catch (error) {
    console.error('设置测试优惠券失败：', error);
    return null;
  }
}

/**
 * 生成测试商品数据
 */
export function generateTestGoods(count = 2) {
  if (!isDev) {
    console.warn('测试功能仅限开发环境使用');
    return [];
  }
  
  const testGoods = [];
  
  for (let i = 1; i <= count; i++) {
    testGoods.push({
      id: `goods_${String(i).padStart(3, '0')}`,
      name: `测试商品${i} - NCS#75速【多啦A梦${i % 2 === 1 ? '黄' : '蓝'}】【3只装】`,
      image: `https://via.placeholder.com/120x120/${i % 2 === 1 ? 'ff9800' : '2196f3'}/fff?text=商品${i}`,
      spec: `颜色：${i % 2 === 1 ? '黄色' : '蓝色'} 规格：3只装`,
      price: 15.00 + (i * 5),
      quantity: i,
      category: '测试分类',
      brand: '测试品牌'
    });
  }
  
  console.log('生成测试商品数据：', testGoods);
  return testGoods;
}

/**
 * 快速跳转到订单确认页面（用于开发测试）
 */
export function quickNavigateToOrderConfirm(goodsCount = 2) {
  if (!isDev) {
    console.warn('测试功能仅限开发环境使用');
    return;
  }
  
  const testGoods = generateTestGoods(goodsCount);
  
  wx.navigateTo({
    url: `/pages/order-confirm/order-confirm?goods=${encodeURIComponent(JSON.stringify(testGoods))}`,
    success: () => {
      console.log('快速跳转到订单确认页面成功');
    },
    fail: (error) => {
      console.error('快速跳转失败：', error);
      wx.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
}

/**
 * 清除所有测试数据
 */
export function clearTestData() {
  if (!isDev) {
    console.warn('测试功能仅限开发环境使用');
    return;
  }
  
  try {
    wx.removeStorageSync('selectedAddress');
    wx.removeStorageSync('selectedCoupon');
    wx.removeStorageSync('checkoutItems');
    wx.removeStorageSync('checkoutTotal');
    wx.removeStorageSync('checkoutDiscount');
    console.log('测试数据清除成功');
    
    wx.showToast({
      title: '测试数据已清除',
      icon: 'success'
    });
  } catch (error) {
    console.error('清除测试数据失败：', error);
  }
}

/**
 * 模拟不同的测试场景
 */
export const testScenarios = {
  // 场景1：有地址有优惠券
  withAddressAndCoupon: () => {
    if (!isDev) {
      console.warn('测试功能仅限开发环境使用');
      return;
    }
    setTestAddress();
    setTestCoupon();
    quickNavigateToOrderConfirm(2);
  },
  
  // 场景2：无地址无优惠券
  withoutAddressAndCoupon: () => {
    if (!isDev) {
      console.warn('测试功能仅限开发环境使用');
      return;
    }
    clearTestData();
    quickNavigateToOrderConfirm(1);
  },
  
  // 场景3：多商品测试
  withManyGoods: () => {
    if (!isDev) {
      console.warn('测试功能仅限开发环境使用');
      return;
    }
    setTestAddress();
    quickNavigateToOrderConfirm(5);
  },
  
  // 场景4：单商品测试
  withSingleGood: () => {
    if (!isDev) {
      console.warn('测试功能仅限开发环境使用');
      return;
    }
    setTestAddress();
    setTestCoupon();
    quickNavigateToOrderConfirm(1);
  }
};

/**
 * 在控制台显示测试菜单（仅开发环境）
 */
export function showTestMenu() {
  if (!isDev) {
    console.warn('测试功能仅限开发环境使用');
    return;
  }
  
  console.log(`
=== 订单确认页面测试菜单 ===

1. 测试场景：
   - testScenarios.withAddressAndCoupon() // 有地址有优惠券
   - testScenarios.withoutAddressAndCoupon() // 无地址无优惠券  
   - testScenarios.withManyGoods() // 多商品测试
   - testScenarios.withSingleGood() // 单商品测试

2. 数据设置：
   - setTestAddress() // 设置测试地址
   - setTestCoupon() // 设置测试优惠券
   - generateTestGoods(count) // 生成测试商品

3. 页面跳转：
   - quickNavigateToOrderConfirm(goodsCount) // 快速跳转

4. 数据清理：
   - clearTestData() // 清除所有测试数据

使用方法：在控制台中调用上述方法进行测试
例如：testScenarios.withAddressAndCoupon()
`);
}

// 仅在开发环境自动显示测试菜单
if (isDev) {
  showTestMenu();
} 