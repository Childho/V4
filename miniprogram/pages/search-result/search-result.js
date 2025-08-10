// 引入搜索相关的API
import { searchProducts, getCategories, getBrands, getProductDetail } from '../../api/searchApi.js';

// 引入系统信息工具函数
import { getStatusBarHeight } from '../../utils/systemInfo.js';

Page({
  data: {
    // 搜索关键词，从页面参数获取
    keyword: '',
    
    // 分类导航数据（动态从API加载）
    categories: [],
    
    // 当前选中的分类ID
    currentCategoryId: 0,
    
    // 排序选项 - 增加排序方向支持
    sortOptions: [
      { 
        type: 'sales', 
        name: '销量', 
        active: true, 
        direction: 'desc', // 'desc'=从高到低, 'asc'=从低到高
        icon: '↓' // 显示当前排序方向的图标
      },
      { 
        type: 'price', 
        name: '价格', 
        active: false, 
        direction: 'asc', // 价格默认从低到高
        icon: '↑'
      }
    ],
    
    // 当前排序类型和方向
    currentSortType: 'sales',
    currentSortDirection: 'desc',
    
    // 品牌列表（动态从API加载）
    brands: [],
    
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
    
    // 获取分类参数（来自商场首页的"查看更多"）
    const category = options.category || '';
    let selectedCategoryId = 0; // 默认选中"全部"
    
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
      keyword: keyword,
      currentCategoryId: selectedCategoryId // 设置选中的分类ID
    });
    
    // 初始化页面数据（分类、品牌、商品）
    this.initPageData(category);
  },

  // 初始化页面数据（并行加载分类、品牌、商品）
  async initPageData(category) {
    console.log('[页面初始化] 开始加载分类、品牌和商品数据');
    
    try {
      // 并行加载分类和品牌数据
      const results = await Promise.allSettled([
        this.loadCategories(),
        this.loadBrands()
      ]);
      
      // 检查加载结果
      const [categoriesResult, brandsResult] = results;
      
      if (categoriesResult.status === 'fulfilled') {
        console.log('[页面初始化] 分类数据加载成功');
        
        // 如果有分类参数，设置选中的分类ID
        if (category) {
          this.setCategoryByParam(category);
        }
      } else {
        console.error('[页面初始化] 分类数据加载失败:', categoriesResult.reason);
      }
      
      if (brandsResult.status === 'fulfilled') {
        console.log('[页面初始化] 品牌数据加载成功');
      } else {
        console.error('[页面初始化] 品牌数据加载失败:', brandsResult.reason);
      }
      
      // 加载商品数据
      await this.searchProducts();
      
    } catch (error) {
      console.error('[页面初始化] 数据加载异常:', error);
      
      // 即使基础数据加载失败，也尝试加载商品
      this.searchProducts();
    }
  },

  // 设置状态栏高度
  setStatusBarHeight() {
    // 使用新的API获取状态栏高度，替代已弃用的wx.getSystemInfoSync
    const statusBarHeight = getStatusBarHeight(); // 默认44px已在工具函数中处理
    
    // 将状态栏高度转换为rpx（微信小程序中 1px = 2rpx）
    const statusBarHeightRpx = statusBarHeight * 2;
    
    this.setData({
      statusBarHeight: statusBarHeightRpx
    });
    
    console.log('状态栏高度:', statusBarHeight, 'px,', statusBarHeightRpx, 'rpx');
  },

  // 加载分类数据
  async loadCategories() {
    try {
      console.log('[分类数据] 开始加载分类列表');
      
      const result = await getCategories();
      
      if (result.success && result.body && result.body.categories) {
        const categories = result.body.categories || [];
        
        this.setData({
          categories: categories
        });
        
        console.log('[分类数据] 加载成功，分类数量:', categories.length);
        return categories;
      } else {
        throw new Error(result.message || '获取分类列表失败');
      }
    } catch (error) {
      console.error('[分类数据] 加载失败:', error);
      
      // 设置默认分类作为降级处理
      const defaultCategories = [
        { id: 1, name: '羽毛球拍', icon: '🏸' },
        { id: 2, name: '羽毛球鞋', icon: '👟' },
        { id: 3, name: '球服', icon: '👕' },
        { id: 4, name: '球包', icon: '🎒' },
        { id: 5, name: '羽毛球', icon: '🏸' },
        { id: 6, name: '运动配件', icon: '⚡' }
      ];
      
      this.setData({
        categories: defaultCategories
      });
      
      console.log('[分类数据] 使用默认分类数据');
      return defaultCategories;
    }
  },

  // 加载品牌数据
  async loadBrands() {
    try {
      console.log('[品牌数据] 开始加载品牌列表');
      
      const result = await getBrands();
      
      if (result.success && result.body && result.body.brands) {
        const brands = result.body.brands || [];
        
        this.setData({
          brands: brands
        });
        
        console.log('[品牌数据] 加载成功，品牌数量:', brands.length);
        return brands;
      } else {
        throw new Error(result.message || '获取品牌列表失败');
      }
    } catch (error) {
      console.error('[品牌数据] 加载失败:', error);
      
      // 设置默认品牌作为降级处理
      const defaultBrands = [
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
      ];
      
      this.setData({
        brands: defaultBrands
      });
      
      console.log('[品牌数据] 使用默认品牌数据');
      return defaultBrands;
    }
  },

  // 根据参数设置分类
  setCategoryByParam(category) {
    // 建立分组ID与分类ID的映射关系
    const categoryMapping = {
      'racket': 1,      // 羽毛球拍
      'shoes': 2,       // 羽毛球鞋
      'clothes': 3,     // 球服
      'bag': 4,         // 球包
      'ball': 5,        // 羽毛球
      'accessories': 6  // 运动配件
    };
    
    const selectedCategoryId = categoryMapping[category] || 0;
    console.log(`从商场页面跳转，分类：${category} -> ID：${selectedCategoryId}`);
    
    this.setData({
      currentCategoryId: selectedCategoryId
    });
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
    
    // 更新当前选中的分类ID
    this.setData({
      currentCategoryId: categoryId,
      page: 1,
      productList: [],
      hasMore: true
    });
    
    // 重新加载商品（会触发筛选逻辑）
    this.searchProducts();
  },

  // 排序点击事件 - 支持双向排序切换
  onSortTap(e) {
    const sortType = e.currentTarget.dataset.type;
    console.log('点击排序:', sortType);
    
    let newDirection;
    let updatedSortOptions;
    
    // 如果点击的是当前已激活的排序类型，则切换排序方向
    if (this.data.currentSortType === sortType) {
      // 切换排序方向
      const currentOption = this.data.sortOptions.find(item => item.type === sortType);
      newDirection = currentOption.direction === 'asc' ? 'desc' : 'asc';
      console.log(`切换${sortType}排序方向: ${currentOption.direction} -> ${newDirection}`);
    } else {
      // 点击不同的排序类型，使用该类型的默认方向
      if (sortType === 'sales') {
        newDirection = 'desc'; // 销量默认从高到低
      } else if (sortType === 'price') {
        newDirection = 'asc';  // 价格默认从低到高
      }
      console.log(`切换到${sortType}排序，使用默认方向: ${newDirection}`);
    }
    
    // 更新排序选项状态
    updatedSortOptions = this.data.sortOptions.map(item => ({
      ...item,
      active: item.type === sortType,
      direction: item.type === sortType ? newDirection : item.direction,
      icon: item.type === sortType ? (newDirection === 'desc' ? '↓' : '↑') : item.icon
    }));
    
    this.setData({
      sortOptions: updatedSortOptions,
      currentSortType: sortType,
      currentSortDirection: newDirection,
      page: 1,
      productList: [],
      hasMore: true
    });
    
    // 重新搜索（会应用新的排序）
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
      loading: this.data.page === 1, // 首页加载时显示loading状态
      loadingMore: this.data.page > 1 // 加载更多时显示loadingMore状态
    });
    
    try {
      const params = {
        keyword: this.data.keyword,
        categoryId: this.data.currentCategoryId,
        sortType: this.data.currentSortType,
        sortDirection: this.data.currentSortDirection,
        brandIds: this.data.selectedBrandIds,
        page: this.data.page,
        pageSize: this.data.pageSize
      };
      
      console.log('[商品搜索] 搜索参数:', params);
      
      // 调用真实搜索API
      const result = await searchProducts(params);
      
      if (result.success && result.body) {
        console.log('[商品搜索] API调用成功，返回数据:', result.body);
        
        const { products, pagination } = result.body;
        
        // 处理商品数据，确保字段映射正确
        const processedProducts = this.processProductData(products || []);
        
        // 合并或替换商品列表
        let newProductList;
        if (this.data.page === 1) {
          // 第一页：替换现有数据
          newProductList = processedProducts;
        } else {
          // 后续页：追加到现有数据
          newProductList = [...this.data.productList, ...processedProducts];
        }
        
        this.setData({
          productList: newProductList,
          hasMore: pagination?.hasMore || false,
          loading: false,
          loadingMore: false
        });
        
        console.log(`[商品搜索] 成功加载 ${processedProducts.length} 个商品，总计 ${newProductList.length} 个`);
        
        // 如果是第一页且没有数据，显示空状态
        if (this.data.page === 1 && processedProducts.length === 0) {
          console.log('[商品搜索] 搜索结果为空');
        }
        
      } else {
        throw new Error(result.message || '搜索商品失败');
      }
      
    } catch (error) {
      console.error('[商品搜索] 搜索失败:', error);
      
      // 搜索失败时的处理
      this.setData({
        loading: false,
        loadingMore: false
      });
      
      // 如果是第一页搜索失败，显示错误提示
      if (this.data.page === 1) {
        wx.showModal({
          title: '搜索失败',
          content: error.message || '网络异常，请检查网络连接后重试',
          showCancel: true,
          confirmText: '重试',
          cancelText: '确定',
          success: (res) => {
            if (res.confirm) {
              // 重试搜索
              this.searchProducts();
            }
          }
        });
      } else {
        // 加载更多失败，只显示toast
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      }
    }
  },

  // 处理商品数据，确保字段映射与接口文档一致
  processProductData(products) {
    return products.map(product => ({
      id: product.id || 0,
      title: product.title || '商品信息缺失',
      image: product.image || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      sales: product.sales || 0,
      rating: product.rating || 0,
      brand: product.brand || '',
      category: product.category || '',
      tags: Array.isArray(product.tags) ? product.tags : []
    }));
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
    console.log('[商品点击] 商品ID:', productId);
    
    // 跳转到商品详情页面
    wx.navigateTo({
      url: `/pages/productDetail/index?id=${productId}`
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