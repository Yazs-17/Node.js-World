# Express CORS 最佳实践指南

## 🎯 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动主服务器
```bash
npm start
# 或者开发模式
npm run dev
```

### 3. 打开测试页面
访问 `http://localhost:3000/test.html` 进行交互式测试

### 4. 运行自动化测试
```bash
npm test
```

## 📚 核心概念

### 什么是CORS？
CORS (Cross-Origin Resource Sharing) 是一种机制，允许Web页面访问不同源的资源。

**同源的定义：**
- 相同的协议 (http/https)
- 相同的域名
- 相同的端口

### 为什么需要CORS？
- 浏览器的同源策略限制跨源请求
- API服务通常需要为多个前端应用提供服务
- 微服务架构中服务间需要通信

## 🔧 基础配置

### 1. 最简单的CORS（开发环境）
```javascript
const cors = require('cors');
app.use(cors()); // 允许所有源
```

### 2. 生产环境配置
```javascript
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

## 🛡️ 安全最佳实践

### ✅ 推荐做法

1. **明确指定允许的源**
   ```javascript
   origin: ['https://yourdomain.com'] // 不要使用 "*"
   ```

2. **限制HTTP方法**
   ```javascript
   methods: ['GET', 'POST'] // 只允许需要的方法
   ```

3. **谨慎使用credentials**
   ```javascript
   credentials: true // 只在需要时启用
   ```

4. **设置合理的预检缓存**
   ```javascript
   maxAge: 86400 // 24小时，减少预检请求
   ```

### ❌ 避免做法

1. **生产环境使用通配符+凭据**
   ```javascript
   // 危险！不要这样做
   origin: "*",
   credentials: true
   ```

2. **过于宽松的配置**
   ```javascript
   // 不推荐
   origin: true,
   methods: "*",
   allowedHeaders: "*"
   ```

## 📋 常见场景配置

### 场景1: 单页应用(SPA)
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 场景2: 多域名支持
```javascript
const allowedOrigins = [
  'https://app.example.com',
  'https://admin.example.com',
  'https://mobile.example.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
```

### 场景3: API分级访问控制
```javascript
// 公开API
app.use('/api/public', cors({ origin: '*', credentials: false }));

// 受保护API
app.use('/api/protected', cors({
  origin: ['https://app.example.com'],
  credentials: true
}));
```

## 🔍 调试和故障排除

### 常见错误

1. **"Access to XMLHttpRequest has been blocked by CORS policy"**
   - 检查origin配置
   - 确认请求的域名在白名单中

2. **预检请求失败**
   - 检查OPTIONS方法是否被正确处理
   - 确认allowedHeaders配置

3. **凭据传递失败**
   - 确保credentials设置为true
   - 检查前端请求是否包含credentials: 'include'

### 调试技巧

1. **查看Network面板**
   - 检查预检请求(OPTIONS)
   - 观察CORS响应头

2. **使用浏览器控制台**
   ```javascript
   // 测试CORS请求
   fetch('http://localhost:3000/api/test', {
     method: 'GET',
     credentials: 'include'
   }).then(response => console.log(response));
   ```

3. **服务器日志**
   - 记录所有CORS请求
   - 监控被拒绝的源

## 📊 性能优化

### 1. 预检请求缓存
```javascript
maxAge: 86400 // 缓存预检请求24小时
```

### 2. 条件CORS
```javascript
// 只对跨源请求应用CORS
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin && origin !== req.get('Host')) {
    cors(corsOptions)(req, res, next);
  } else {
    next();
  }
});
```

### 3. 路径特定CORS
```javascript
// 只对API路径应用CORS
app.use('/api', cors(corsOptions));
```

## 🌐 实际部署考虑

### 环境变量配置
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000'
];
```

### Nginx配置支持
```nginx
# 在Nginx层面处理CORS
add_header 'Access-Control-Allow-Origin' '$http_origin' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
```

### CDN和代理
- 确保CDN不会缓存CORS头
- 代理服务器正确转发Origin头

## 📈 监控和日志

### 记录CORS事件
```javascript
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin) {
    console.log(`CORS request from: ${origin} to ${req.path}`);
  }
  next();
});
```

### 安全监控
- 监控来自未授权域名的请求
- 记录CORS违规尝试
- 设置告警机制

## 🧪 测试策略

### 自动化测试
1. 运行测试套件: `npm test`
2. 测试不同源的访问
3. 验证预检请求处理
4. 测试错误场景

### 手动测试
1. 使用不同端口访问测试页面
2. 修改浏览器的Origin头
3. 测试不同的HTTP方法
4. 验证凭据传递

## 📚 进阶主题

### 自定义CORS中间件
```javascript
function customCors(options) {
  return (req, res, next) => {
    // 自定义CORS逻辑
    const origin = req.get('Origin');
    
    if (shouldAllowOrigin(origin, req)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    next();
  };
}
```

### 动态CORS策略
- 基于用户认证状态
- 根据API版本调整
- 时间段限制访问

### 与其他安全机制集成
- CSP (Content Security Policy)
- CSRF保护
- 速率限制

## 🔗 相关资源

- [MDN CORS文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS中间件](https://github.com/expressjs/cors)
- [W3C CORS规范](https://www.w3.org/TR/cors/)

## 💡 小贴士

1. **开发vs生产**: 开发环境可以宽松，生产环境必须严格
2. **预检优化**: 合理设置maxAge减少不必要的预检请求
3. **错误处理**: 提供清晰的CORS错误信息
4. **监控重要**: 监控CORS相关的请求和错误
5. **测试全面**: 测试各种场景，包括错误情况

记住：CORS是一个安全特性，正确配置它对保护您的应用程序至关重要！