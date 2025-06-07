/**
 * 倒计时工具类
 * 用于处理秒杀页面的倒计时逻辑
 */

/**
 * 格式化时间差为倒计时字符串
 * @param {number} timeDiff 时间差（毫秒）
 * @returns {string} 格式化的倒计时字符串 "HH:MM:SS"
 */
function formatCountdown(timeDiff) {
  if (timeDiff <= 0) {
    return '已结束';
  }
  
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 检查倒计时是否结束
 * @param {number} endTime 结束时间戳
 * @returns {boolean} 是否已结束
 */
function isCountdownExpired(endTime) {
  return Date.now() >= endTime;
}

/**
 * 获取剩余时间（毫秒）
 * @param {number} endTime 结束时间戳
 * @returns {number} 剩余时间毫秒数
 */
function getRemainingTime(endTime) {
  return Math.max(0, endTime - Date.now());
}

/**
 * 倒计时管理器类
 * 用于管理多个倒计时任务
 */
class CountdownManager {
  constructor() {
    this.timers = new Map(); // 存储定时器
    this.callbacks = new Map(); // 存储回调函数
  }
  
  /**
   * 添加倒计时任务
   * @param {string} id 任务ID
   * @param {number} endTime 结束时间戳
   * @param {function} callback 更新回调函数
   * @param {number} interval 更新间隔（毫秒），默认1000
   */
  addCountdown(id, endTime, callback, interval = 1000) {
    // 清除已存在的定时器
    this.removeCountdown(id);
    
    // 存储回调函数
    this.callbacks.set(id, callback);
    
    // 立即执行一次
    this.updateCountdown(id, endTime);
    
    // 设置定时器
    const timer = setInterval(() => {
      this.updateCountdown(id, endTime);
    }, interval);
    
    this.timers.set(id, timer);
  }
  
  /**
   * 更新单个倒计时
   * @param {string} id 任务ID
   * @param {number} endTime 结束时间戳
   */
  updateCountdown(id, endTime) {
    const callback = this.callbacks.get(id);
    if (!callback) return;
    
    const remainingTime = getRemainingTime(endTime);
    const countdownText = formatCountdown(remainingTime);
    const isExpired = isCountdownExpired(endTime);
    
    // 调用回调函数
    callback({
      id,
      remainingTime,
      countdownText,
      isExpired
    });
    
    // 如果倒计时结束，清除定时器
    if (isExpired) {
      this.removeCountdown(id);
    }
  }
  
  /**
   * 移除倒计时任务
   * @param {string} id 任务ID
   */
  removeCountdown(id) {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
    this.callbacks.delete(id);
  }
  
  /**
   * 清除所有倒计时任务
   */
  clearAll() {
    this.timers.forEach((timer) => {
      clearInterval(timer);
    });
    this.timers.clear();
    this.callbacks.clear();
  }
  
  /**
   * 获取活跃的倒计时任务数量
   */
  getActiveCount() {
    return this.timers.size;
  }
}

/**
 * 生成随机的结束时间（用于mock数据）
 * @param {number} minHours 最少小时数
 * @param {number} maxHours 最大小时数
 * @returns {number} 结束时间戳
 */
function generateRandomEndTime(minHours = 1, maxHours = 24) {
  const now = Date.now();
  const randomHours = Math.random() * (maxHours - minHours) + minHours;
  return now + randomHours * 60 * 60 * 1000;
}

module.exports = {
  formatCountdown,
  isCountdownExpired,
  getRemainingTime,
  CountdownManager,
  generateRandomEndTime
}; 