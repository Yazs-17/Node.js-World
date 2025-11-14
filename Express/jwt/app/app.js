const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()

app.use(express.json()) // 不加这个 req.body 是 undefined

const secretKey = "very_secret_key"

// 模拟用户
const user = {
	id: 1,
	username: 'john',
	password: '123456'
}

/**
 * 登录
 */
app.post('/login', (req, res) => {
	const { username, password } = req.body

	if (username === user.username && password === user.password) {
		// 生成 JWT，设置 1 m过期
		const token = jwt.sign(
			{ id: user.id, username: user.username },
			secretKey,
			{ expiresIn: '1m' }
		)
		return res.json({ msg: 'login success', token })
	}

	return res.status(401).json({ msg: 'username or password incorrect' })
})

/**
 * JWT 鉴权中间件
 */
const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization
	if (!authHeader) return res.sendStatus(401)

	const token = authHeader.split(' ')[1] // Bearer xxx
	jwt.verify(token, secretKey, (err, decodedUser) => {
		if (err) {
			console.log(err)
			return res.sendStatus(403)
		}
		req.user = decodedUser
		next()
	})
}

/**
 * 受保护接口
 */
app.get('/protected', authenticateJWT, (req, res) => {
	return res.json({
		message: "yes bro, you are authed",
		user: req.user
	})
})

/**
 * 登出逻辑
 * JWT 无法在服务端强行失效，所以登出动作只清除前端存储的 token。
 * 服务端可以记录 blacklist 来实现强制失效（可选）
 */
app.post('/logout', (req, res) => {
	return res.json({ msg: "logout success, please delete token in client" })
})

app.listen(3000, () => {
	console.log("server is running on port 3000")
})