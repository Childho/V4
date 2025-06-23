// 商品评价页面逻辑
const { api } = require('../../api/utils/request');

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
    
    // 星级评价文本
    ratingTexts: [
      '差评，很不满意',
      '不太满意',
      '一般般',
      '满意，值得推荐', 
      '非常满意，超出期待'
    ],
    
    // 可选标签（根据商品类型动态加载）
    availableTags: [
      '质量很好', '做工精细', '包装完整', '发货迅速',
      '客服态度好', '性价比高', '样式好看', '尺寸合适',
      '材质舒适', '颜色正', '功能齐全', '使用方便'
    ]
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
      this.loadOrderInfo(orderId);
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
   * 页面卸载时的处理
   */
  onUnload() {
    // 清理资源
    this.setData({ show: false });
  },

  /**
   * 加载订单信息
   */
  async loadOrderInfo(orderId) {
    try {
      console.log('[评价页面] 加载订单信息，订单ID:', orderId);
      
      // 模拟订单数据
      const mockOrderInfo = {
        id: orderId,
        goods: [{
          id: 1,
          title: '李宁N72三代羽毛球拍全碳素超轻进攻型单拍',
          image: 'https://img.alicdn.com/imgextra/i1/2200756107659/O1CN01YXz5Tl1H8QBqKJPYu_!!2200756107659.jpg',
          spec: '颜色:炫酷黑 重量:4U',
          price: 299.00
        }]
      };
      
      // 真实项目中调用接口获取订单详情
      // const orderInfo = await api.get('/api/order/detail', { orderId });
      
      this.setData({
        orderInfo: mockOrderInfo
      });
      
      // 根据商品类型调整可用标签
      this.adjustTagsByProduct(mockOrderInfo.goods[0]);
      
    } catch (error) {
      console.error('[评价页面] 加载订单信息失败:', error);
      wx.showToast({
        title: '加载订单信息失败',
        icon: 'none'
      });
    }
  },

  /**
   * 根据商品调整可用标签
   */
  adjustTagsByProduct(goods) {
    // 根据商品类型提供不同的标签选项
    let tags = [...this.data.availableTags];
    
    // 根据商品标题判断类型并添加特定标签
    if (goods.title.includes('羽毛球拍')) {
      tags = ['手感很好', '重量合适', '弹性不错', '外观漂亮', ...tags];
    } else if (goods.title.includes('球鞋')) {
      tags = ['舒适度好', '防滑效果好', '透气性好', '脚感不错', ...tags];
    } else if (goods.title.includes('球服')) {
      tags = ['面料舒适', '吸汗性好', '版型合身', '颜色好看', ...tags];
    }
    
    this.setData({ availableTags: tags });
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
      if (selectedTags.length < 5) { // 最多选择5个标签
        selectedTags.push(tag); // 添加选择
      } else {
        wx.showToast({
          title: '最多选择5个标签',
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
    
    wx.showLoading({
      title: '上传中...'
    });
    
    try {
      const uploadPromises = filePaths.map(async (filePath, index) => {
        // 模拟上传过程
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 实际项目中调用上传接口
        // const uploadResult = await this.uploadFile(filePath);
        
        // 模拟返回结果
        const mockResult = {
          type: type,
          url: filePath, // 实际应该是服务器返回的URL
          thumb: type === 'video' ? thumbPath : filePath,
          size: '1.2MB' // 模拟文件大小
        };
        
        return mockResult;
      });
      
      const results = await Promise.all(uploadPromises);
      
      const uploadedMedia = [...this.data.uploadedMedia, ...results];
      this.setData({ uploadedMedia });
      
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
      
    } catch (error) {
      wx.hideLoading();
      console.error('[评价页面] 上传失败:', error);
      wx.showToast({
        title: '上传失败，请重试',
        icon: 'none'
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
  deleteMedia(e) {
    const index = e.currentTarget.dataset.index;
    const uploadedMedia = [...this.data.uploadedMedia];
    uploadedMedia.splice(index, 1);
    
    this.setData({ uploadedMedia });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
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
    
    wx.showLoading({
      title: '提交中...'
    });
    
    try {
      const evaluationData = {
        orderId: this.data.orderInfo.id,
        goodsId: this.data.orderInfo.goods[0].id,
        rating: this.data.rating,
        content: this.data.textContent,
        tags: this.data.selectedTags,
        mediaUrls: this.data.uploadedMedia.map(item => item.url),
        isAnonymous: this.data.isAnonymous,
        isPublic: this.data.isPublic,
        createTime: new Date().toISOString()
      };
      
      console.log('[评价页面] 提交评价数据:', evaluationData);
      
      // 实际项目中调用提交评价接口
      // await api.post('/api/evaluation/submit', evaluationData);
      
      // 模拟提交延时
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      wx.hideLoading();
      wx.showToast({
        title: '评价提交成功',
        icon: 'success'
      });
      
      // 延时关闭页面
      setTimeout(() => {
        this.closePage();
      }, 1500);
      
    } catch (error) {
      wx.hideLoading();
      console.error('[评价页面] 提交评价失败:', error);
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
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
  }
}); 