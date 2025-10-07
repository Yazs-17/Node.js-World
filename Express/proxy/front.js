const axios = require('axios');

async function testProxy () {
	const baseURL = 'http://localhost:3000';

	try {
		// 测试 POST 请求
		console.log('1. 测试 POST 请求到根路径:');
		const postResponse = await axios.post(baseURL + '/', {
			name: '测试用户',
			email: 'test@example.com',
			data: { nested: '对象数据' }
		});
		console.log('POST 响应:', postResponse.data);
		console.log('---');

		// 测试创建用户
		console.log('2. 测试创建用户:');
		const userResponse = await axios.post(baseURL + '/api/users', {
			name: '王五',
			age: 25,
			profession: '工程师'
		});
		console.log('用户创建响应:', userResponse.data);
		console.log('---');

		// 测试 GET 请求
		console.log('3. 测试 GET 请求:');
		const getResponse = await axios.get(baseURL + '/api/users');
		console.log('GET 响应:', getResponse.data);

	} catch (error) {
		console.error('测试错误:', error.response?.data || error.message);
	}
}

testProxy();