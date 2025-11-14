// 演示：使用 Cookie Jar 持久化登录态（像浏览器一样）
const axios = require('axios').default;
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3001';
const JAR_FILE = path.join(__dirname, 'cookie-jar.json');

function loadJar () {
	const jar = new CookieJar();
	if (fs.existsSync(JAR_FILE)) {
		try {
			const json = JSON.parse(fs.readFileSync(JAR_FILE, 'utf8'));
			jar.restoreSync(json);
		} catch {}
	}
	return jar;
}

function saveJar (jar) {
	const json = jar.serializeSync();
	fs.writeFileSync(JAR_FILE, JSON.stringify(json, null, 2));
}

async function demo () {
	const jar = loadJar();
	const client = wrapper(axios.create({ baseURL: BASE, jar, withCredentials: true }));

	try {
		// 1) 访问受保护路由（未登录时应 401）
		console.log('\n[STEP] 未登录访问 /protected');
		await client.get('/protected');
	} catch (err) {
		console.log('预期未登录，状态码:', err?.response?.status, err?.response?.data);
	}

	// 2) 登录（服务器会通过 Set-Cookie 写入 HttpOnly token）
	console.log('\n[STEP] 调用 /login 登录');
	const loginRes = await client.post('/login', { username: 'admin', password: '123456' });
	console.log('登录响应:', loginRes.data);
	saveJar(jar);

	// 3) 登录后访问受保护路由（应成功）
	console.log('\n[STEP] 已登录访问 /protected');
	const protectedRes = await client.get('/protected');
	console.log('受保护响应:', protectedRes.data);

	// 4) 等待 70 秒后访问（应过期）
	console.log('\n[STEP] 等待 70 秒以观察过期行为...');
	await new Promise(r => setTimeout(r, 70_000));
	try {
		await client.get('/protected');
		console.log('未预期：仍然可访问（请检查服务端时间设置）');
	} catch (err) {
		console.log('预期已过期，状态码:', err?.response?.status, err?.response?.data);
	}

	// 5) 重新登录并立即退出
	console.log('\n[STEP] 重新登录');
	await client.post('/login', { username: 'admin', password: '123456' });
	saveJar(jar);
	console.log('[STEP] 手动退出 /logout');
	const logoutRes = await client.post('/logout');
	console.log('退出响应:', logoutRes.data);
	saveJar(jar);

	// 6) 退出后访问受保护路由（应 401）
	try {
		await client.get('/protected');
	} catch (err) {
		console.log('预期已退出，状态码:', err?.response?.status, err?.response?.data);
	}
}

demo().catch(e => {
	console.error('Demo 发生错误:', e?.response?.data || e.message);
});