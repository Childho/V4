// 评论详情页面 - 基于接口文档实现真实API调用
import { 
  getProductCommentsDetail, 
  toggleCommentLike, 
  getCommentImages, 
  reportComment, 
  getUserCommentHistory 
} from '../../api/commentApi';

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
    
    // 商品信息 - 对应接口文档 productInfo
    productInfo: {
      productId: '',
      name: '',
      coverImage: ''
    },
    
    // 评论统计信息 - 对应接口文档 commentSummary
    commentSummary: {
      total: 0,                    // 评论总数
      withImageCount: 0,           // 有图评论数量
      positiveCount: 0,            // 好评数量（4-5星）
      negativeCount: 0,            // 差评数量（1-2星）
      averageRating: 0,            // 平均评分
      ratingDistribution: {        // 评分分布统计
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
        "1": 0
      }
    },
    
    // 评论列表 - 对应接口文档 comments
    comments: [],
    
    // 分页信息 - 对应接口文档 pagination
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasMore: false
    },
    
    // 筛选后的评论列表（前端计算）
    filteredComments: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('[Comment Detail] onLoad options:', options);
    
    const { productId, productName, productImage } = options;
    
    // 打印详细的参数信息用于调试
    console.log('[Comment Detail] 接收参数:');
    console.log('- productId:', productId);
    console.log('- productName:', productName);
    console.log('- productImage:', productImage);
    
    if (!productId) {
      console.error('[Comment Detail] 商品ID为空');
      wx.showToast({
        title: '商品信息错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 设置商品信息 - 使用接口文档字段结构
    const productData = {
      productId: productId,
      name: decodeURIComponent(productName || '商品详情'),
      coverImage: decodeURIComponent(productImage || '/assets/icons/default_product.png')
    };
    
    console.log('[Comment Detail] 设置商品数据:', productData);
    
    this.setData({
      productInfo: productData
    });

    // 加载评论数据
    this.loadComments();
  },

  /**
   * 加载评论数据 - 使用真实API调用
   */
  async loadComments(isLoadMore = false) {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const { productId } = this.data.productInfo;
      const { currentPage, pageSize, currentFilter } = this.data;
      
      // 如果是加载更多，页码+1
      const page = isLoadMore ? currentPage + 1 : 1;
      
      console.log('[Load Comments] 请求参数:', {
        productId,
        page,
        pageSize,
        filter: currentFilter
      });
      
      // 调用真实API - 完全按照接口文档参数
      const response = await getProductCommentsDetail(productId, page, pageSize, currentFilter);
      
      console.log('[Load Comments] API响应:', response);
      
      if (response) {
        // 处理评论列表 - 支持分页加载更多
        const existingComments = isLoadMore ? this.data.comments : [];
        const newComments = Array.isArray(response.comments) ? response.comments : [];
        const newCommentsList = [...existingComments, ...newComments];
        
        console.log('[Comments Data] 处理评论数据:', {
          existing: existingComments.length,
          new: newComments.length,
          total: newCommentsList.length
        });
        
        // 设置数据 - 完全按照接口文档字段结构，并进行字段安全检查
        this.setData({
          productInfo: this.safeProductInfo(response.productInfo), // 安全处理商品信息
          commentSummary: this.safeCommentSummary(response.commentSummary), // 安全处理评论统计
          comments: this.safeCommentsList(newCommentsList), // 安全处理评论列表
          pagination: this.safePagination(response.pagination, page), // 安全处理分页信息
          currentPage: page,
          hasMore: response.pagination ? response.pagination.hasMore : false
        });
        
        // 应用当前筛选（如果是第一次加载）
        if (!isLoadMore) {
          this.applyFilter();
        } else {
          // 加载更多时，更新筛选后的列表
          this.applyFilter();
        }
      }
      
    } catch (error) {
      console.error('[Load Comments Error]', error);
      
      // API失败时的错误处理，使用默认值避免页面报错
      if (!isLoadMore) {
        this.setData({
          commentSummary: this.getDefaultCommentSummary(),
          comments: [],
          pagination: this.getDefaultPagination(),
          filteredComments: []
        });
      }
      
      wx.showToast({
        title: '加载评论失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },



  /**
   * 筛选评论 - 基于接口文档实现服务端筛选
   */
  filterComments(e) {
    const { type } = e.currentTarget.dataset;
    
    // 如果筛选类型没有变化，不重复请求
    if (type === this.data.currentFilter) return;
    
    console.log('[Filter Comments] 切换筛选类型:', type);
    
    // 更新筛选类型并重新加载数据
    this.setData({ 
      currentFilter: type,
      currentPage: 1,
      hasMore: true,
      comments: [], // 清空现有评论列表
      filteredComments: []
    });
    
    // 重新加载第一页数据
    this.loadComments(false);
  },

  /**
   * 应用筛选条件 - 根据接口文档，筛选在服务端完成，这里用于本地展示
   */
  applyFilter() {
    const { comments, currentFilter } = this.data;
    let filteredComments = [];
    
    // 注意：根据接口文档，筛选应该在服务端完成
    // 这里的本地筛选仅作为备用方案
    switch (currentFilter) {
      case 'all':
        filteredComments = comments;
        break;
      case 'withImage':
        filteredComments = comments.filter(item => item.images && item.images.length > 0);
        break;
      case 'positive':
        filteredComments = comments.filter(item => item.rating >= 4);
        break;
      case 'negative':
        filteredComments = comments.filter(item => item.rating <= 2);
        break;
      default:
        filteredComments = comments;
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
   * 切换点赞状态 - 基于接口文档实现
   */
  async toggleLike(e) {
    const { id, index } = e.currentTarget.dataset;
    
    // 检查用户登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
    
    try {
      // 乐观更新UI - 获取当前评论信息
      const comment = this.data.filteredComments[index];
      const newIsLiked = !comment.isLiked;
      const newLikeCount = newIsLiked ? comment.likeCount + 1 : comment.likeCount - 1;
      
      // 更新筛选后的评论列表
      const commentPath = `filteredComments[${index}]`;
      this.setData({
        [`${commentPath}.isLiked`]: newIsLiked,
        [`${commentPath}.likeCount`]: newLikeCount
      });
      
      // 同时更新原始数据列表
      const originalIndex = this.data.comments.findIndex(item => item.id === id);
      if (originalIndex !== -1) {
        const originalPath = `comments[${originalIndex}]`;
        this.setData({
          [`${originalPath}.isLiked`]: newIsLiked,
          [`${originalPath}.likeCount`]: newLikeCount
        });
      }
      
      // 调用API - 按照接口文档参数
      const response = await toggleCommentLike(id);
      console.log('[Toggle Like Success]', response);
      
      // API成功后，使用返回的真实数据更新UI（防止乐观更新有误差）
      if (response && response.commentId === id) {
        this.setData({
          [`${commentPath}.isLiked`]: response.isLiked,
          [`${commentPath}.likeCount`]: response.likeCount
        });
        
        if (originalIndex !== -1) {
          const originalPath = `comments[${originalIndex}]`;
          this.setData({
            [`${originalPath}.isLiked`]: response.isLiked,
            [`${originalPath}.likeCount`]: response.likeCount
          });
        }
      }
      
    } catch (error) {
      console.error('[Toggle Like Error]', error);
      
      // API调用失败，回滚UI状态
      const comment = this.data.filteredComments[index];
      const commentPath = `filteredComments[${index}]`;
      this.setData({
        [`${commentPath}.isLiked`]: comment.isLiked,
        [`${commentPath}.likeCount`]: comment.likeCount
      });
      
      // 回滚原始数据
      const originalIndex = this.data.comments.findIndex(item => item.id === id);
      if (originalIndex !== -1) {
        const originalPath = `comments[${originalIndex}]`;
        this.setData({
          [`${originalPath}.isLiked`]: comment.isLiked,
          [`${originalPath}.likeCount`]: comment.likeCount
        });
      }
      
      // 根据错误类型显示不同提示
      if (error.message === '未登录') {
        // 已在apiRequest中处理跳转
      } else {
        wx.showToast({
          title: error.message || '点赞失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 预览图片 - 支持接口文档的图片功能
   */
  previewImage(e) {
    const { url, urls, commentId } = e.currentTarget.dataset;
    
    // 如果有评论ID，可以调用获取评论图片接口获取高清图
    if (commentId) {
      console.log('[Preview Image] 评论ID:', commentId);
      // 可以在这里调用 getCommentImages(commentId) 获取高清图片
    }
    
    wx.previewImage({
      current: url,
      urls: urls || [url]
    });
  },

  /**
   * 举报评论 - 基于接口文档实现
   */
  reportComment(e) {
    const { commentId } = e.currentTarget.dataset;
    
    // 检查用户登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
    
    // 显示举报选项
    wx.showActionSheet({
      itemList: ['垃圾信息', '不当内容', '虚假评论', '骚扰辱骂', '其他原因'],
      success: (res) => {
        const reasons = ['spam', 'inappropriate', 'fake', 'harassment', 'other'];
        const reason = reasons[res.tapIndex];
        const reasonText = ['垃圾信息', '不当内容', '虚假评论', '骚扰辱骂', '其他原因'][res.tapIndex];
        
        this.submitReport(commentId, reason, reasonText);
      }
    });
  },

  /**
   * 提交举报 - 调用接口文档中的举报API
   */
  async submitReport(commentId, reason, reasonText) {
    try {
      wx.showLoading({
        title: '提交中...',
        mask: true
      });
      
      const response = await reportComment(commentId, reason, `举报原因：${reasonText}`);
      
      wx.hideLoading();
      wx.showToast({
        title: '举报提交成功',
        icon: 'success'
      });
      
      console.log('[Report Success]', response);
      
    } catch (error) {
      wx.hideLoading();
      console.error('[Report Error]', error);
      
      wx.showToast({
        title: error.message || '举报提交失败',
        icon: 'none'
      });
    }
  },

  /**
   * 查看用户评论历史 - 基于接口文档实现
   */
  async viewUserComments(e) {
    const { userId } = e.currentTarget.dataset;
    
    if (!userId) {
      wx.showToast({
        title: '用户信息错误',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      
      const response = await getUserCommentHistory(userId);
      
      wx.hideLoading();
      
      // 显示用户评论历史弹窗或跳转到用户详情页
      console.log('[User Comments]', response);
      
      // 这里可以实现弹窗显示或页面跳转
      wx.showModal({
        title: '用户评论历史',
        content: `该用户共发表${response.commentStats.totalComments}条评论，平均评分${response.commentStats.averageRating}分`,
        showCancel: false
      });
      
    } catch (error) {
      wx.hideLoading();
      console.error('[User Comments Error]', error);
      
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    }
  },



  /**
   * 获取默认评论统计信息
   */
  getDefaultCommentSummary() {
    return {
      total: 0,
      withImageCount: 0,
      positiveCount: 0,
      negativeCount: 0,
      averageRating: 0,
      ratingDistribution: {
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
        "1": 0
      }
    };
  },

  /**
   * 获取默认分页信息
   */
  getDefaultPagination() {
    return {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasMore: false
    };
  },

  /**
   * 安全处理商品信息 - 确保字段完整性
   */
  safeProductInfo(productInfo) {
    if (!productInfo) return this.data.productInfo;
    
    return {
      productId: productInfo.productId || this.data.productInfo.productId || '',
      name: productInfo.name || this.data.productInfo.name || '商品详情',
      coverImage: productInfo.coverImage || this.data.productInfo.coverImage || '/assets/icons/default_product.png'
    };
  },

  /**
   * 安全处理评论统计信息 - 确保字段完整性和数据类型
   */
  safeCommentSummary(commentSummary) {
    if (!commentSummary) return this.getDefaultCommentSummary();
    
    return {
      total: parseInt(commentSummary.total) || 0,
      withImageCount: parseInt(commentSummary.withImageCount) || 0,
      positiveCount: parseInt(commentSummary.positiveCount) || 0,
      negativeCount: parseInt(commentSummary.negativeCount) || 0,
      averageRating: parseFloat(commentSummary.averageRating) || 0,
      ratingDistribution: {
        "5": parseInt(commentSummary.ratingDistribution?.["5"]) || 0,
        "4": parseInt(commentSummary.ratingDistribution?.["4"]) || 0,
        "3": parseInt(commentSummary.ratingDistribution?.["3"]) || 0,
        "2": parseInt(commentSummary.ratingDistribution?.["2"]) || 0,
        "1": parseInt(commentSummary.ratingDistribution?.["1"]) || 0
      }
    };
  },

  /**
   * 安全处理评论列表 - 确保每条评论的字段完整性
   */
  safeCommentsList(comments) {
    if (!Array.isArray(comments)) return [];
    
    return comments.map(comment => ({
      id: comment.id || '',
      userId: comment.userId || '',
      username: comment.username || '匿名用户',
      userAvatar: comment.userAvatar || '/assets/icons/default-avatar.png',
      memberLevel: comment.memberLevel || '',
      rating: parseInt(comment.rating) || 5,
      content: comment.content || '',
      images: Array.isArray(comment.images) ? comment.images : [],
      specs: comment.specs || comment.spec || '', // 兼容两种字段名
      createTime: comment.createTime || '',
      isLiked: Boolean(comment.isLiked),
      likeCount: parseInt(comment.likeCount) || 0,
      reply: comment.reply || '',
      isAnonymous: Boolean(comment.isAnonymous)
    }));
  },

  /**
   * 安全处理分页信息 - 确保分页字段的完整性
   */
  safePagination(pagination, currentPage) {
    if (!pagination) return this.getDefaultPagination();
    
    return {
      page: parseInt(pagination.page) || currentPage || 1,
      pageSize: parseInt(pagination.pageSize) || 10,
      total: parseInt(pagination.total) || 0,
      totalPages: parseInt(pagination.totalPages) || 0,
      hasMore: Boolean(pagination.hasMore)
    };
  },

  /**
   * 分享配置
   */
  onShareAppMessage() {
    return {
      title: `${this.data.productInfo.name} - 商品评价`,
      path: `/pages/comment-detail/index?productId=${this.data.productInfo.productId}`
    };
  }
}); 