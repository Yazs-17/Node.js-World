// examples/basic-cors.js
// 最基本的CORS配置示例

const express = require('express');
const cors = require('cors');
const app = express();

// ==========================================
// 场景1: 开发环境 - 允许所有源
// ==========================================

console.log('基础CORS示例 - 开发环境配置');

// 最简单的CORS配置（仅适用于开发环境）
app.use(cors()); // 等同于 cors({origin: "*"})

// 或者更明确的写法
// app.use(cors({
//   origin: "*", // 允许所有源
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 默认允许的方法
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));

app.use(express.json());

// 测试路由
app.get('/api/test', (req, res) => {
	console.log(`请求来源: ${req.get('Origin') || '未知'}`);
	res.json({
		message: '基础CORS测试成功',
		origin: req.get('Origin'),
		timestamp: new Date().toISOString()
	});
});

app.post('/api/data', (req, res) => {
	console.log('POST请求数据:', req.body);
	res.json({
		message: '数据接收成功',
		received: req.body,
		origin: req.get('Origin')
	});
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`基础CORS服务器运行在 http://localhost:${PORT}`);
	console.log('⚠️  注意: 此配置仅适用于开发环境！');
	console.log('生产环境请使用更严格的CORS配置');
});

/* 
测试方法:
1. 运行此服务器: node examples/basic-cors.js
2. 在浏览器中打开不同端口的页面
3. 发送AJAX请求到 http://localhost:3001/api/test
4. 观察CORS头信息

预期结果:
- 所有源的请求都会被允许
- 响应头会包含: Access-Control-Allow-Origin: *
*/