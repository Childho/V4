// 引入搜索相关的API - 修复API引用错误
// 暂时注释掉不存在的API引用，使用本地数据
// import { searchProducts } from '../../api/productApi.js'

// 引入系统信息工具函数
import { getStatusBarHeight } from '../../utils/systemInfo.js'

let getCategories, getBrands;
try {
  const searchApi = require('../../api/searchApi');
  getCategories = searchApi.getCategories;
  getBrands = searchApi.getBrands;
} catch (e) {
  console.warn('搜索API模块加载失败，使用降级处理:', e);
  // 降级处理：创建空的API函数
  getCategories = () => Promise.resolve([]);
  getBrands = () => Promise.resolve([]);
}

Page({
  data: {
    // 搜索关键词，从页面参数获取
    keyword: '',
    
    // 分类导航数据（与商品分类字段对应）
    categories: [
      { id: 1, name: '羽毛球拍', icon: '🏸' },
      { id: 2, name: '羽毛球鞋', icon: '👟' },
      { id: 3, name: '球服', icon: '👕' },
      { id: 4, name: '球包', icon: '🎒' },
      { id: 5, name: '羽毛球', icon: '🏸' },
      { id: 6, name: '运动配件', icon: '⚡' }
    ],
    
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
    
    // 获取分类参数（来自商场首页的"查看更多"）
    const category = options.category || '';
    let selectedCategoryId = 0; // 默认选中"全部"
    
    if (category) {
      // 建立分组ID与分类ID的映射关系
      const categoryMapping = {
        'racket': 1,      // 羽毛球拍
        'shoes': 2,       // 羽毛球鞋
        'clothes': 3,     // 球服
        'bag': 4,         // 球包
        'ball': 5,        // 羽毛球
        'accessories': 6  // 运动配件
      };
      
      selectedCategoryId = categoryMapping[category] || 0;
      console.log(`从商场页面跳转，分类：${category} -> ID：${selectedCategoryId}`);
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
      keyword: keyword,
      currentCategoryId: selectedCategoryId // 设置选中的分类ID
    });
    
    // 始终加载商品列表，无论是否有关键词
    this.searchProducts();
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
      
      // 由于API可能不存在或失败，直接使用默认商品数据
      // const result = await searchProducts(params);
      console.log('使用静态商品数据代替API调用');
      
      // 直接调用默认商品逻辑（包含分类筛选）
      this.setDefaultProducts();
      
    } catch (error) {
      console.error('搜索失败:', error);
      
      // 搜索失败时显示默认商品列表（包含分类筛选）
      console.log('搜索失败，显示默认商品列表');
      this.setDefaultProducts();
      
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
        // 根据当前价格排序方向
        return this.data.currentSortDirection === 'desc' ? b.price - a.price : a.price - b.price;
      } else {
        // 根据当前销量排序方向  
        return this.data.currentSortDirection === 'desc' ? b.sales - a.sales : a.sales - b.sales;
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
    // 定义15个以上的静态商品数据，包含完整的字段信息
    const defaultProducts = [
      // 羽毛球拍类商品（4个）
      {
        id: 1,
        title: 'YONEX尤尼克斯羽毛球拍单拍超轻碳纤维进攻型球拍ARC11',
        image: 'https://via.placeholder.com/300x300/4a90e2/ffffff?text=羽毛球拍',
        price: 299,
        originalPrice: 399,
        sales: 1200,
        rating: 4.9,
        brand: '尤尼克斯',
        category: '羽毛球拍',
        tags: ['专业', '进攻型']
      },
      {
        id: 2,
        title: '李宁羽毛球拍碳纤维超轻5U单拍攻守兼备型球拍N7II',
        image: 'https://via.placeholder.com/300x300/ff6b6b/ffffff?text=羽毛球拍',
        price: 188,
        originalPrice: 268,
        sales: 850,
        rating: 4.8,
        brand: '李宁',
        category: '羽毛球拍',
        tags: ['攻守兼备', '轻便']
      },
      {
        id: 3,
        title: '威克多VICTOR羽毛球拍专业训练拍挑战者9500',
        image: 'https://via.placeholder.com/300x300/50e3c2/ffffff?text=羽毛球拍',
        price: 158,
        originalPrice: 228,
        sales: 650,
        rating: 4.7,
        brand: '威克多',
        category: '羽毛球拍',
        tags: ['训练专用', '耐用']
      },
      {
        id: 4,
        title: '凯胜KASON羽毛球拍双刃10超轻进攻型球拍',
        image: 'https://via.placeholder.com/300x300/bd10e0/ffffff?text=羽毛球拍',
        price: 228,
        originalPrice: 298,
        sales: 720,
        rating: 4.6,
        brand: '凯胜',
        category: '羽毛球拍',
        tags: ['双刃', '超轻']
      },

      // 羽毛球鞋类商品（4个）
      {
        id: 5,
        title: '李宁羽毛球鞋男女透气防滑专业运动鞋云四代',
        image: 'https://via.placeholder.com/300x300/4ecdc4/ffffff?text=羽毛球鞋',
        price: 268,
        originalPrice: 358,
        sales: 920,
        rating: 4.6,
        brand: '李宁',
        category: '羽毛球鞋',
        tags: ['透气', '防滑']
      },
      {
        id: 6,
        title: 'YONEX尤尼克斯羽毛球鞋SHB65男女款专业比赛鞋',
        image: 'https://via.placeholder.com/300x300/45b7d1/ffffff?text=羽毛球鞋',
        price: 398,
        originalPrice: 498,
        sales: 560,
        rating: 4.8,
        brand: '尤尼克斯',
        category: '羽毛球鞋',
        tags: ['专业比赛', '耐磨']
      },
      {
        id: 7,
        title: '威克多VICTOR羽毛球鞋P9200男女通用训练鞋',
        image: 'https://via.placeholder.com/300x300/f39c12/ffffff?text=羽毛球鞋',
        price: 168,
        originalPrice: 228,
        sales: 890,
        rating: 4.5,
        brand: '威克多',
        category: '羽毛球鞋',
        tags: ['训练', '通用']
      },
      {
        id: 8,
        title: '川崎KAWASAKI羽毛球鞋K063专业防滑减震运动鞋',
        image: 'https://via.placeholder.com/300x300/e74c3c/ffffff?text=羽毛球鞋',
        price: 139,
        originalPrice: 199,
        sales: 1150,
        rating: 4.4,
        brand: '川崎',
        category: '羽毛球鞋',
        tags: ['减震', '性价比']
      },

      // 球服类商品（3个）
      {
        id: 9,
        title: '尤尼克斯YONEX羽毛球服套装吸汗透气运动服装',
        image: 'https://via.placeholder.com/300x300/9b59b6/ffffff?text=球服',
        price: 128,
        originalPrice: 198,
        sales: 760,
        rating: 4.5,
        brand: '尤尼克斯',
        category: '球服',
        tags: ['吸汗', '透气']
      },
      {
        id: 10,
        title: '李宁羽毛球服男女短袖透气速干运动套装',
        image: 'https://via.placeholder.com/300x300/27ae60/ffffff?text=球服',
        price: 98,
        originalPrice: 148,
        sales: 1320,
        rating: 4.3,
        brand: '李宁',
        category: '球服',
        tags: ['速干', '舒适']
      },
      {
        id: 11,
        title: '威克多VICTOR羽毛球服T恤短裤套装专业比赛服',
        image: 'https://via.placeholder.com/300x300/2c3e50/ffffff?text=球服',
        price: 158,
        originalPrice: 218,
        sales: 480,
        rating: 4.6,
        brand: '威克多',
        category: '球服',
        tags: ['比赛服', '专业']
      },

      // 球包类商品（3个）
      {
        id: 12,
        title: '威克多VICTOR羽毛球包单肩背包大容量BR6211',
        image: 'https://via.placeholder.com/300x300/34495e/ffffff?text=球包',
        price: 89,
        originalPrice: 138,
        sales: 450,
        rating: 4.4,
        brand: '威克多',
        category: '球包',
        tags: ['大容量', '便携']
      },
      {
        id: 13,
        title: '尤尼克斯YONEX羽毛球包双肩背包多功能运动包',
        image: 'https://via.placeholder.com/300x300/1abc9c/ffffff?text=球包',
        price: 168,
        originalPrice: 228,
        sales: 680,
        rating: 4.7,
        brand: '尤尼克斯',
        category: '球包',
        tags: ['双肩', '多功能']
      },
      {
        id: 14,
        title: '李宁羽毛球包手提包独立鞋仓设计专业球包',
        image: 'https://via.placeholder.com/300x300/e67e22/ffffff?text=球包',
        price: 128,
        originalPrice: 178,
        sales: 590,
        rating: 4.5,
        brand: '李宁',
        category: '球包',
        tags: ['独立鞋仓', '手提']
      },

      // 羽毛球类商品（2个）
      {
        id: 15,
        title: 'YONEX尤尼克斯羽毛球AS-40比赛用球12只装',
        image: 'https://via.placeholder.com/300x300/f1c40f/ffffff?text=羽毛球',
        price: 258,
        originalPrice: 308,
        sales: 1580,
        rating: 4.9,
        brand: '尤尼克斯',
        category: '羽毛球',
        tags: ['比赛用球', '耐打']
      },
      {
        id: 16,
        title: '亚狮龙RSL羽毛球7号耐打王训练球12只装',
        image: 'https://via.placeholder.com/300x300/16a085/ffffff?text=羽毛球',
        price: 98,
        originalPrice: 148,
        sales: 2150,
        rating: 4.4,
        brand: '亚狮龙',
        category: '羽毛球',
        tags: ['训练球', '耐打王']
      },

      // 运动配件类商品（2个）
      {
        id: 17,
        title: '李宁护腕吸汗带护膝套装运动防护用品',
        image: 'https://via.placeholder.com/300x300/8e44ad/ffffff?text=运动配件',
        price: 39,
        originalPrice: 69,
        sales: 1890,
        rating: 4.2,
        brand: '李宁',
        category: '运动配件',
        tags: ['护腕', '防护']
      },
      {
        id: 18,
        title: '运动毛巾吸汗快干羽毛球专用擦汗巾套装',
        image: 'https://via.placeholder.com/300x300/d35400/ffffff?text=运动配件',
        price: 25,
        originalPrice: 45,
        sales: 3260,
        rating: 4.1,
        brand: '通用',
        category: '运动配件',
        tags: ['吸汗', '快干']
      }
    ];

    // 根据当前选中的分类筛选商品
    let filteredProducts = defaultProducts;
    
    // 如果选中了具体分类（不是"全部"），进行筛选
    if (this.data.currentCategoryId > 0) {
      const selectedCategory = this.data.categories.find(cat => cat.id === this.data.currentCategoryId);
      if (selectedCategory) {
        filteredProducts = defaultProducts.filter(product => product.category === selectedCategory.name);
        console.log(`筛选分类: ${selectedCategory.name}, 筛选结果: ${filteredProducts.length}个商品`);
      }
    }
    
    // 应用排序逻辑
    filteredProducts = this.applySorting(filteredProducts);
    
    // 如果有搜索关键词，对筛选和排序后的商品进行相关性排序（搜索相关性优先级更高）
    if (this.data.keyword) {
      const sortedProducts = this.sortProductsByRelevance(filteredProducts, this.data.keyword);
      this.setData({
        productList: sortedProducts,
        hasMore: false,
        loading: false,
        loadingMore: false
      });
    } else {
      this.setData({
        productList: filteredProducts,
        hasMore: false,
        loading: false,
        loadingMore: false
      });
    }
    
    console.log(`最终显示商品数量: ${filteredProducts.length}`);
  },

  // 应用排序逻辑 - 新增方法
  applySorting(productList) {
    const sortType = this.data.currentSortType;
    const sortDirection = this.data.currentSortDirection;
    
    console.log(`应用排序: ${sortType} - ${sortDirection === 'desc' ? '降序' : '升序'}`);
    
    const sortedProducts = [...productList].sort((a, b) => {
      let comparison = 0;
      
      if (sortType === 'sales') {
        // 按销量排序
        comparison = a.sales - b.sales;
      } else if (sortType === 'price') {
        // 按价格排序
        comparison = a.price - b.price;
      }
      
      // 根据排序方向调整结果
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    // 输出排序结果便于调试
    console.log('排序结果预览:');
    sortedProducts.slice(0, 5).forEach((product, index) => {
      const value = sortType === 'sales' ? `${product.sales}销量` : `¥${product.price}`;
      console.log(`${index + 1}. ${product.title.substring(0, 20)}... (${value})`);
    });
    
    return sortedProducts;
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