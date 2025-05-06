import { api } from './utils/request';

// 获取用户积分总数
export const getTotalPoints = () => {
  return api.post('/points/total', {});  // 改为POST请求，传入空对象
};

// 获取积分明细列表
export const getPointsRecords = (params) => {
  return api.post('/points/records', params);
};

// 使用积分
export const usePoints = (params) => {
  return api.post('/points/use', params);
};

// 获取积分规则
export const getPointsRules = () => {
  return api.post('/points/rules', {});  // 改为POST请求，传入空对象
};

// 获取用户积分信息（包含积分余额和签到状态）
export const getPoints = () => {
  return api.post('/points/info', {});
};

// 签到获取积分
export const signIn = () => {
  return api.post('/points/signIn', {});
}; 