const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session 中间件配置
app.use(session({
	secret: 'keyboard cat', // 用于签名session id的密钥，建议随机字符串
	resave: false,					// 每次请求是否强制保存session，false为了减少IO
	saveUninitialized: false,// 未修改session是否也保存，false，节省空间
	cookie: {
		maxAge: 1000 * 60 * 10, // 10分钟有效
		httpOnly: true //禁止前端JS访问cookie
	}
}));

// 静态文件 (前端页面)
app.use(express.static(path.join(__dirname, 'public')));

// 登录接口
app.post('/login', (req, res) => {
	const { username, password } = req.body;
	console.log('Login attempt:', username, password);

	// 模拟数据库验证
	if (username === 'admin' && password === '123456') {
		req.session.isLogin = true;
		req.session.user = { username };
		return res.json({ message: '登录成功', user: req.session.user });
	}

	res.status(401).json({ message: '用户名或密码错误' });
});

// 获取登录状态
app.get('/profile', (req, res) => {
	if (req.session.isLogin) {
		return res.json({
			message: '已登录',
			user: req.session.user
		});
	}
	res.status(401).json({ message: '未登录' });
});

// 登出接口
app.post('/logout', (req, res) => {
	req.session.destroy(() => res.json({ message: '已退出登录' }));
});

// 启动服务
app.listen(3000, () => {
	console.log('✅ Server running at http://localhost:3000');
});
