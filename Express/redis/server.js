const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
// const bodyParser = require("body-parser");
const cors = require("cors");
const redisClient = require("./redis");

const app = express();
const PORT = 3000;

// 允许跨域（前端直连）
app.use(cors({
	origin: true,
	credentials: true
}));

app.use(express.json());
app.use(express.static("public"));

// Redis 存储 session
const store = new RedisStore({ client: redisClient });
app.use(session({
	store,
	secret: "keyboard cat", // 随便换一个安全的密钥
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false, // http 环境必须为 false，https 才设 true
		httpOnly: true,
		maxAge: 1000 * 60 * 10 // 10分钟
	}
}));

// 模拟用户数据
const USERS = {
	admin: "123456",
	test: "abc123"
};

// 登录接口
app.post("/api/login", (req, res) => {
	const { username, password } = req.body;
	if (USERS[username] && USERS[username] === password) {
		req.session.user = { username };
		res.json({ message: "登录成功", user: req.session.user });
	} else {
		res.status(401).json({ message: "用户名或密码错误" });
	}
});

// 检查登录状态
app.get("/api/me", (req, res) => {
	if (req.session.user) {
		res.json({ loggedIn: true, user: req.session.user });
	} else {
		res.json({ loggedIn: false });
	}
});

// 登出接口
app.post("/api/logout", (req, res) => {
	req.session.destroy(() => {
		res.json({ message: "已退出登录" });
	});
});

app.listen(PORT, () => {
	console.log(`🚀 Server running at http://localhost:${PORT}`);
});
