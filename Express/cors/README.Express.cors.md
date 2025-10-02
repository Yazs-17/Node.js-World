# Express CORS 最佳使用教程

## 📋 目录
1. [什么是CORS](#什么是CORS)
2. [安装和基本设置](#安装和基本设置)
3. [基础用法](#基础用法)
4. [高级配置](#高级配置)
5. [常见场景](#常见场景)
6. [安全最佳实践](#安全最佳实践)
7. [故障排除](#故障排除)

## 什么是CORS

CORS (Cross-Origin Resource Sharing，跨源资源共享) 是一种机制，它使用额外的 HTTP 头来告诉浏览器允许运行在一个源上的 Web 应用访问来自不同源的选定资源。

### 同源策略
浏览器的同源策略要求：
- 协议相同 (http/https)
- 域名相同
- 端口相同

如果任何一个不同，就被认为是跨源请求。

## 安装和基本设置

```bash
npm install express cors
```

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或者直接启动
npm start
```

## 文件说明

- `server.js` - 主服务器文件，展示各种CORS配置
- `examples/` - 包含不同场景的示例
- `public/` - 前端测试文件
- `test-cors.js` - CORS测试脚本

## 学习路径

1. 先运行 `server.js` 了解基本概念
2. 查看 `examples/` 目录下的具体场景
3. 使用 `public/test.html` 进行实际测试
4. 运行 `test-cors.js` 查看测试结果

## 最佳实践要点

✅ **推荐做法：**
- 明确指定允许的源，避免使用通配符
- 根据需要配置具体的HTTP方法
- 合理设置credentials选项
- 使用白名单机制

❌ **避免做法：**
- 在生产环境中使用 `origin: "*"` 和 `credentials: true`
- 忽略预检请求的处理
- 过于宽松的CORS配置