// 评论详情页面
import { getProductComments, toggleCommentLike } from '../../api/productApi';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,           // 加载状态
    hasMore: true,           // 是否还有更多数据
    currentPage: 1,          // 当前页码
    pageSize: 10,            // 每页数量
    currentFilter: 'all',    // 当前筛选类型：all全部，withImage有图，positive好评，negative差评
    
    // 商品信息
    product: {
      id: '',
      name: '',
      coverImage: ''
    },
    
    // 评论数据
    comments: {
      total: 0,              // 总评论数
      withImageCount: 0,     // 有图评论数
      positiveCount: 0,      // 好评数
      negativeCount: 0,      // 差评数
      list: []               // 所有评论列表
    },
    
    // 筛选后的评论列表
    filteredComments: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('[Comment Detail] onLoad options:', options);
    
    const { productId, productName, productImage } = options;
    
    if (!productId) {
      wx.showToast({
        title: '商品信息错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 设置商品信息
    this.setData({
      'product.id': productId,
      'product.name': productName || '商品详情',
      'product.coverImage': productImage || '/assets/icons/default_product.png'
    });

    // 加载评论数据
    this.loadComments();
  },

  /**
   * 加载评论数据
   */
  async loadComments(isLoadMore = false) {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const { productId } = this.data.product;
      const { currentPage, pageSize } = this.data;
      
      // 如果是加载更多，页码+1
      const page = isLoadMore ? currentPage + 1 : 1;
      
      const commentsData = await this.getCommentsData(productId, page, pageSize);
      
      if (commentsData) {
        const existingComments = isLoadMore ? this.data.comments.list : [];
        const newCommentsList = [...existingComments, ...commentsData.list];
        
        this.setData({
          comments: {
            ...commentsData,
            list: newCommentsList
          },
          currentPage: page,
          hasMore: commentsData.list.length >= pageSize // 如果返回数据少于每页数量，说明没有更多了
        });
        
        // 应用当前筛选
        this.applyFilter();
      }
      
    } catch (error) {
      console.error('[Load Comments Error]', error);
      wx.showToast({
        title: '加载评论失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 获取评论数据（包含错误处理和mock数据）
   */
  async getCommentsData(productId, page, pageSize) {
    try {
      // 尝试调用真实API
      return await getProductComments(productId, page, pageSize);
    } catch (error) {
      console.error('[API Error]', error);
      // API失败时返回模拟数据
      return this.getMockCommentsData(page, pageSize);
    }
  },

  /**
   * 筛选评论
   */
  filterComments(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ currentFilter: type });
    this.applyFilter();
  },

  /**
   * 应用筛选条件
   */
  applyFilter() {
    const { comments, currentFilter } = this.data;
    let filteredComments = [];
    
    switch (currentFilter) {
      case 'all':
        filteredComments = comments.list;
        break;
      case 'withImage':
        filteredComments = comments.list.filter(item => item.images && item.images.length > 0);
        break;
      case 'positive':
        filteredComments = comments.list.filter(item => item.rating >= 4);
        break;
      case 'negative':
        filteredComments = comments.list.filter(item => item.rating <= 2);
        break;
      default:
        filteredComments = comments.list;
    }
    
    this.setData({ filteredComments });
  },

  /**
   * 加载更多评论
   */
  loadMoreComments() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadComments(true);
  },

  /**
   * 切换点赞状态
   */
  async toggleLike(e) {
    const { id, index } = e.currentTarget.dataset;
    
    try {
      // 乐观更新UI
      const commentPath = `filteredComments[${index}]`;
      const comment = this.data.filteredComments[index];
      
      this.setData({
        [`${commentPath}.isLiked`]: !comment.isLiked,
        [`${commentPath}.likeCount`]: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1
      });
      
      // 同时更新原始数据列表
      const originalIndex = this.data.comments.list.findIndex(item => item.id === id);
      if (originalIndex !== -1) {
        const originalPath = `comments.list[${originalIndex}]`;
        this.setData({
          [`${originalPath}.isLiked`]: !comment.isLiked,
          [`${originalPath}.likeCount`]: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1
        });
      }
      
      // 调用API
      await toggleCommentLike(id);
      
    } catch (error) {
      console.error('[Toggle Like Error]', error);
      // 如果API调用失败，回滚UI状态
      const commentPath = `filteredComments[${index}]`;
      const comment = this.data.filteredComments[index];
      this.setData({
        [`${commentPath}.isLiked`]: !comment.isLiked,
        [`${commentPath}.likeCount`]: comment.isLiked ? comment.likeCount + 1 : comment.likeCount - 1
      });
      
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const { url, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  /**
   * 获取模拟评论数据
   */
  getMockCommentsData(page = 1, pageSize = 10) {
    // 模拟评论数据，用于演示
    const allComments = [
      {
        id: '1',
        username: '用户****123',
        userAvatar: '/assets/icons/default_avatar.png',
        rating: 5,
        content: '商品质量非常好，包装精美，发货速度很快，客服态度也很好，总体来说很满意的一次购物体验。',
        images: [
          'https://via.placeholder.com/300x300/ff4757/ffffff?text=商品图1',
          'https://via.placeholder.com/300x300/2ed573/ffffff?text=商品图2'
        ],
        specs: '颜色：红色 尺寸：L',
        createTime: '2024-01-15',
        reply: '感谢您的好评，我们会继续努力提供更好的产品和服务！',
        isLiked: false,
        likeCount: 12
      },
      {
        id: '2',
        username: '用户****456',
        userAvatar: '/assets/icons/default_avatar.png',
        rating: 4,
        content: '整体还不错，性价比很高，就是物流稍微慢了一点。',
        images: [],
        specs: '颜色：蓝色 尺寸：M',
        createTime: '2024-01-14',
        reply: '',
        isLiked: true,
        likeCount: 8
      },
      {
        id: '3',
        username: '用户****789',
        userAvatar: '/assets/icons/default_avatar.png',
        rating: 2,
        content: '商品有些瑕疵，但是客服处理很及时，已经重新发货了。',
        images: ['https://via.placeholder.com/300x300/ff6b6b/ffffff?text=问题图'],
        specs: '颜色：绿色 尺寸：S',
        createTime: '2024-01-13',
        reply: '非常抱歉给您带来不便，我们已安排重新发货，请注意查收。',
        isLiked: false,
        likeCount: 3
      }
    ];
    
    // 计算统计数据
    const total = allComments.length;
    const withImageCount = allComments.filter(item => item.images && item.images.length > 0).length;
    const positiveCount = allComments.filter(item => item.rating >= 4).length;
    const negativeCount = allComments.filter(item => item.rating <= 2).length;
    
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedComments = allComments.slice(startIndex, endIndex);
    
    return {
      total,
      withImageCount,
      positiveCount,
      negativeCount,
      list: paginatedComments
    };
  },

  /**
   * 分享配置
   */
  onShareAppMessage() {
    return {
      title: `${this.data.product.name} - 商品评价`,
      path: `/pages/comment-detail/index?productId=${this.data.product.id}`
    };
  }
}); 