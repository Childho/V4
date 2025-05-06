// 课程详情页面
interface IPageData {
  courseInfo: any | null;
}

interface IPageInstance {
  data: IPageData;
  loadCourseDetail: (courseId: string) => Promise<void>;
}

Page<IPageData, IPageInstance>({
  data: {
    courseInfo: null
  },

  onLoad(options: Record<string, string>) {
    // 页面加载时获取课程ID
    const courseId = options.id;
    if (courseId) {
      this.loadCourseDetail(courseId);
    }
  },

  // 加载课程详情
  async loadCourseDetail(courseId: string) {
    try {
      // TODO: 调用API获取课程详情
      wx.showLoading({
        title: '加载中...'
      });
      
      // 模拟加载数据
      setTimeout(() => {
        wx.hideLoading();
      }, 1000);
    } catch (error) {
      console.error('加载课程详情失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  }
}); 