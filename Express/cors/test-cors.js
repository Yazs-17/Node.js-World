// test-cors.js
// CORS功能测试脚本

const https = require('https');
const http = require('http');

console.log('🧪 Express CORS 测试脚本启动\n');

// 测试配置
const TEST_CONFIG = {
	server: 'http://localhost:3000',
	testOrigins: [
		'http://localhost:8080',
		'https://yourdomain.com',
		'http://unauthorized-domain.com',
		null // 服务器到服务器请求
	],
	endpoints: [
		'/api/public',
		'/api/restricted',
		'/api/simple',
		'/api/complex',
		'/api/protected'
	]
};

// 颜色输出工具
const colors = {
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	reset: '\x1b[0m',
	bright: '\x1b[1m'
};

function colorLog (color, message) {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求工具
function makeRequest (options) {
	return new Promise((resolve, reject) => {
		const protocol = options.protocol === 'https:' ? https : http;

		const req = protocol.request(options, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				resolve({
					statusCode: res.statusCode,
					headers: res.headers,
					data: data
				});
			});
		});

		req.on('error', (error) => {
			resolve({
				error: error.message,
				statusCode: 0
			});
		});

		if (options.body) {
			req.write(options.body);
		}

		req.end();
	});
}

// 测试用例类
class CORSTest {
	constructor(name, description) {
		this.name = name;
		this.description = description;
		this.results = [];
	}

	async run () {
		colorLog('blue', `\n📋 运行测试: ${this.name}`);
		console.log(`   描述: ${this.description}\n`);

		const startTime = Date.now();
		await this.execute();
		const endTime = Date.now();

		this.printResults();
		console.log(`   ⏱️  耗时: ${endTime - startTime}ms\n`);
	}

	addResult (test, success, message, details = {}) {
		this.results.push({
			test,
			success,
			message,
			details,
			timestamp: new Date().toISOString()
		});
	}

	printResults () {
		const passed = this.results.filter(r => r.success).length;
		const total = this.results.length;

		colorLog(passed === total ? 'green' : 'yellow',
			`   📊 结果: ${passed}/${total} 通过`);

		this.results.forEach(result => {
			const icon = result.success ? '✅' : '❌';
			const color = result.success ? 'green' : 'red';

			colorLog(color, `   ${icon} ${result.test}: ${result.message}`);

			if (result.details && Object.keys(result.details).length > 0) {
				Object.entries(result.details).forEach(([key, value]) => {
					console.log(`      ${key}: ${value}`);
				});
			}
		});
	}
}

// 基本CORS测试
class BasicCORSTest extends CORSTest {
	constructor() {
		super('基本CORS功能', '测试基本的CORS请求和响应头');
	}

	async execute () {
		for (const endpoint of TEST_CONFIG.endpoints) {
			const url = new URL(endpoint, TEST_CONFIG.server);

			const options = {
				hostname: url.hostname,
				port: url.port,
				path: url.pathname,
				method: 'GET',
				headers: {
					'Origin': 'http://localhost:8080'
				}
			};

			const response = await makeRequest(options);

			if (response.error) {
				this.addResult(
					`GET ${endpoint}`,
					false,
					`请求失败: ${response.error}`
				);
				continue;
			}

			const corsHeader = response.headers['access-control-allow-origin'];
			const success = response.statusCode < 400 && corsHeader;

			this.addResult(
				`GET ${endpoint}`,
				success,
				success ? '支持CORS' : 'CORS配置问题',
				{
					'状态码': response.statusCode,
					'CORS头': corsHeader || '未设置',
					'允许凭据': response.headers['access-control-allow-credentials'] || '未设置'
				}
			);
		}
	}
}

// 预检请求测试
class PreflightTest extends CORSTest {
	constructor() {
		super('预检请求测试', '测试复杂请求的OPTIONS预检');
	}

	async execute () {
		const url = new URL('/api/complex', TEST_CONFIG.server);

		const options = {
			hostname: url.hostname,
			port: url.port,
			path: url.pathname,
			method: 'OPTIONS',
			headers: {
				'Origin': 'http://localhost:8080',
				'Access-Control-Request-Method': 'POST',
				'Access-Control-Request-Headers': 'Content-Type, Authorization'
			}
		};

		const response = await makeRequest(options);

		const allowMethods = response.headers['access-control-allow-methods'];
		const allowHeaders = response.headers['access-control-allow-headers'];
		const maxAge = response.headers['access-control-max-age'];

		const success = response.statusCode === 200 || response.statusCode === 204;

		this.addResult(
			'OPTIONS预检请求',
			success,
			success ? '预检请求成功' : '预检请求失败',
			{
				'状态码': response.statusCode,
				'允许方法': allowMethods || '未设置',
				'允许头': allowHeaders || '未设置',
				'缓存时间': maxAge || '未设置'
			}
		);
	}
}

// 源验证测试
class OriginValidationTest extends CORSTest {
	constructor() {
		super('源验证测试', '测试不同源的访问权限');
	}

	async execute () {
		for (const origin of TEST_CONFIG.testOrigins) {
			const url = new URL('/api/simple', TEST_CONFIG.server);

			const options = {
				hostname: url.hostname,
				port: url.port,
				path: url.pathname,
				method: 'GET',
				headers: {}
			};

			if (origin) {
				options.headers['Origin'] = origin;
			}

			const response = await makeRequest(options);

			const originName = origin || '无Origin';
			const corsHeader = response.headers['access-control-allow-origin'];

			let expectedResult;
			if (!origin || origin.includes('localhost') || origin.includes('yourdomain.com')) {
				expectedResult = true; // 应该被允许
			} else {
				expectedResult = false; // 应该被拒绝
			}

			const actualResult = response.statusCode < 400;
			const success = expectedResult === actualResult;

			this.addResult(
				`源: ${originName}`,
				success,
				success ? '符合预期' : '与预期不符',
				{
					'预期': expectedResult ? '允许' : '拒绝',
					'实际': actualResult ? '允许' : '拒绝',
					'状态码': response.statusCode,
					'CORS头': corsHeader || '未设置'
				}
			);
		}
	}
}

// 凭据测试
class CredentialsTest extends CORSTest {
	constructor() {
		super('凭据传递测试', '测试cookies和认证信息的传递');
	}

	async execute () {
		const url = new URL('/api/protected', TEST_CONFIG.server);

		// 测试带凭据的请求
		const options = {
			hostname: url.hostname,
			port: url.port,
			path: url.pathname,
			method: 'GET',
			headers: {
				'Origin': 'http://localhost:8080',
				'Authorization': 'Bearer test-token',
				'Cookie': 'sessionId=test123'
			}
		};

		const response = await makeRequest(options);

		const allowCredentials = response.headers['access-control-allow-credentials'];
		const success = allowCredentials === 'true';

		this.addResult(
			'凭据支持检测',
			success,
			success ? '支持凭据传递' : '不支持凭据传递',
			{
				'状态码': response.statusCode,
				'允许凭据': allowCredentials || '未设置'
			}
		);
	}
}

// 方法测试
class MethodTest extends CORSTest {
	constructor() {
		super('HTTP方法测试', '测试不同HTTP方法的CORS支持');
	}

	async execute () {
		const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

		for (const method of methods) {
			const url = new URL('/api/complex', TEST_CONFIG.server);

			const options = {
				hostname: url.hostname,
				port: url.port,
				path: url.pathname,
				method: method,
				headers: {
					'Origin': 'http://localhost:8080',
					'Content-Type': 'application/json'
				}
			};

			if (['POST', 'PUT', 'PATCH'].includes(method)) {
				options.body = JSON.stringify({ test: true });
				options.headers['Content-Length'] = Buffer.byteLength(options.body);
			}

			const response = await makeRequest(options);

			const success = response.statusCode < 500; // 允许404，但不允许500

			this.addResult(
				`${method}方法`,
				success,
				success ? '请求成功' : '请求失败',
				{
					'状态码': response.statusCode
				}
			);
		}
	}
}

// 性能测试
class PerformanceTest extends CORSTest {
	constructor() {
		super('CORS性能测试', '测试CORS处理的性能影响');
	}

	async execute () {
		const requestCount = 10;
		const url = new URL('/api/simple', TEST_CONFIG.server);

		const options = {
			hostname: url.hostname,
			port: url.port,
			path: url.pathname,
			method: 'GET',
			headers: {
				'Origin': 'http://localhost:8080'
			}
		};

		// 并发请求测试
		const startTime = Date.now();
		const promises = Array(requestCount).fill().map(() => makeRequest(options));
		const responses = await Promise.all(promises);
		const endTime = Date.now();

		const totalTime = endTime - startTime;
		const avgTime = totalTime / requestCount;
		const successCount = responses.filter(r => r.statusCode === 200).length;

		this.addResult(
			`${requestCount}个并发请求`,
			successCount === requestCount,
			`${successCount}/${requestCount} 成功`,
			{
				'总耗时': `${totalTime}ms`,
				'平均耗时': `${avgTime.toFixed(2)}ms`,
				'请求速率': `${(requestCount / totalTime * 1000).toFixed(2)} req/s`
			}
		);
	}
}

// 主测试运行器
async function runAllTests () {
	colorLog('bright', '🚀 开始CORS测试套件');
	console.log(`目标服务器: ${TEST_CONFIG.server}\n`);

	const tests = [
		new BasicCORSTest(),
		new PreflightTest(),
		new OriginValidationTest(),
		new CredentialsTest(),
		new MethodTest(),
		new PerformanceTest()
	];

	const startTime = Date.now();

	for (const test of tests) {
		try {
			await test.run();
		} catch (error) {
			colorLog('red', `❌ 测试 "${test.name}" 运行失败: ${error.message}`);
		}
	}

	const endTime = Date.now();
	const totalTime = endTime - startTime;

	// 计算总体统计
	let totalTests = 0;
	let totalPassed = 0;

	tests.forEach(test => {
		totalTests += test.results.length;
		totalPassed += test.results.filter(r => r.success).length;
	});

	colorLog('bright', '\n📊 测试总结');
	console.log(`   总测试数: ${totalTests}`);
	console.log(`   通过数量: ${totalPassed}`);
	console.log(`   失败数量: ${totalTests - totalPassed}`);
	console.log(`   成功率: ${(totalPassed / totalTests * 100).toFixed(2)}%`);
	console.log(`   总耗时: ${totalTime}ms`);

	if (totalPassed === totalTests) {
		colorLog('green', '\n🎉 所有测试通过！CORS配置正常工作。');
	} else {
		colorLog('yellow', '\n⚠️  部分测试失败，请检查CORS配置。');
	}
}

// 如果作为主模块运行，则执行测试
if (require.main === module) {
	// 检查服务器是否运行
	const url = new URL(TEST_CONFIG.server);
	const checkOptions = {
		hostname: url.hostname,
		port: url.port,
		path: '/health',
		method: 'GET',
		timeout: 5000
	};

	makeRequest(checkOptions).then(response => {
		if (response.statusCode === 200 || response.statusCode === 404) {
			runAllTests();
		} else {
			colorLog('red', `❌ 无法连接到测试服务器 ${TEST_CONFIG.server}`);
			console.log('请确保服务器正在运行：npm start');
			process.exit(1);
		}
	}).catch(error => {
		colorLog('red', `❌ 服务器连接失败: ${error.message}`);
		console.log('请确保服务器正在运行：npm start');
		process.exit(1);
	});
}

module.exports = {
	CORSTest,
	BasicCORSTest,
	PreflightTest,
	OriginValidationTest,
	CredentialsTest,
	MethodTest,
	PerformanceTest,
	runAllTests
};