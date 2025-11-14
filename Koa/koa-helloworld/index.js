require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const jwt = require('koa-jwt');
const path = require('path');

const app = new Koa();

// 全局错误捕获
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		ctx.status = err.status || 500;
		ctx.body = { error: err.message };
	}
});

// 解析 JSON 请求体
app.use(bodyParser());

// 静态资源托管（例如 public/index.html）
app.use(serve(path.join(__dirname, 'public')));

// 先挂载 JWT 中间件，保护后续路由（但保留某些公开路径）
// 支持从 Cookie 或 Authorization 头中获取 token
app.use(jwt({
	secret: process.env.JWT_SECRET,
	getToken: (ctx) => {
		const cookieToken = ctx.cookies.get('token');
		if (cookieToken) return cookieToken;
		const auth = ctx.headers.authorization;
		if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
		return null;
	}
}).unless({
	path: [/^\/$/, /^\/login/, /^\/register/, /^\/logout/, /^\/public/],
}));

// 路由引入
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

// 公共路由（无需认证）
app.use(authRouter.routes()).use(authRouter.allowedMethods());
// 受保护路由（需要 JWT）
app.use(indexRouter.routes()).use(indexRouter.allowedMethods());

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));