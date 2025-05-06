// 生成简单的图标文件
const fs = require('fs');
const path = require('path');

// 图标名称数组
const icons = [
  'home',
  'home_selected',
  'activity',
  'activity_selected',
  'mall',
  'mall_selected',
  'booking',
  'booking_selected',
  'personal',
  'personal_selected'
];

// 确保图标目录存在
const iconDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// 为每个图标创建一个简单的1x1像素PNG文件
icons.forEach(icon => {
  const filePath = path.join(iconDir, `${icon}.png`);
  
  // 创建一个简单的1x1像素的PNG文件
  // 这里用一个简单的白色像素，实际应该替换为真实图标
  const buffer = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63FCFFFF3F030000050001016EC8C77D0000000049454E44AE426082', 'hex');
  
  fs.writeFileSync(filePath, buffer);
  console.log(`Created icon: ${filePath}`);
});

console.log('All icons created successfully!'); 