// axios-demo.js (frontend examples)
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true; // 关键：使浏览器发送 httpOnly cookies

// login: POST /login -> server sets cookies (jid, at)
export async function login () {
	const r = await axios.post('/login', {
		username: 'john',
		password: '123456'
	});
	console.log('login:', r.data);
}

// call protected: Access token is in httpOnly cookie 'at', sent automatically
export async function callProtected () {
	try {
		const r = await axios.get('/protected');
		console.log('protected:', r.data);
	} catch (err) {
		console.error('protected error', err.response?.status, err.response?.data);
		if (err.response?.data?.msg === 'invalid or expired access token') {
			// try refreshing
			await tryRefreshThenRetry();
		}
	}
}

// try refresh: POST /auth/refresh -> server rotates refresh token and sets new cookies
export async function tryRefreshThenRetry () {
	try {
		const r = await axios.post('/auth/refresh');
		console.log('refresh result', r.data);
		// after refresh, retry protected
		const r2 = await axios.get('/protected');
		console.log('after refresh protected:', r2.data);
	} catch (e) {
		console.error('refresh failed', e.response?.data);
		// show login UI
	}
}

// logout: POST /logout
export async function logout (userId) {
	await axios.post('/logout', { userId }); // optional userId; server may revoke session based on cookie
	// client may also clear local client state (not cookies because they are httpOnly)
	console.log('logged out (client)');
}
// await logout();
// await callProtected();
/* Example sequence in browser:
await login();
await callProtected(); // should succeed
// wait > 60s
await callProtected(); // fails -> tryRefreshThenRetry() -> succeeds if refresh token still valid
await logout();
*/

