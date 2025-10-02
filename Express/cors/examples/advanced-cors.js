// examples/advanced-cors.js
// 高级CORS配置示例

const express = require('express');
const cors = require('cors');
const app = express();

console.log('高级CORS配置示例');

// ==========================================
// 场景3: 高级CORS配置 - 动态配置和多种策略
// ==========================================

// 基于请求路径的动态CORS配置
function createDynamicCorsOptions () {
	return {
		origin: function (origin, callback) {
			// 获取请求路径（需要在中间件中设置）
			const path = this.req.path;
			const method = this.req.method;

			console.log(`处理CORS: ${method} ${path} from ${origin || 'unknown'}`);

			// 根据路径决定CORS策略
			if (path.startsWith('/api/public')) {
				// 公开API允许所有源
				callback(null, true);
			} else if (path.startsWith('/api/partner')) {
				// 合作伙伴API只允许特定域名
				const partnerOrigins = [
					'https://partner1.com',
					'https://partner2.com',
					'https://api.partner3.com'
				];
				callback(null, partnerOrigins.includes(origin));
			} else if (path.startsWith('/api/internal')) {
				// 内部API只允许同域
				const internalOrigins = [
					'https://app.yourdomain.com',
					'https://admin.yourdomain.com'
				];
				callback(null, internalOrigins.includes(origin));
			} else {
				// 默认策略 - 检查通用白名单
				const allowedOrigins = [
					'https://yourdomain.com',
					'http://localhost:3000', // 开发环境
					'http://127.0.0.1:3000'
				];
				callback(null, allowedOrigins.includes(origin));
			}
		},

		credentials: function (req) {
			// 动态决定是否允许凭据
			if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/user')) {
				return true;
			}
			return false;
		},

		methods: function (req) {
			// 根据路径动态设置允许的方法
			if (req.path.startsWith('/api/public')) {
				return ['GET', 'HEAD'];
			} else if (req.path.startsWith('/api/upload')) {
				return ['POST', 'PUT'];
			} else {
				return ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
			}
		},

		maxAge: function (req) {
			// 根据API类型设置不同的缓存时间
			if (req.path.startsWith('/api/static')) {
				return 86400; // 静态API缓存24小时
			} else if (req.path.startsWith('/api/auth')) {
				return 0; // 认证API不缓存
			} else {
				return 3600; // 其他API缓存1小时
			}
		}
	};
}

// 为不同的API路径创建不同的CORS中间件
const publicCors = cors({
	origin: '*',
	methods: ['GET', 'HEAD'],
	credentials: false,
	maxAge: 86400
});

const partnerCors = cors({
	origin: ['https://partner1.com', 'https://partner2.com'],
	methods: ['GET', 'POST'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Partner-Key'],
	maxAge: 3600
});

const internalCors = cors({
	origin: ['https://app.yourdomain.com', 'https://admin.yourdomain.com'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Token'],
	maxAge: 7200
});

// 认证相关的严格CORS
const authCors = cors({
	origin: function (origin, callback) {
		const trustedOrigins = ['https://yourdomain.com', 'https://app.yourdomain.com'];
		if (!origin || trustedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('认证端点不允许此源'));
		}
	},
	credentials: true,
	methods: ['POST'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	maxAge: 0 // 认证请求不缓存
});

app.use(express.json());

// ==========================================
// 应用不同的CORS策略到不同路径
// ==========================================

// 公开API - 最宽松的CORS
app.use('/api/public', publicCors);

app.get('/api/public/info', (req, res) => {
	res.json({
		message: '这是公开API',
		version: '1.0.0',
		cors: 'public',
		origin: req.get('Origin')
	});
});

app.get('/api/public/data', (req, res) => {
	res.json({
		data: [1, 2, 3, 4, 5],
		message: '公开数据',
		timestamp: new Date().toISOString()
	});
});

// 合作伙伴API - 中等严格的CORS
app.use('/api/partner', partnerCors);

app.get('/api/partner/stats', (req, res) => {
	const partnerKey = req.get('X-Partner-Key');
	if (!partnerKey) {
		return res.status(401).json({ error: '需要合作伙伴密钥' });
	}

	res.json({
		stats: { users: 1000, active: 750 },
		partner: partnerKey,
		cors: 'partner'
	});
});

// 内部API - 严格的CORS
app.use('/api/internal', internalCors);

app.get('/api/internal/metrics', (req, res) => {
	const token = req.get('X-Internal-Token');
	if (!token) {
		return res.status(401).json({ error: '需要内部令牌' });
	}

	res.json({
		metrics: {
			cpu: '45%',
			memory: '67%',
			requests: 15420
		},
		cors: 'internal'
	});
});

// 认证API - 最严格的CORS
app.use('/api/auth', authCors);

app.post('/api/auth/login', (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: '用户名和密码是必需的' });
	}

	// 简单的认证逻辑
	if (username === 'admin' && password === 'password') {
		res.json({
			token: 'jwt-token-here',
			user: { id: 1, username: 'admin' },
			cors: 'auth'
		});
	} else {
		res.status(401).json({ error: '认证失败' });
	}
});

// ==========================================
// 条件CORS - 基于用户代理或其他条件
// ==========================================

const conditionalCors = cors({
	origin: function (origin, callback) {
		const req = this.req;
		const userAgent = req.get('User-Agent') || '';

		// 阻止某些用户代理
		if (userAgent.includes('BadBot') || userAgent.includes('Malicious')) {
			console.log(`阻止可疑用户代理: ${userAgent}`);
			return callback(new Error('不允许的用户代理'));
		}

		// 移动应用有特殊权限
		if (userAgent.includes('YourMobileApp')) {
			console.log('允许移动应用访问');
			return callback(null, true);
		}

		// 正常的源检查
		const allowedOrigins = ['https://yourdomain.com'];
		callback(null, allowedOrigins.includes(origin));
	},
	credentials: true
});

app.get('/api/conditional', conditionalCors, (req, res) => {
	res.json({
		message: '条件CORS测试',
		userAgent: req.get('User-Agent'),
		origin: req.get('Origin')
	});
});

// ==========================================
// 时间限制的CORS - 基于时间的访问控制
// ==========================================

const timeBasedCors = cors({
	origin: function (origin, callback) {
		const now = new Date();
		const hour = now.getHours();

		// 工作时间允许所有授权源
		if (hour >= 9 && hour <= 17) {
			const workHourOrigins = ['https://yourdomain.com', 'https://app.yourdomain.com'];
			callback(null, workHourOrigins.includes(origin));
		} else {
			// 非工作时间只允许紧急访问
			const emergencyOrigins = ['https://emergency.yourdomain.com'];
			callback(null, emergencyOrigins.includes(origin));
		}
	},
	credentials: true
});

app.get('/api/time-sensitive', timeBasedCors, (req, res) => {
	const now = new Date();
	res.json({
		message: '时间敏感API',
		currentTime: now.toISOString(),
		workingHours: now.getHours() >= 9 && now.getHours() <= 17
	});
});

// ==========================================
// CORS预检请求优化
// ==========================================

// 自定义预检处理
app.options('*', (req, res) => {
	const origin = req.get('Origin');
	const method = req.get('Access-Control-Request-Method');
	const headers = req.get('Access-Control-Request-Headers');

	console.log(`预检请求: ${method} from ${origin}`);
	console.log(`请求头: ${headers}`);

	// 可以在这里添加自定义的预检逻辑
	res.header('Access-Control-Allow-Origin', origin);
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', headers);
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Max-Age', '3600');

	res.status(200).end();
});

// ==========================================
// 错误处理和日志
// ==========================================

// CORS错误处理
app.use((error, req, res, next) => {
	if (error.message.includes('CORS') || error.message.includes('源')) {
		console.log(`CORS错误: ${error.message}`);
		console.log(`请求源: ${req.get('Origin')}`);
		console.log(`请求路径: ${req.path}`);
		console.log(`用户代理: ${req.get('User-Agent')}`);

		res.status(403).json({
			error: 'CORS Policy Violation',
			message: error.message,
			path: req.path,
			origin: req.get('Origin'),
			timestamp: new Date().toISOString()
		});
	} else {
		next(error);
	}
});

const PORT = 3003;
app.listen(PORT, () => {
	console.log(`高级CORS服务器运行在端口 ${PORT}`);
	console.log('\n不同的CORS策略:');
	console.log('  /api/public/*    - 公开访问');
	console.log('  /api/partner/*   - 合作伙伴访问');
	console.log('  /api/internal/*  - 内部访问');
	console.log('  /api/auth/*      - 认证相关');
	console.log('  /api/conditional - 条件访问');
	console.log('  /api/time-sensitive - 时间限制访问');
});

/*
高级CORS配置特性:

1. 路径特定的CORS策略
2. 动态CORS配置
3. 条件CORS（基于用户代理等）
4. 时间限制的CORS
5. 自定义预检处理
6. 详细的错误处理和日志
7. 多级权限控制

测试建议:
1. 使用不同的源测试各个API端点
2. 测试不同时间段的访问
3. 使用不同的用户代理字符串
4. 观察预检请求的处理
5. 验证错误响应的格式
*/