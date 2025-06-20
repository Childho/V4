module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "globals": {
    "wx": "readonly",
    "App": "readonly",
    "Page": "readonly",
    "Component": "readonly",
    "getApp": "readonly",
    "getCurrentPages": "readonly"
  },
  "rules": {
    // 忽略SharedArrayBuffer相关的警告
    "no-undef": "off",
    "no-restricted-globals": [
      "error",
      {
        "name": "SharedArrayBuffer",
        "message": "SharedArrayBuffer is deprecated and will be disabled. Use regular Arrays instead."
      }
    ]
  }
}; 