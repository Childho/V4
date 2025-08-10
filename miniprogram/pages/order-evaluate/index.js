// 商品评价页面逻辑
// 导入评价相关API
import { 
  getOrderDetail, 
  uploadFile, 
  getEvaluationTags, 
  submitEvaluation, 
  deleteMediaFile 
} from '../../api/evaluationApi.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 弹窗显示状态
    show: false,
    
    // 订单信息
    orderInfo: {},
    
    // 评价数据
    rating: 0, // 星级评价 1-5
    textContent: '', // 文字评价内容
    uploadedMedia: [], // 已上传的媒体文件
    selectedTags: [], // 选中的标签
    isAnonymous: false, // 是否匿名评价
    isPublic: true, // 是否公开评价
    
    // 配置项
    maxTextLength: 500, // 最大文字长度
    maxMediaCount: 9, // 最大媒体文件数量
    maxSelectCount: 5, // 最大标签选择数量
    
    // 星级评价文本
    ratingTexts: [
      '差评，很不满意',
      '不太满意',
      '一般般',
      '满意，值得推荐', 
      '非常满意，超出期待'
    ],
    
    // 可选标签（从API动态获取）
    availableTags: [],
    
    // 页面状态
    loading: true,
    uploading: false,
    submitting: false // 防止重复提交
  },

  /**
   * 计算属性：是否可以提交评价
   */
  get canSubmit() {
    return this.data.rating > 0; // 至少需要星级评价
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('[评价页面] 页面加载，参数:', options);
    
    // 获取订单ID
    const orderId = options.orderId;
    if (orderId) {
      this.initPageData(orderId);
    } else {
      wx.showModal({
        title: '参数错误',
        content: '缺少订单ID',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    // 延时显示弹窗动画
    setTimeout(() => {
      this.setData({ 
        show: true,
        canSubmit: this.canSubmit
      });
    }, 100);
  },

  /**
   * 初始化页面数据
   */
  async initPageData(orderId) {
    try {
      // 设置加载状态
      this.setData({
        loading: true
      });

      // 并行加载订单信息和评价标签
      const [orderResult, tagsResult] = await Promise.allSettled([
        this.loadOrderInfo(orderId),
        this.loadEvaluationTags()
      ]);

      // 处理订单信息加载结果
      if (orderResult.status === 'rejected') {
        throw new Error(orderResult.reason?.message || '加载订单信息失败');
      }

      // 处理标签加载结果（失败不影响主流程）
      if (tagsResult.status === 'rejected') {
        console.warn('[评价页面] 加载评价标签失败：', tagsResult.reason);
        // 使用默认标签
        this.setDefaultTags();
      }

      this.setData({
        loading: false
      });

    } catch (error) {
      console.error('[评价页面] 初始化页面数据失败：', error);
      
      this.setData({
        loading: false
      });

      wx.showModal({
        title: '加载失败',
        content: error.message || '页面初始化失败，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 重试加载
            this.initPageData(orderId);
          } else {
            // 返回上一页
            wx.navigateBack();
          }
        }
      });
    }
  },

  /**
   * 加载订单信息
   */
  async loadOrderInfo(orderId) {
    try {
      console.log('[评价页面] 加载订单信息，订单ID:', orderId);
      
      // 调用API获取订单详情
      const result = await getOrderDetail(orderId);
      
      if (result.success && result.body) {
        const orderInfo = result.body;
        
        // 验证订单是否可以评价
        if (!orderInfo.canEvaluate) {
          throw new Error('该订单暂不支持评价');
        }

        // 检查评价截止时间
        if (orderInfo.evaluateDeadline) {
          const deadline = new Date(orderInfo.evaluateDeadline);
          if (deadline < new Date()) {
            throw new Error('评价时间已过期');
          }
        }

        this.setData({
          orderInfo: orderInfo
        });
        
        console.log('[评价页面] 订单信息加载成功：', orderInfo);

        // 根据商品类型调整可用标签
        if (orderInfo.goods && orderInfo.goods.length > 0) {
          this.adjustTagsByProduct(orderInfo.goods[0]);
        }

        return orderInfo;
      } else {
        throw new Error(result.message || '获取订单信息失败');
      }
    } catch (error) {
      console.error('[评价页面] 加载订单信息失败:', error);
      throw error;
    }
  },

  /**
   * 加载评价标签
   */
  async loadEvaluationTags() {
    try {
      console.log('[评价页面] 加载评价标签');

      const result = await getEvaluationTags();
      
      if (result.success && result.body) {
        const { tags, maxSelectCount } = result.body;
        
        this.setData({
          availableTags: tags || [],
          maxSelectCount: maxSelectCount || 5
        });
        
        console.log('[评价页面] 评价标签加载成功：', tags);
        return result.body;
      } else {
        throw new Error(result.message || '获取评价标签失败');
      }
    } catch (error) {
      console.error('[评价页面] 加载评价标签失败:', error);
      throw error;
    }
  },

  /**
   * 设置默认标签（API加载失败时使用）
   */
  setDefaultTags() {
    const defaultTags = [
      '质量很好', '做工精细', '包装完整', '发货迅速',
      '客服态度好', '性价比高', '样式好看', '尺寸合适',
      '材质舒适', '颜色正', '功能齐全', '使用方便'
    ];
    
    this.setData({
      availableTags: defaultTags,
      maxSelectCount: 5
    });
    
    console.log('[评价页面] 使用默认标签');
  },

  /**
   * 根据商品调整可用标签
   */
  adjustTagsByProduct(goods) {
    // 如果已经从API获取了标签，优先使用API标签
    if (this.data.availableTags.length > 0) {
      return;
    }

    // 根据商品类型提供不同的标签选项
    let tags = [
      '质量很好', '做工精细', '包装完整', '发货迅速',
      '客服态度好', '性价比高', '样式好看', '尺寸合适'
    ];
    
    // 根据商品标题或分类判断类型并添加特定标签
    const title = goods.title || '';
    const category = goods.category || '';
    
    if (title.includes('羽毛球拍') || category === 'badminton') {
      tags = ['手感很好', '重量合适', '弹性不错', '外观漂亮', ...tags];
    } else if (title.includes('球鞋') || category === 'shoes') {
      tags = ['舒适度好', '防滑效果好', '透气性好', '脚感不错', ...tags];
    } else if (title.includes('球服') || category === 'clothing') {
      tags = ['面料舒适', '吸汗性好', '版型合身', '颜色好看', ...tags];
    }
    
    this.setData({ 
      availableTags: tags,
      maxSelectCount: 5
    });
    
    console.log('[评价页面] 根据商品类型调整标签：', tags);
  },

  /**
   * 设置星级评价
   */
  setRating(e) {
    const rating = e.currentTarget.dataset.rating;
    console.log('[评价页面] 设置星级评价:', rating);
    
    this.setData({ 
      rating: rating,
      canSubmit: rating > 0
    });
    
    // 震动反馈
    wx.vibrateShort({
      type: 'light'
    });
  },

  /**
   * 切换标签选择
   */
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = [...this.data.selectedTags];
    
    const index = selectedTags.indexOf(tag);
    if (index > -1) {
      selectedTags.splice(index, 1); // 取消选择
    } else {
      if (selectedTags.length < this.data.maxSelectCount) { // 最多选择5个标签
        selectedTags.push(tag); // 添加选择
      } else {
        wx.showToast({
          title: `最多选择${this.data.maxSelectCount}个标签`,
          icon: 'none'
        });
        return;
      }
    }
    
    this.setData({ selectedTags });
    console.log('[评价页面] 当前选择的标签:', selectedTags);
  },

  /**
   * 文字输入处理
   */
  onTextInput(e) {
    const textContent = e.detail.value;
    this.setData({ textContent });
  },

  /**
   * 选择媒体文件
   */
  chooseMedia() {
    const that = this;
    
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择', '录制视频'],
      success(res) {
        switch (res.tapIndex) {
          case 0: // 拍照
            that.chooseImage('camera');
            break;
          case 1: // 从相册选择
            that.chooseImage('album');
            break;
          case 2: // 录制视频
            that.chooseVideo();
            break;
        }
      }
    });
  },

  /**
   * 选择图片
   */
  chooseImage(sourceType) {
    const maxCount = this.data.maxMediaCount - this.data.uploadedMedia.length;
    
    if (maxCount <= 0) {
      wx.showToast({
        title: `最多上传${this.data.maxMediaCount}个文件`,
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: [sourceType],
      success: (res) => {
        this.uploadMedia(res.tempFilePaths, 'image');
      }
    });
  },

  /**
   * 选择视频
   */
  chooseVideo() {
    // 检查是否已有视频
    const hasVideo = this.data.uploadedMedia.some(item => item.type === 'video');
    if (hasVideo) {
      wx.showToast({
        title: '只能上传1个视频',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseVideo({
      sourceType: ['camera', 'album'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        this.uploadMedia([res.tempFilePath], 'video', res.thumbTempFilePath);
      }
    });
  },

  /**
   * 上传媒体文件
   */
  async uploadMedia(filePaths, type, thumbPath) {
    console.log('[评价页面] 开始上传媒体文件:', filePaths, type);
    
    // 设置上传状态
    this.setData({
      uploading: true
    });
    
    wx.showLoading({
      title: '上传中...'
    });
    
    try {
      const uploadPromises = filePaths.map(async (filePath) => {
        // 调用API上传文件
        const uploadResult = await uploadFile(filePath, type);
        
        if (uploadResult.success && uploadResult.body && uploadResult.body.length > 0) {
          const fileInfo = uploadResult.body[0];
          
          // 返回标准化的文件信息
          return {
            type: fileInfo.type,
            url: fileInfo.url,
            thumb: fileInfo.thumb || fileInfo.url,
            size: fileInfo.size,
            fileName: fileInfo.fileName,
            uploadTime: fileInfo.uploadTime
          };
        } else {
          throw new Error(uploadResult.message || '文件上传失败');
        }
      });
      
      const results = await Promise.all(uploadPromises);
      
      const uploadedMedia = [...this.data.uploadedMedia, ...results];
      this.setData({ 
        uploadedMedia: uploadedMedia,
        uploading: false
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
      
      console.log('[评价页面] 文件上传成功：', results);
      
    } catch (error) {
      this.setData({
        uploading: false
      });
      
      wx.hideLoading();
      console.error('[评价页面] 上传失败:', error);
      
      wx.showModal({
        title: '上传失败',
        content: error.message || '文件上传失败，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试上传
            this.uploadMedia(filePaths, type, thumbPath);
          }
        }
      });
    }
  },

  /**
   * 预览媒体文件
   */
  previewMedia(e) {
    const index = e.currentTarget.dataset.index;
    const media = this.data.uploadedMedia[index];
    
    if (media.type === 'image') {
      const urls = this.data.uploadedMedia
        .filter(item => item.type === 'image')
        .map(item => item.url);
      
      wx.previewImage({
        urls: urls,
        current: media.url
      });
    } else if (media.type === 'video') {
      // 播放视频
      wx.navigateTo({
        url: `/pages/video-player/index?src=${encodeURIComponent(media.url)}`
      });
    }
  },

  /**
   * 删除媒体文件
   */
  async deleteMedia(e) {
    const index = e.currentTarget.dataset.index;
    const media = this.data.uploadedMedia[index];
    
    try {
      // 调用API删除服务器文件
      const deleteResult = await deleteMediaFile(media.url);
      
      if (deleteResult.success) {
        const uploadedMedia = [...this.data.uploadedMedia];
        uploadedMedia.splice(index, 1);
        
        this.setData({ uploadedMedia });
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        console.log('[评价页面] 文件删除成功：', media.url);
      } else {
        throw new Error(deleteResult.message || '删除失败');
      }
    } catch (error) {
      console.error('[评价页面] 删除文件失败:', error);
      
      // 即使删除服务器文件失败，也从本地列表中移除
      const uploadedMedia = [...this.data.uploadedMedia];
      uploadedMedia.splice(index, 1);
      this.setData({ uploadedMedia });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }
  },

  /**
   * 切换匿名状态
   */
  toggleAnonymous(e) {
    const isAnonymous = e.detail.value;
    this.setData({ isAnonymous });
    console.log('[评价页面] 匿名评价:', isAnonymous);
  },

  /**
   * 切换公开状态
   */
  togglePublic(e) {
    const isPublic = e.detail.value;
    this.setData({ isPublic });
    console.log('[评价页面] 公开评价:', isPublic);
  },

  /**
   * 提交评价
   */
  async submitEvaluation() {
    if (this.data.rating === 0) {
      wx.showToast({
        title: '请先给商品评分',
        icon: 'none'
      });
      return;
    }

    // 防止重复提交
    if (this.data.submitting) {
      return;
    }
    
    wx.showLoading({
      title: '提交中...'
    });
    
    // 设置提交状态
    this.setData({
      submitting: true
    });
    
    try {
      // 构建评价数据，严格按照接口文档格式
      const evaluationData = {
        orderId: this.data.orderInfo.id,
        goodsId: this.data.orderInfo.goods[0].id,
        rating: this.data.rating,
        content: this.data.textContent,
        tags: this.data.selectedTags,
        mediaUrls: this.data.uploadedMedia.map(item => item.url),
        isAnonymous: this.data.isAnonymous,
        isPublic: this.data.isPublic
      };
      
      console.log('[评价页面] 提交评价数据:', evaluationData);
      
      // 调用API提交评价
      const result = await submitEvaluation(evaluationData);
      
      if (result.success && result.body) {
        console.log('[评价页面] 评价提交成功：', result.body);
        
        wx.hideLoading();
        
        // 显示成功信息，包括奖励积分
        const rewardPoints = result.body.rewardPoints || 0;
        const successMsg = rewardPoints > 0 ? 
          `评价提交成功，获得${rewardPoints}积分` : 
          '评价提交成功';
        
        wx.showToast({
          title: successMsg,
          icon: 'success',
          duration: 2000
        });
        
        // 延时关闭页面
        setTimeout(() => {
          this.closePage();
        }, 2000);
      } else {
        throw new Error(result.message || '评价提交失败');
      }
      
    } catch (error) {
      console.error('[评价页面] 提交评价失败:', error);
      
      wx.hideLoading();
      
      wx.showModal({
        title: '提交失败',
        content: error.message || '评价提交失败，请重试',
        showCancel: true,
        confirmText: '重试',
        cancelText: '确定',
        success: (res) => {
          if (res.confirm) {
            // 重试提交
            this.submitEvaluation();
          }
        }
      });
    } finally {
      // 重置提交状态
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 关闭页面
   */
  closePage() {
    // 先播放关闭动画
    this.setData({ show: false });
    
    // 延时返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 300);
  },

  /**
   * 页面卸载时的处理
   */
  onUnload() {
    // 清理资源
    this.setData({ show: false });
  }
}); 