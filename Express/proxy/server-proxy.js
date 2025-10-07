const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3001;

app.post('/', (req, res) => {
	console.log('目标服务器收到请求:', req.body);
	res.json({
		message: '请求成功',
		receivedData: req.body,
		timestamp: new Date().toISOString()
	});
});

// 添加其他路由用于测试
app.post('/api/users', (req, res) => {
	console.log('创建用户:', req.body);
	res.json({
		id: Date.now(),
		...req.body,
		created: new Date().toISOString()
	});
});

app.get('/api/users', (req, res) => {
	res.json({
		users: [
			{ id: 1, name: '张三' },
			{ id: 2, name: '李四' }
		]
	});
});

app.listen(PORT, () => {
	console.log(`目标服务器运行在端口 ${PORT}`);
});