// 引入搜索相关的API
const { searchProducts, getCategories, getBrands } = require('../../api/searchApi');

Page({
  data: {
    // 搜索关键词，从页面参数获取
    keyword: '',
    
    // 分类导航数据（固定的6个分类）
    categories: [
      { id: 1, name: '羽毛球拍', icon: '🏸' },
      { id: 2, name: '球鞋', icon: '👟' },
      { id: 3, name: '球服', icon: '👕' },
      { id: 4, name: '球包', icon: '🎒' },
      { id: 5, name: '羽毛球', icon: '🏸' },
      { id: 6, name: '运动必备', icon: '⚡' }
    ],
    
    // 当前选中的分类ID
    currentCategoryId: 0,
    
    // 排序选项
    sortOptions: [
      { type: 'sales', name: '销量', active: true },
      { type: 'price', name: '价格', active: false }
    ],
    
    // 当前排序类型
    currentSortType: 'sales',
    
    // 品牌列表（用于筛选弹窗）
    brands: [
      { id: 1, name: '李宁', selected: false },
      { id: 2, name: '威克多', selected: false },
      { id: 3, name: '倍特爱', selected: false },
      { id: 4, name: '威肯', selected: false },
      { id: 5, name: '超牌', selected: false },
      { id: 6, name: '泰昂', selected: false },
      { id: 7, name: '翎美', selected: false },
      { id: 8, name: '尤尼克斯', selected: false },
      { id: 9, name: '亚狮龙', selected: false },
      { id: 10, name: 'GOSEN', selected: false }
    ],
    
    // 选中的品牌ID数组
    selectedBrandIds: [],
    
    // 是否显示品牌筛选弹窗
    showBrandModal: false,
    
    // 商品列表数据
    productList: [],
    
    // 分页参数
    page: 1,
    pageSize: 10,
    hasMore: true,
    
    // 加载状态
    loading: false,
    loadingMore: false,
    
    // 状态栏高度
    statusBarHeight: 0,

    // 搜索类型参数
    searchType: '',
    searchSource: ''
  },

  // 页面加载时执行
  onLoad(options) {
    console.log('搜索页面加载，参数：', options);
    
    // 获取系统信息，设置状态栏高度
    this.setStatusBarHeight();
    
    // 从页面参数获取搜索关键词，并进行URL解码处理
    let keyword = options.keyword || '';
    if (keyword) {
      try {
        // 对URL编码的中文关键词进行解码（如 %E4%B8%89 -> 三）
        keyword = decodeURIComponent(keyword);
        console.log('关键词解码成功:', keyword);
      } catch (e) {
        console.warn('关键词解码失败，使用原始值:', e);
        // 如果解码失败，使用原始值
      }
    }
    
    // 获取搜索类型参数
    const searchType = options.type || '';
    console.log('搜索类型:', searchType);
    
    // 如果是从首页搜索过来的，显示提示
    if (searchType === 'product') {
      console.log('来自首页的商品搜索');
      // 可以设置一个标志来显示不同的搜索提示
      this.setData({
        searchType: 'product',
        searchSource: 'index'
      });
    }
    
    this.setData({
      keyword: keyword
    });
    
    // 始终加载商品列表，无论是否有关键词
    this.searchProducts();
  },

  // 设置状态栏高度
  setStatusBarHeight() {
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 44; // 默认44px
    
    // 将状态栏高度转换为rpx（微信小程序中 1px = 2rpx）
    const statusBarHeightRpx = statusBarHeight * 2;
    
    this.setData({
      statusBarHeight: statusBarHeightRpx
    });
    
    console.log('状态栏高度:', statusBarHeight, 'px,', statusBarHeightRpx, 'rpx');
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 搜索输入框输入事件
  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 搜索确认事件（点击搜索按钮或键盘确认）
  onSearchConfirm(e) {
    // 如果事件来自input的confirm事件，获取输入的值
    if (e && e.detail && e.detail.value !== undefined) {
      this.setData({
        keyword: e.detail.value
      });
    }
    
    console.log('搜索确认，关键词：', this.data.keyword);
    
    // 重置分页和商品列表
    this.setData({
      page: 1,
      productList: [],
      hasMore: true
    });
    
    // 重新搜索
    this.searchProducts();
  },

  // 分类点击事件
  onCategoryTap(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id);
    console.log('点击分类:', categoryId);
    
    this.setData({
      currentCategoryId: categoryId,
      page: 1,
      productList: [],
      hasMore: true
    });
    
    // 重新搜索
    this.searchProducts();
  },

  // 排序点击事件
  onSortTap(e) {
    const sortType = e.currentTarget.dataset.type;
    console.log('点击排序:', sortType);
    
    // 更新排序选项状态
    const sortOptions = this.data.sortOptions.map(item => ({
      ...item,
      active: item.type === sortType
    }));
    
    this.setData({
      sortOptions: sortOptions,
      currentSortType: sortType,
      page: 1,
      productList: [],
      hasMore: true
    });
    
    // 重新搜索
    this.searchProducts();
  },

  // 显示品牌筛选弹窗
  showBrandFilter() {
    console.log('显示品牌筛选弹窗');
    this.setData({
      showBrandModal: true
    });
  },

  // 隐藏品牌筛选弹窗
  hideBrandFilter() {
    this.setData({
      showBrandModal: false
    });
  },

  // 品牌选择事件
  onBrandSelect(e) {
    const brandId = parseInt(e.currentTarget.dataset.id);
    console.log('选择品牌:', brandId);
    
    const brands = this.data.brands.map(brand => {
      if (brand.id === brandId) {
        return { ...brand, selected: !brand.selected };
      }
      return brand;
    });
    
    this.setData({
      brands: brands
    });
  },

  // 确认品牌筛选
  confirmBrandFilter() {
    // 获取选中的品牌ID
    const selectedBrandIds = this.data.brands
      .filter(brand => brand.selected)
      .map(brand => brand.id);
    
    console.log('确认品牌筛选:', selectedBrandIds);
    
    this.setData({
      selectedBrandIds: selectedBrandIds,
      showBrandModal: false,
      page: 1,
      productList: [],
      hasMore: true
    });
    
    // 重新搜索
    this.searchProducts();
  },

  // 重置品牌筛选
  resetBrandFilter() {
    const brands = this.data.brands.map(brand => ({
      ...brand,
      selected: false
    }));
    
    this.setData({
      brands: brands
    });
  },

  // 搜索商品
  async searchProducts() {
    if (this.data.loading) return;
    
    this.setData({
      loading: this.data.page === 1 // 首页加载时显示loading状态
    });
    
    try {
      const params = {
        keyword: this.data.keyword,
        categoryId: this.data.currentCategoryId,
        sortType: this.data.currentSortType,
        brandIds: this.data.selectedBrandIds,
        page: this.data.page,
        pageSize: this.data.pageSize
      };
      
      console.log('搜索参数:', params);
      
      const result = await searchProducts(params);
      console.log('搜索结果:', result);
      
      // 处理返回的商品数据
      let newProductList = [];
      if (result && result.list && Array.isArray(result.list)) {
        newProductList = result.list;
      }
      
      // 如果是第一页且没有数据，使用默认商品并进行搜索相关性排序
      if (this.data.page === 1 && newProductList.length === 0) {
        console.log('搜索结果为空，使用默认商品列表');
        this.setDefaultProducts();
        return;
      }
      
      // 如果有搜索关键词，对商品列表进行相关性排序
      if (this.data.keyword && newProductList.length > 0) {
        newProductList = this.sortProductsByRelevance(newProductList, this.data.keyword);
      }
      
      // 根据分页情况更新商品列表
      const productList = this.data.page === 1 
        ? newProductList 
        : [...this.data.productList, ...newProductList];
      
      this.setData({
        productList: productList,
        hasMore: newProductList.length >= this.data.pageSize,
        loading: false,
        loadingMore: false
      });
      
    } catch (error) {
      console.error('搜索失败:', error);
      
      // 如果是首次加载失败，显示默认商品列表
      if (this.data.page === 1 && this.data.productList.length === 0) {
        console.log('搜索失败，显示默认商品列表');
        this.setDefaultProducts();
      } else {
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      }
      
      this.setData({
        loading: false,
        loadingMore: false
      });
    }
  },

  // 计算商品与搜索关键词的相关性得分
  calculateRelevanceScore(product, keyword) {
    if (!keyword || !product.title) return 0;
    
    const title = product.title.toLowerCase();
    const searchKeyword = keyword.toLowerCase();
    let score = 0;
    
    // 1. 完全匹配得分最高（100分）
    if (title.includes(searchKeyword)) {
      score += 100;
      
      // 如果是开头匹配，额外加分
      if (title.startsWith(searchKeyword)) {
        score += 50;
      }
    }
    
    // 2. 品牌名匹配得分（根据常见品牌）
    const brands = ['yonex', '尤尼克斯', '李宁', 'lining', '威克多', 'victor', '倍特爱', '威肯', '超牌', '泰昂', '翎美', '亚狮龙', 'gosen'];
    for (const brand of brands) {
      if (searchKeyword.includes(brand.toLowerCase()) && title.includes(brand.toLowerCase())) {
        score += 80;
        break;
      }
    }
    
    // 3. 关键词分词匹配（简单分词）
    const keywords = searchKeyword.split(/[\s\-\/]/);
    for (const key of keywords) {
      if (key.length > 1 && title.includes(key)) {
        score += 30;
      }
    }
    
    // 4. 商品类别相关性
    const categories = ['羽毛球拍', '球拍', '球鞋', '运动鞋', '球服', '运动服', '球包', '羽毛球', '运动'];
    for (const category of categories) {
      if (searchKeyword.includes(category) && title.includes(category)) {
        score += 40;
      }
    }
    
    // 5. 根据商品热度调整（销量和评分）
    if (product.sales > 1000) score += 10;
    if (product.rating >= 4.8) score += 5;
    
    return score;
  },

  // 根据搜索相关性对商品列表排序
  sortProductsByRelevance(productList, keyword) {
    console.log('开始相关性排序，关键词：', keyword);
    
    // 为每个商品计算相关性得分
    const productsWithScore = productList.map(product => ({
      ...product,
      relevanceScore: this.calculateRelevanceScore(product, keyword)
    }));
    
    // 按相关性得分排序（得分高的排在前面）
    const sortedProducts = productsWithScore.sort((a, b) => {
      // 首先按相关性得分排序
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // 相关性得分相同时，按当前排序方式排序
      if (this.data.currentSortType === 'price') {
        return a.price - b.price; // 价格从低到高
      } else {
        return b.sales - a.sales; // 销量从高到低
      }
    });
    
    // 输出排序结果便于调试
    console.log('相关性排序结果：');
    sortedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (得分: ${product.relevanceScore})`);
    });
    
    // 移除临时的相关性得分字段
    return sortedProducts.map(({ relevanceScore, ...product }) => product);
  },

  // 设置默认商品列表（当搜索失败时显示）
  setDefaultProducts() {
    const defaultProducts = [
      {
        id: 1,
        title: 'YONEX尤尼克斯羽毛球拍单拍超轻碳纤维进攻型球拍',
        image: 'https://img.alicdn.com/imgextra/i1/2206743762847/O1CN01Zk5XOI1zKjzn9DQPq_!!2206743762847.jpg',
        price: 299,
        originalPrice: 399,
        sales: 1200,
        rating: 4.9,
        tags: ['专业', '进攻型']
      },
      {
        id: 2,
        title: '李宁羽毛球拍碳纤维超轻5U单拍攻守兼备型球拍',
        image: 'https://img.alicdn.com/imgextra/i2/2206743762847/O1CN01rVzFGf1zKjzpqQiNX_!!2206743762847.jpg',
        price: 188,
        originalPrice: 268,
        sales: 850,
        rating: 4.8,
        tags: ['攻守兼备', '轻便']
      },
      {
        id: 3,
        title: '威克多VICTOR羽毛球拍专业训练拍',
        image: 'https://img.alicdn.com/imgextra/i3/2206743762847/O1CN01YGzQzZ1zKjzn9DkuE_!!2206743762847.jpg',
        price: 158,
        originalPrice: 228,
        sales: 650,
        rating: 4.7,
        tags: ['训练专用', '耐用']
      },
      {
        id: 4,
        title: '李宁羽毛球鞋男女透气防滑专业运动鞋',
        image: 'https://img.alicdn.com/imgextra/i4/2206743762847/O1CN01CdTZGJ1zKjzqJQKXf_!!2206743762847.jpg',
        price: 268,
        originalPrice: 358,
        sales: 920,
        rating: 4.6,
        tags: ['透气', '防滑']
      },
      {
        id: 5,
        title: '尤尼克斯YONEX羽毛球服套装吸汗透气',
        image: 'https://img.alicdn.com/imgextra/i1/2206743762847/O1CN01Mnh8qQ1zKjzn9DMkT_!!2206743762847.jpg',
        price: 128,
        originalPrice: 198,
        sales: 760,
        rating: 4.5,
        tags: ['吸汗', '透气']
      },
      {
        id: 6,
        title: '威克多VICTOR羽毛球包单肩背包大容量',
        image: 'https://img.alicdn.com/imgextra/i2/2206743762847/O1CN01nKzP3k1zKjzqJQKXg_!!2206743762847.jpg',
        price: 89,
        originalPrice: 138,
        sales: 450,
        rating: 4.4,
        tags: ['大容量', '便携']
      }
    ];
    
    // 如果有搜索关键词，对默认商品也进行相关性排序
    if (this.data.keyword) {
      const sortedProducts = this.sortProductsByRelevance(defaultProducts, this.data.keyword);
      this.setData({
        productList: sortedProducts,
        hasMore: false
      });
    } else {
      this.setData({
        productList: defaultProducts,
        hasMore: false
      });
    }
  },

  // 加载更多商品
  async loadMoreProducts() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });
    
    // 调用搜索商品（会自动处理分页）
    await this.searchProducts();
  },

  // 商品点击事件
  onProductTap(e) {
    const productId = e.currentTarget.dataset.id;
    console.log('点击商品:', productId);
    
    // 跳转到商品详情页面
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    });
  },

  // 获取搜索标题（用于显示搜索信息）
  getSearchTitle() {
    if (this.data.keyword) {
      return this.data.keyword;
    }
    
    if (this.data.currentCategoryId > 0) {
      const category = this.data.categories.find(cat => cat.id === this.data.currentCategoryId);
      return category ? category.name : '全部';
    }
    
    return '全部';
  },

  // 页面滚动到底部时触发
  onReachBottom() {
    console.log('滚动到底部，尝试加载更多');
    this.loadMoreProducts();
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    this.setData({
      page: 1,
      productList: [],
      hasMore: true
    });
    
    this.searchProducts().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
}); 