const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const router = new Router();

const users = [{ username: 'admin', password: '123456' }]; // 模拟用户数据库

router.post('/login', ctx => {
	const { username, password } = ctx.request.body;
	const user = users.find(u => u.username === username && u.password === password);
	if (!user) {
		ctx.throw(401, '用户名或密码错误');
	}
	// 1 分钟过期
	const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '60s' });
	// 将 token 写入 HttpOnly Cookie，模拟网站登录态
	ctx.cookies.set('token', token, {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 1000, // 1 min
	});
	ctx.body = { message: '登录成功', token };
});

router.post('/register', ctx => {
	const { username, password } = ctx.request.body;
	if (users.find(u => u.username === username)) {
		ctx.throw(400, '用户已存在');
	}
	users.push({ username, password });
	ctx.body = { message: '注册成功' };
});

// 退出登录：清除 Cookie（演示用）
router.post('/logout', ctx => {
	ctx.cookies.set('token', null, { httpOnly: true, expires: new Date(0) });
	ctx.body = { message: '已退出登录' };
});

module.exports = router;