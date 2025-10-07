const express = require('express');
const proxy = require('express-http-proxy');
const app = express();

const PORT = 3000;
app.use(express.json());

// 配置代理中间件
app.use('/', proxy('http://localhost:3001', {
	// JSON 处理相关配置
	parseReqBody: true, // 解析请求体

	// 请求拦截器 - 在转发前处理请求
	proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
		console.log('代理请求头:', proxyReqOpts.headers);
		console.log('原始请求方法:', srcReq.method);
		return proxyReqOpts;
	},

	// 请求体拦截器 - 可以修改请求体
	proxyReqBodyDecorator: (bodyContent, srcReq) => {
		console.log('原始请求体:', bodyContent);
		// 可以在这里添加额外的数据
		if (bodyContent && typeof bodyContent === 'object') {
			bodyContent.proxied = true;
			bodyContent.proxyTimestamp = new Date().toISOString();
		}
		return bodyContent;
	},

	// 响应处理
	userResHeaderDecorator: (headers, userReq, userRes, proxyReq, proxyRes) => {
		console.log('目标服务器响应状态:', proxyRes.statusCode);
		headers['x-proxy-by'] = 'express-http-proxy';
		return headers;
	},

	// 响应内容处理
	userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
		try {
			const data = JSON.parse(proxyResData.toString('utf8'));
			console.log('目标服务器响应数据:', data);

			// 添加代理信息到响应中
			if (data && typeof data === 'object') {
				data.proxyInfo = {
					proxyServer: 'localhost:3000',
					targetServer: 'localhost:3001',
					processingTime: new Date().toISOString()
				};
			}

			return JSON.stringify(data);
		} catch (error) {
			console.error('JSON 解析错误:', error);
			return proxyResData;
		}
	},

	// 超时设置
	timeout: 30000,

	// 错误处理
	proxyErrorHandler: (err, res, next) => {
		console.error('代理错误:', err);
		res.status(500).json({
			error: '代理服务器错误',
			message: err.message
		});
	}
}));

// 健康检查端点
app.get('/health', (req, res) => {
	res.json({ status: '代理服务器运行正常', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
	console.log(`代理服务器运行在端口 ${PORT}`);
	console.log(`将请求转发到: http://localhost:3001`);
});