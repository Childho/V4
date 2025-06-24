// 商品详情页面
import { 
  getProductDetail, 
  getProductComments, 
  getRelatedProducts, 
  addToCart, 
  toggleFavorite, 
  getCartCount,
  buyNow 
} from '../../api/productApi';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,               // 页面加载状态，默认false避免初始白屏
    cartCount: 0,                 // 购物车商品数量
    showSpecsPopup: false,        // 是否显示规格选择弹窗
    quantity: 1,                  // 选择的商品数量
    selectedSpecs: '',            // 已选择的规格文本显示
    selectedOptions: {},          // 已选择的规格选项数据
    currentAction: '',            // 当前操作：'cart'加入购物车 或 'buy'立即购买
    
    // 商品信息 - 设置默认值避免页面空白
    product: {
      id: '',
      name: '商品信息加载中...',
      price: '0.00',
      originalPrice: '',
      description: '商品描述加载中...',
      brand: '',
      salesCount: 0,
      shippingInfo: '24小时发货',
      isFavorite: false,
      images: [
        // 设置默认占位图，避免轮播图显示异常
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWVhuWTgeWbvueJh+WKoOi9veS4rS4uLjwvdGV4dD48L3N2Zz4='
      ],
      specs: [],
      detailContent: '<p style="text-align:center;color:#999;">详情加载中...</p>',
      optionGroups: []
    },
    
    // 评论数据
    comments: {
      total: 0,
      averageRating: 5.0,
      tags: [],
      list: []
    },
    
    // 相关推荐商品
    relatedProducts: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('[Product Detail] onLoad options:', options);
    
    const { id } = options;
    
    if (!id) {
      // 如果没有商品ID，显示错误并返回
      wx.showToast({
        title: '商品ID不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 设置商品ID
    this.setData({
      'product.id': id
    });
    
    // 延迟一小段时间再加载数据，确保页面已渲染
    setTimeout(() => {
      this.loadPageData(id);
    }, 100);
  },

  /**
   * 页面显示时的处理
   */
  onShow() {
    // 更新购物车数量
    this.updateCartCount();
  },

  /**
   * 并行加载页面所需的所有数据
   */
  async loadPageData(productId) {
    console.log('[Product Detail] 开始加载商品数据, productId:', productId);
    
    try {
      this.setData({ loading: true });
      
      // 先加载商品基本信息，再并行加载其他数据
      const productData = await this.getProductDetail(productId);
      
      if (productData) {
        this.setData({ product: productData });
        console.log('[Product Detail] 商品数据加载成功:', productData);
      }
      
      // 并行加载评论和购物车数量
      const [commentsData, cartCountData] = await Promise.allSettled([
        this.getProductComments(productId),
        this.getCartCount()
      ]);

      // 处理评论数据
      if (commentsData.status === 'fulfilled' && commentsData.value) {
        this.setData({ comments: commentsData.value });
      }

      // 处理购物车数量
      if (cartCountData.status === 'fulfilled' && cartCountData.value !== undefined) {
        this.setData({ cartCount: cartCountData.value });
      }

      // 加载相关推荐
      this.getRelatedProducts(productId);

    } catch (error) {
      console.error('[Load Page Data Error]', error);
      wx.showToast({
        title: '页面加载失败',
        icon: 'none'
      });
    } finally {
      // 确保loading状态会被关闭
      this.setData({ loading: false });
    }
  },

  /**
   * 获取商品详情
   */
  async getProductDetail(productId) {
    try {
      console.log('[Product Detail] 尝试获取商品详情...');
      const productData = await getProductDetail(productId);
      console.log('[Product Detail] API返回数据:', productData);
      return productData;
    } catch (error) {
      console.error('[Get Product Detail Error]', error);
      console.log('[Product Detail] API调用失败，使用模拟数据');
      // 使用模拟数据作为备用方案
      return this.getMockProductData(productId);
    }
  },

  /**
   * 获取商品评论
   */
  async getProductComments(productId) {
    try {
      const commentsData = await getProductComments(productId, 1, 10);
      return commentsData;
    } catch (error) {
      console.error('[Get Product Comments Error]', error);
      // 返回模拟评论数据
      return this.getMockCommentsData();
    }
  },

  /**
   * 获取相关推荐商品
   */
  async getRelatedProducts(productId) {
    try {
      const relatedData = await getRelatedProducts(productId);
      this.setData({ relatedProducts: relatedData });
    } catch (error) {
      console.error('[Get Related Products Error]', error);
      // 设置模拟推荐数据
      this.setData({ relatedProducts: this.getMockRelatedProducts() });
    }
  },

  /**
   * 获取购物车数量
   */
  async getCartCount() {
    try {
      const count = await getCartCount();
      return count;
    } catch (error) {
      console.error('[Get Cart Count Error]', error);
      return 2; // 返回一个默认值用于演示
    }
  },

  /**
   * 显示规格选择弹窗
   */
  showSpecsPopup() {
    this.setData({ showSpecsPopup: true });
  },

  /**
   * 关闭规格选择弹窗
   */
  closeSpecsPopup() {
    this.setData({ showSpecsPopup: false });
  },

  /**
   * 选择规格选项
   */
  selectOption(e) {
    const { groupIndex, optionIndex } = e.currentTarget.dataset;
    const { product, selectedOptions } = this.data;
    
    // 更新选中状态
    const optionGroups = [...product.optionGroups];
    const group = optionGroups[groupIndex];
    
    // 清除该组的其他选项
    group.options.forEach(option => option.selected = false);
    // 选中当前选项
    group.options[optionIndex].selected = true;
    
    // 更新已选规格数据
    selectedOptions[group.name] = group.options[optionIndex].value;
    
    this.setData({
      'product.optionGroups': optionGroups,
      selectedOptions
    });
    
    // 更新规格显示文本
    this.updateSelectedSpecs();
  },

  /**
   * 更新已选择规格的显示文本
   */
  updateSelectedSpecs() {
    const { selectedOptions } = this.data;
    const specsArray = Object.values(selectedOptions);
    const specsText = specsArray.length > 0 ? specsArray.join(' ') : '';
    
    this.setData({ selectedSpecs: specsText });
  },

  /**
   * 减少数量
   */
  decreaseQuantity() {
    const quantity = Math.max(1, this.data.quantity - 1);
    this.setData({ quantity });
  },

  /**
   * 增加数量
   */
  increaseQuantity() {
    const quantity = this.data.quantity + 1;
    this.setData({ quantity });
  },

  /**
   * 添加到购物车按钮点击
   */
  handleAddToCart() {
    // 检查规格是否完整选择
    if (!this.checkAllSpecsSelected()) {
      this.setData({ 
        currentAction: 'cart',
        showSpecsPopup: true 
      });
      return;
    }
    
    // 直接添加到购物车
    this.confirmAddToCart();
  },

  /**
   * 立即购买按钮点击
   */
  handleBuyNow() {
    // 检查规格是否完整选择
    if (!this.checkAllSpecsSelected()) {
      this.setData({ 
        currentAction: 'buy',
        showSpecsPopup: true 
      });
      return;
    }
    
    // 直接购买
    this.confirmBuyNow();
  },

  /**
   * 确认添加到购物车
   */
  async confirmAddToCart() {
    const { product, quantity, selectedOptions } = this.data;
    
    try {
      wx.showLoading({ title: '添加中...' });
      
      await addToCart({
        productId: product.id,
        quantity,
        specs: selectedOptions
      });
      
      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
      
      // 更新购物车数量
      this.updateCartCount();
      
      // 关闭弹窗
      this.closeSpecsPopup();
      
    } catch (error) {
      console.error('[Add To Cart Error]', error);
      // 模拟成功添加（用于演示）
      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
      const newCount = this.data.cartCount + 1;
      this.setData({ cartCount: newCount });
      this.closeSpecsPopup();
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 确认立即购买
   */
  async confirmBuyNow() {
    const { product, quantity, selectedOptions } = this.data;
    
    try {
      wx.showLoading({ title: '正在跳转...' });
      
      const orderData = await buyNow({
        productId: product.id,
        quantity,
        specs: selectedOptions
      });
      
      // 关闭弹窗
      this.closeSpecsPopup();
      
      // 跳转到订单确认页
      wx.navigateTo({
        url: `/pages/order-confirm/index?data=${encodeURIComponent(JSON.stringify(orderData))}`
      });
      
    } catch (error) {
      console.error('[Buy Now Error]', error);
      // 模拟跳转（用于演示）
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 更新购物车数量
   */
  async updateCartCount() {
    try {
      const count = await this.getCartCount();
      this.setData({ cartCount: count });
    } catch (error) {
      console.error('[Update Cart Count Error]', error);
    }
  },

  /**
   * 检查是否所有规格都已选择
   */
  checkAllSpecsSelected() {
    const { product, selectedOptions } = this.data;
    
    if (!product.optionGroups || product.optionGroups.length === 0) {
      return true; // 没有规格选项，视为已完成选择
    }
    
    return product.optionGroups.every(group => 
      selectedOptions[group.name] !== undefined
    );
  },

  /**
   * 添加/取消收藏
   */
  async handleAddFavorite() {
    const { product } = this.data;
    
    try {
      await toggleFavorite(product.id, product.isFavorite);
      
      // 更新收藏状态
      this.setData({
        'product.isFavorite': !product.isFavorite
      });
      
      wx.showToast({
        title: product.isFavorite ? '已取消收藏' : '已加入收藏',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('[Toggle Favorite Error]', error);
      // 模拟成功操作（用于演示）
      const newStatus = !product.isFavorite;
      this.setData({
        'product.isFavorite': newStatus
      });
      wx.showToast({
        title: newStatus ? '已加入收藏' : '已取消收藏',
        icon: 'success'
      });
    }
  },

  /**
   * 跳转到购物车
   */
  handleToCart() {
    wx.switchTab({
      url: '/pages/cart/index'
    }).catch(() => {
      // 如果switchTab失败，使用navigateTo
      wx.navigateTo({
        url: '/pages/cart/index'
      }).catch(() => {
        wx.showToast({
          title: '购物车页面开发中',
          icon: 'none'
        });
      });
    });
  },

  /**
   * 跳转到评论详情页
   */
  navigateToComments() {
    const { product } = this.data;
    wx.navigateTo({
      url: `/pages/product-comments/index?productId=${product.id}`
    }).catch(() => {
      wx.showToast({
        title: '评论详情页开发中',
        icon: 'none'
      });
    });
  },

  /**
   * 跳转到相关商品详情
   */
  navigateToProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.redirectTo({
      url: `/pages/productDetail/index?id=${id}`
    });
  },

  /**
   * 模拟商品数据（接口调用失败时的备用方案）
   */
  getMockProductData(productId) {
    return {
      id: productId,
      name: 'YONEX 网球拍 VR-800 专业训练拍',
      price: '899.00',
      originalPrice: '1299.00',
      description: '轻量碳素纤维材质，适合初学者和进阶球员使用',
      brand: 'YONEX',
      salesCount: 256,
      shippingInfo: '24小时发货',
      isFavorite: false,
      images: [
        'https://img.alicdn.com/imgextra/i1/6000000003702/O1CN01XbWYnV1JjqS8vYm45_!!6000000003702-0-tps-800-800.jpg',
        'https://img.alicdn.com/imgextra/i2/6000000003702/O1CN01YvWJ8C1JjqS8vYm45_!!6000000003702-0-tps-800-800.jpg',
        'https://img.alicdn.com/imgextra/i3/6000000003702/O1CN01ZwXK9D1JjqS8vYm45_!!6000000003702-0-tps-800-800.jpg'
      ],
      specs: [
        { name: '材质', value: '碳素纤维' },
        { name: '规格', value: '27英寸' },
        { name: '重量', value: '280g' },
        { name: '适用人群', value: '成人' },
        { name: '保修期', value: '12个月' }
      ],
      detailContent: `
        <div style="text-align:center;">
          <img src="https://img.alicdn.com/imgextra/i4/6000000003702/O1CN01detail1_!!6000000003702-0-tps-800-800.jpg" style="width:100%;max-width:800px;" />
          <p style="color:#333;font-size:16px;line-height:1.6;padding:20px;">
            YONEX VR-800 是一款专业的网球拍，采用高质量的碳素纤维材质，能够提供良好的控制性和舒适的手感。
            特殊的框架设计增强了拍面稳定性，减少振动，降低手臂疲劳。适合初学者和进阶球员使用。
          </p>
        </div>
      `,
      optionGroups: [
        {
          name: '颜色',
          options: [
            { value: '蓝色', selected: false, disabled: false },
            { value: '红色', selected: false, disabled: false },
            { value: '黑色', selected: false, disabled: false }
          ]
        },
        {
          name: '规格',
          options: [
            { value: '标准版', selected: false, disabled: false },
            { value: '豪华版', selected: false, disabled: false }
          ]
        }
      ]
    };
  },

  /**
   * 模拟评论数据
   */
  getMockCommentsData() {
    return {
      total: 128,
      averageRating: 4.8,
      tags: ['质量好', '发货快', '包装精美', '性价比高'],
      list: [
        {
          id: '1',
          username: '用户***123',
          userAvatar: 'https://img.alicdn.com/imgextra/i1/6000000003702/O1CN01avatar1_!!6000000003702-0-tps-100-100.jpg',
          rating: 5,
          content: '商品质量很好，发货速度也很快，包装很精美，值得推荐！',
          images: ['https://img.alicdn.com/imgextra/i1/6000000003702/O1CN01comment1_!!6000000003702-0-tps-200-200.jpg'],
          createTime: '2024-01-15'
        },
        {
          id: '2',
          username: '用户***456',
          userAvatar: 'https://img.alicdn.com/imgextra/i2/6000000003702/O1CN01avatar2_!!6000000003702-0-tps-100-100.jpg',
          rating: 4,
          content: '性价比不错，使用体验良好。',
          images: [],
          createTime: '2024-01-14'
        }
      ]
    };
  },

  /**
   * 模拟相关推荐数据
   */
  getMockRelatedProducts() {
    return [
      {
        id: 'product_2',
        name: 'VICTOR 专业球鞋',
        price: '499.00',
        imageUrl: 'https://img.alicdn.com/imgextra/i1/6000000003702/O1CN01related1_!!6000000003702-0-tps-400-400.jpg'
      },
      {
        id: 'product_3',
        name: '高弹性网球 8只装',
        price: '129.00',
        imageUrl: 'https://img.alicdn.com/imgextra/i2/6000000003702/O1CN01related2_!!6000000003702-0-tps-400-400.jpg'
      },
      {
        id: 'product_4',
        name: '专业运动护腕',
        price: '69.00',
        imageUrl: 'https://img.alicdn.com/imgextra/i3/6000000003702/O1CN01related3_!!6000000003702-0-tps-400-400.jpg'
      }
    ];
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { product } = this.data;
    return {
      title: product.name || '精选好物推荐',
      path: `/pages/productDetail/index?id=${product.id}`,
      imageUrl: product.images[0] || ''
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const { product } = this.data;
    return {
      title: `${product.name} - 仅需¥${product.price}`,
      imageUrl: product.images[0] || ''
    };
  }
}); 