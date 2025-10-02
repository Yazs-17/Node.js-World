const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 基础中间件
app.use(helmet()); // 安全头
app.use(express.json());
app.use(express.static('public'));

// 速率限制
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15分钟
	max: 100 // 限制每个IP最多100个请求
});
app.use(limiter);

console.log('=== Express CORS 教程服务器 ===\n');

// ==========================================
// 1. 最简单的CORS配置 - 允许所有源
// ==========================================
console.log('1. 基础CORS配置示例');

// 简单的全局CORS（仅用于开发环境）
// app.use(cors()); // 等同于 cors({origin: "*"})

// ==========================================
// 2. 具体源配置 - 推荐用于生产环境
// ==========================================

// 允许的源列表（生产环境应该明确指定）
const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:8080',
	'http://127.0.0.1:3000',
	'http://127.0.0.1:8080',
	'https://yourdomain.com',
	'https://www.yourdomain.com'
];

// 动态CORS配置
const corsOptions = {
	origin: function (origin, callback) {
		// 允许没有origin的请求（如移动应用、Postman等）
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			console.log(`❌ 拒绝来自 ${origin} 的请求`);
			callback(new Error('不允许的源 - CORS policy violation'));
		}
	},
	credentials: true, // 允许发送cookies
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: [
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		'Authorization',
		'Cache-Control'
	],
	maxAge: 86400 // 预检请求缓存时间（24小时）
};

// 应用CORS配置
app.use(cors(corsOptions));

// ==========================================
// 3. 路由特定的CORS配置
// ==========================================

// 公开API - 允许所有源
app.get('/api/public', cors(), (req, res) => {
	console.log('✅ 公开API访问');
	res.json({
		message: '这是一个公开的API端点',
		timestamp: new Date().toISOString(),
		origin: req.get('Origin') || 'No origin'
	});
});

// 受限API - 使用严格的CORS
const restrictedCorsOptions = {
	origin: ['https://trusted-domain.com'],
	methods: ['GET'],
	credentials: true
};

app.get('/api/restricted', cors(restrictedCorsOptions), (req, res) => {
	console.log('🔒 受限API访问尝试');
	res.json({
		message: '这是一个受限的API端点',
		data: 'sensitive information'
	});
});

// ==========================================
// 4. 不同场景的示例路由
// ==========================================

// 简单请求示例
app.get('/api/simple', (req, res) => {
	console.log('📝 简单请求:', req.method, req.path);
	res.json({
		type: 'simple request',
		message: '这是一个简单请求，不需要预检',
		headers: req.headers
	});
});

// 复杂请求示例（会触发预检请求）
app.post('/api/complex', (req, res) => {
	console.log('🔄 复杂请求:', req.method, req.path);
	console.log('请求体:', req.body);

	res.json({
		type: 'complex request',
		message: '这是一个复杂请求，需要预检',
		received: req.body,
		contentType: req.get('Content-Type')
	});
});

// 文件上传示例
app.post('/api/upload', (req, res) => {
	console.log('📤 文件上传请求');
	res.json({
		message: '文件上传端点',
		note: '实际文件处理需要multer等中间件'
	});
});

// 需要认证的端点
app.get('/api/protected', (req, res) => {
	const authHeader = req.get('Authorization');
	console.log('🛡️ 受保护端点访问，认证头:', authHeader || '无');

	if (!authHeader) {
		return res.status(401).json({
			error: '需要认证',
			message: '请提供Authorization头'
		});
	}

	res.json({
		message: '认证成功',
		user: 'demo-user',
		permissions: ['read', 'write']
	});
});

// ==========================================
// 5. 错误处理
// ==========================================

// CORS错误处理中间件
app.use((error, req, res, next) => {
	if (error.message.includes('CORS')) {
		console.log('❌ CORS错误:', error.message);
		res.status(403).json({
			error: 'CORS Error',
			message: '跨源请求被拒绝',
			origin: req.get('Origin'),
			solution: '请联系管理员将您的域名添加到白名单'
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
		message: `端点 ${req.originalUrl} 不存在`,
		availableEndpoints: [
			'GET /api/public',
			'GET /api/restricted',
			'GET /api/simple',
			'POST /api/complex',
			'POST /api/upload',
			'GET /api/protected'
		]
	});
});

// ==========================================
// 6. 服务器启动
// ==========================================

app.listen(PORT, () => {
	console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`);
	console.log(`📖 访问 http://localhost:${PORT}/test.html 进行CORS测试`);
	console.log('\n可用的API端点:');
	console.log('  GET  /api/public    - 公开API');
	console.log('  GET  /api/restricted - 受限API');
	console.log('  GET  /api/simple    - 简单请求');
	console.log('  POST /api/complex   - 复杂请求');
	console.log('  POST /api/upload    - 文件上传');
	console.log('  GET  /api/protected - 需要认证');
	console.log('\n💡 提示: 使用不同的端口访问测试页面来模拟跨源请求');
	console.log('=====================================\n');
});

// 优雅关闭
process.on('SIGTERM', () => {
	console.log('🛑 收到终止信号，正在关闭服务器...');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('\n🛑 收到中断信号，正在关闭服务器...');
	process.exit(0);
});