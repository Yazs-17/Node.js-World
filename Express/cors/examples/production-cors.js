// examples/production-cors.js  
// 生产环境的CORS配置示例

const express = require('express');
const cors = require('cors');
const app = express();

console.log('生产环境CORS配置示例');

// ==========================================
// 场景2: 生产环境 - 严格的CORS配置
// ==========================================

// 白名单域名（实际使用时应该从环境变量读取）
const allowedOrigins = [
	'https://yourdomain.com',
	'https://www.yourdomain.com',
	'https://app.yourdomain.com',
	'https://admin.yourdomain.com',
	// 开发环境域名
	process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
	process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : null,
	process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000' : null
].filter(Boolean); // 过滤掉null值

// 动态CORS配置
const corsOptions = {
	origin: function (origin, callback) {
		// 检查是否为服务器到服务器的请求（没有origin）
		if (!origin) {
			console.log('✅ 服务器到服务器请求，允许访问');
			return callback(null, true);
		}

		// 检查origin是否在白名单中
		if (allowedOrigins.includes(origin)) {
			console.log(`✅ 允许来自 ${origin} 的请求`);
			callback(null, true);
		} else {
			console.log(`❌ 拒绝来自 ${origin} 的请求`);
			const error = new Error(`CORS Policy: Origin ${origin} is not allowed`);
			error.statusCode = 403;
			callback(error);
		}
	},

	// 允许的HTTP方法
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

	// 允许的请求头
	allowedHeaders: [
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		'Authorization',
		'Cache-Control',
		'X-API-Key'
	],

	// 是否允许发送cookies和认证信息
	credentials: true,

	// 预检请求的缓存时间（秒）
	maxAge: 86400, // 24小时

	// 允许客户端访问的响应头
	exposedHeaders: ['X-Total-Count', 'X-Page-Count'],

	// 预检请求成功的状态码
	optionsSuccessStatus: 200
};

// 应用CORS中间件
app.use(cors(corsOptions));

// 安全中间件
app.use(express.json({ limit: '10mb' }));

// ==========================================
// API路由
// ==========================================

// 公开API（可以使用更宽松的CORS）
const publicCorsOptions = {
	origin: true, // 允许所有origin
	methods: ['GET'],
	credentials: false
};

app.get('/api/public/status', cors(publicCorsOptions), (req, res) => {
	res.json({
		status: 'online',
		version: '1.0.0',
		timestamp: new Date().toISOString()
	});
});

// 受保护的API（使用严格的CORS）
app.get('/api/protected/user', (req, res) => {
	const authHeader = req.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({
			error: 'Unauthorized',
			message: '需要有效的Authorization头'
		});
	}

	res.json({
		user: {
			id: 1,
			name: 'John Doe',
			email: 'john@example.com'
		},
		origin: req.get('Origin')
	});
});

// 敏感操作API（最严格的CORS）
const adminCorsOptions = {
	origin: ['https://admin.yourdomain.com'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true,
	maxAge: 0 // 不缓存预检请求
};

app.delete('/api/admin/users/:id', cors(adminCorsOptions), (req, res) => {
	// 模拟删除用户
	res.json({
		message: `用户 ${req.params.id} 已删除`,
		timestamp: new Date().toISOString()
	});
});

// ==========================================
// 错误处理
// ==========================================

// CORS错误处理
app.use((error, req, res, next) => {
	if (error.message.includes('CORS Policy')) {
		console.log(`CORS错误: ${error.message}`);

		res.status(error.statusCode || 403).json({
			error: 'CORS Policy Violation',
			message: '您的域名未被授权访问此资源',
			origin: req.get('Origin'),
			allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : ['未配置'],
			contact: 'support@yourdomain.com'
		});
	} else {
		next(error);
	}
});

// 通用错误处理
app.use((error, req, res, next) => {
	console.error('服务器错误:', error);
	res.status(500).json({
		error: 'Internal Server Error',
		message: '服务器内部错误'
	});
});

// 404处理
app.use('*', (req, res) => {
	res.status(404).json({
		error: 'Not Found',
		message: `API端点 ${req.originalUrl} 不存在`
	});
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
	console.log(`生产环境CORS服务器运行在端口 ${PORT}`);
	console.log('允许的源:', allowedOrigins);
	console.log('环境:', process.env.NODE_ENV || 'development');

	console.log('\n可用API端点:');
	console.log('  GET  /api/public/status    - 公开状态API');
	console.log('  GET  /api/protected/user   - 受保护用户API');
	console.log('  DELETE /api/admin/users/:id - 管理员API');
});

/*
生产环境CORS最佳实践:

1. 明确指定允许的域名，不要使用通配符
2. 根据需要限制HTTP方法
3. 谨慎使用credentials: true
4. 设置合理的maxAge来缓存预检请求
5. 实现适当的错误处理
6. 对不同的API端点使用不同的CORS策略
7. 从环境变量读取配置
8. 记录和监控CORS相关的请求和错误

测试方法:
1. 设置环境变量: NODE_ENV=production
2. 运行: node examples/production-cors.js
3. 使用不同域名测试请求
4. 观察CORS策略的执行情况
*/