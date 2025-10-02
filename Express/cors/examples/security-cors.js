// examples/security-cors.js
// 安全性导向的CORS配置示例

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

console.log('安全性导向的CORS配置示例');

// ==========================================
// 安全中间件
// ==========================================

// Helmet - 设置各种HTTP头来保护应用
app.use(helmet({
	crossOriginEmbedderPolicy: false, // 避免与CORS冲突
	crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 速率限制
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15分钟
	max: 100, // 限制每个IP 100个请求
	message: {
		error: 'Too Many Requests',
		message: '请求过于频繁，请稍后再试'
	},
	standardHeaders: true,
	legacyHeaders: false
});

// 更严格的认证端点限制
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5, // 认证端点每15分钟只允许5次尝试
	message: {
		error: 'Authentication Rate Limit Exceeded',
		message: '认证尝试次数过多，请稍后再试'
	}
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// ==========================================
// 安全的CORS配置
// ==========================================

// 生产环境严格的域名白名单
const PRODUCTION_ORIGINS = [
	'https://yourdomain.com',
	'https://www.yourdomain.com',
	'https://app.yourdomain.com'
];

// 开发环境域名（仅在开发模式下添加）
const DEVELOPMENT_ORIGINS = process.env.NODE_ENV === 'development' ? [
	'http://localhost:3000',
	'http://localhost:8080',
	'http://127.0.0.1:3000',
	'http://127.0.0.1:8080'
] : [];

const ALLOWED_ORIGINS = [...PRODUCTION_ORIGINS, ...DEVELOPMENT_ORIGINS];

// 安全的CORS配置
const secureCorsOptions = {
	origin: function (origin, callback) {
		// 记录所有CORS请求以便审计
		console.log(`CORS请求审计: ${new Date().toISOString()} - Origin: ${origin || 'unknown'}`);

		// 检查是否为服务器到服务器请求
		if (!origin) {
			// 可以选择允许或拒绝没有origin的请求
			// 生产环境中可能需要更严格的检查
			console.log('⚠️  无Origin请求，可能是服务器到服务器请求');
			return callback(null, true);
		}

		// 严格的域名检查
		if (ALLOWED_ORIGINS.includes(origin)) {
			console.log(`✅ 允许的源: ${origin}`);
			callback(null, true);
		} else {
			console.log(`❌ 拒绝的源: ${origin}`);
			// 记录潜在的安全威胁
			console.warn(`安全警告: 未授权的跨源请求尝试 - ${origin}`);

			// 返回安全错误
			const error = new Error('CORS: Origin not allowed by security policy');
			error.statusCode = 403;
			callback(error);
		}
	},

	// 严格限制HTTP方法
	methods: ['GET', 'POST', 'PUT', 'DELETE'],

	// 严格限制请求头
	allowedHeaders: [
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		'Authorization',
		'X-CSRF-Token', // CSRF保护
		'X-API-Key'
	],

	// 只有在必要时才允许凭据
	credentials: true,

	// 短的预检缓存时间以便快速撤销访问权限
	maxAge: 300, // 5分钟

	// 限制暴露的响应头
	exposedHeaders: ['X-Total-Count'],

	// 预检成功状态
	optionsSuccessStatus: 200
};

// 应用安全CORS配置
app.use(cors(secureCorsOptions));

app.use(express.json({
	limit: '1mb', // 限制请求体大小
	type: 'application/json'
}));

// ==========================================
// 安全的API端点
// ==========================================

// 健康检查端点（公开，但有限制）
const healthCheckCors = cors({
	origin: '*',
	methods: ['GET'],
	credentials: false,
	maxAge: 86400
});

app.get('/health', healthCheckCors, (req, res) => {
	res.json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		version: process.env.APP_VERSION || '1.0.0'
	});
});

// 认证端点 - 最严格的安全配置
const authSecureCors = cors({
	origin: PRODUCTION_ORIGINS, // 只允许生产域名
	methods: ['POST'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
	maxAge: 0 // 不缓存预检请求
});

app.post('/api/auth/login', authSecureCors, (req, res) => {
	const { username, password, csrfToken } = req.body;
	const clientCSRF = req.get('X-CSRF-Token');

	// CSRF保护检查
	if (!clientCSRF || clientCSRF !== csrfToken) {
		console.warn(`CSRF攻击尝试: ${req.get('Origin')} - IP: ${req.ip}`);
		return res.status(403).json({
			error: 'CSRF Token Mismatch',
			message: 'Invalid CSRF token'
		});
	}

	// 基本认证逻辑
	if (username === 'admin' && password === 'securepassword') {
		res.json({
			success: true,
			token: 'secure-jwt-token',
			expiresIn: 3600
		});
	} else {
		console.warn(`登录失败尝试: ${username} from ${req.get('Origin')}`);
		res.status(401).json({
			error: 'Authentication Failed',
			message: '用户名或密码错误'
		});
	}
});

// 敏感数据API - 需要多重验证
const sensitiveDataCors = cors({
	origin: function (origin, callback) {
		// 只允许主域名访问敏感数据
		if (origin === 'https://yourdomain.com') {
			callback(null, true);
		} else {
			console.warn(`敏感数据访问尝试: ${origin}`);
			callback(new Error('Access to sensitive data denied'));
		}
	},
	credentials: true,
	methods: ['GET'],
	maxAge: 0
});

app.get('/api/sensitive/data', sensitiveDataCors, (req, res) => {
	const authHeader = req.get('Authorization');
	const apiKey = req.get('X-API-Key');

	// 多重验证
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: '需要Bearer token' });
	}

	if (!apiKey || apiKey !== 'secure-api-key-123') {
		console.warn(`无效API密钥尝试: ${apiKey} from ${req.get('Origin')}`);
		return res.status(401).json({ error: '无效的API密钥' });
	}

	res.json({
		sensitiveData: 'This is very sensitive information',
		accessTime: new Date().toISOString(),
		clientOrigin: req.get('Origin')
	});
});

// ==========================================
// 安全监控和日志
// ==========================================

// CORS违规监控
const corsViolationLogger = (req, res, next) => {
	const origin = req.get('Origin');
	const referer = req.get('Referer');
	const userAgent = req.get('User-Agent');

	// 检查可疑的请求
	if (origin && !ALLOWED_ORIGINS.includes(origin)) {
		console.warn('🚨 可疑CORS请求:', {
			timestamp: new Date().toISOString(),
			origin: origin,
			referer: referer,
			userAgent: userAgent,
			ip: req.ip,
			path: req.path,
			method: req.method
		});
	}

	next();
};

app.use(corsViolationLogger);

// ==========================================
// 安全响应头
// ==========================================

app.use((req, res, next) => {
	// 添加自定义安全头
	res.header('X-Frame-Options', 'DENY');
	res.header('X-Content-Type-Options', 'nosniff');
	res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

	next();
});

// ==========================================
// 错误处理
// ==========================================

// CORS安全错误处理
app.use((error, req, res, next) => {
	if (error.message.includes('CORS') || error.message.includes('Origin not allowed')) {
		// 记录安全事件
		console.error('🔒 CORS安全事件:', {
			timestamp: new Date().toISOString(),
			error: error.message,
			origin: req.get('Origin'),
			ip: req.ip,
			userAgent: req.get('User-Agent'),
			path: req.path
		});

		// 返回通用的安全错误消息
		res.status(403).json({
			error: 'Access Denied',
			message: '访问被安全策略拒绝',
			code: 'CORS_SECURITY_VIOLATION',
			timestamp: new Date().toISOString()
		});
	} else {
		next(error);
	}
});

// 通用错误处理
app.use((error, req, res, next) => {
	console.error('服务器错误:', error);

	// 不暴露内部错误信息
	res.status(500).json({
		error: 'Internal Server Error',
		message: '服务器内部错误',
		requestId: req.headers['x-request-id'] || 'unknown'
	});
});

// 404处理
app.use('*', (req, res) => {
	console.log(`404请求: ${req.method} ${req.originalUrl} from ${req.get('Origin') || 'unknown'}`);

	res.status(404).json({
		error: 'Not Found',
		message: '请求的资源不存在'
	});
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
	console.log(`安全CORS服务器运行在端口 ${PORT}`);
	console.log('安全特性已启用:');
	console.log('  ✅ 严格的CORS策略');
	console.log('  ✅ 速率限制');
	console.log('  ✅ Helmet安全头');
	console.log('  ✅ CSRF保护');
	console.log('  ✅ 请求审计日志');
	console.log('  ✅ 多重身份验证');
	console.log(`\n允许的源: ${ALLOWED_ORIGINS.join(', ')}`);
	console.log('环境:', process.env.NODE_ENV || 'development');
});

/*
安全CORS最佳实践总结:

1. 严格的域名白名单
2. 最小权限原则 - 只允许必要的方法和头
3. 短的预检缓存时间
4. 详细的安全日志和审计
5. 速率限制防止滥用
6. CSRF保护
7. 多重身份验证
8. 不暴露内部错误信息
9. 安全响应头
10. 实时安全监控

部署建议:
1. 使用环境变量管理域名白名单
2. 实施日志聚合和分析
3. 设置安全事件告警
4. 定期审查和更新CORS策略
5. 使用HTTPS
6. 实施内容安全策略(CSP)
*/