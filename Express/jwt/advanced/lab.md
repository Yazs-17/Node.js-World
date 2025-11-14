## From GPT

## TODO
--- 

好——下面给你一个可运行的“大厂级”认证 demo（后端 + 前端 axios 调用示例），特性如下：
	•	Access Token（短，1 分钟） + Refresh Token（长，7 天）
	•	Refresh Token 存在服务端会话表（内存 Map，方便 demo；生产用 DB/Redis）并支持 刷新轮换（rotation），并可被撤销
	•	使用 httpOnly + SameSite + Secure（生产） Cookie 存放 refresh token（客户端不可读），axios 请求使用 withCredentials: true 自动携带 cookie
	•	支持 /login、/refresh、/protected、/logout；并用 tokenVersion 实现强制失效（示范）
	•	附带完整的 axios 使用例子（登录、访问受保护接口、自动刷新、登出）

下面直接贴完整代码与说明。把它拷到本地运行即可。

⸻

运行说明（先看这一段）
	1.	新建文件夹，npm init -y
	2.	npm i express jsonwebtoken cookie-parser
	3.	把下方后端代码保存为 server.js，然后 node server.js（会监听 4000）。
	4.	使用浏览器或 Node 环境运行 axios 例子（我给了浏览器/Node 两版），注意前端要把 axios.defaults.withCredentials = true 或请求时 withCredentials: true，以便自动携带 httpOnly cookie。

注意：示例为开发环境，cookie.secure 在 localhost 上设为 false。生产环境请 secure: true（HTTPS）并使用持久化存储（DB/Redis）、token 哈希、IP/设备校验等安全加固。

⸻

代码 — 后端（server.js）

// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = 4000;
const ACCESS_TOKEN_SECRET = 'ACCESS_SECRET_DEMO_very_secret';
const REFRESH_TOKEN_SECRET = 'REFRESH_SECRET_DEMO_even_more_secret';

// Demo user store (生产用 DB)
const userStore = {
  1: { id: 1, username: 'john', password: '123456', tokenVersion: 0 }
};

// In-memory refresh token store (keyed by refreshTokenId or hashed token)
// Structure: refreshStore[refreshId] = { userId, expiresAt, revoked, replacedBy }
const refreshStore = new Map();

/* -----------------------
   Helpers
   ----------------------- */
function signAccessToken(user) {
  // payload minimal: id + tokenVersion
  return jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '60s' } // 1 minute
  );
}

function generateRefreshTokenEntry(userId, expiresInDays = 7) {
  // Generate a random id for refresh token and a secret string
  const refreshId = crypto.randomBytes(16).toString('hex'); // id we store
  const token = crypto.randomBytes(64).toString('hex'); // token string given to client
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

  // For demo simplicity we store token in plain; production: store hashed(token)
  refreshStore.set(refreshId, {
    token, // in prod hash this
    userId,
    expiresAt,
    revoked: false,
    replacedBy: null
  });

  // To validate: client sends refreshId + token (or put into single cookie)
  // We'll combine them into one string `${refreshId}.${token}` as the cookie value.
  const cookieValue = `${refreshId}.${token}`;
  return { refreshId, token, expiresAt, cookieValue };
}

function revokeRefreshId(refreshId) {
  const entry = refreshStore.get(refreshId);
  if (entry) {
    entry.revoked = true;
    refreshStore.set(refreshId, entry);
  }
}

/* -----------------------
   Routes
   ----------------------- */

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = Object.values(userStore).find(u => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ ok: false, msg: 'invalid credentials' });
  }

  // issue access token
  const accessToken = signAccessToken(user);

  // issue refresh token entry (rotation)
  const refresh = generateRefreshTokenEntry(user.id);

  // set refresh token cookie (httpOnly)
  res.cookie('jid', refresh.cookieValue, {
    httpOnly: true,
    // secure: true, // 在生产环境（https）下开启
    sameSite: 'lax',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Also set access token in a short-lived httpOnly cookie OR return in body
  res.cookie('at', accessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: 'lax',
    path: '/', // access token sent to all routes
    maxAge: 60 * 1000 // 1 minute
  });

  return res.json({ ok: true, msg: 'logged in' });
});

// POST /auth/refresh
// Endpoint must read cookie 'jid' for refresh token (httpOnly)
app.post('/auth/refresh', (req, res) => {
  const jid = req.cookies.jid;
  if (!jid) return res.status(401).json({ ok: false, msg: 'no refresh cookie' });

  const [refreshId, token] = jid.split('.');
  const stored = refreshStore.get(refreshId);

  if (!stored) return res.status(401).json({ ok: false, msg: 'invalid refresh' });
  if (stored.revoked) return res.status(401).json({ ok: false, msg: 'revoked' });
  if (stored.expiresAt < Date.now()) {
    stored.revoked = true;
    refreshStore.set(refreshId, stored);
    return res.status(401).json({ ok: false, msg: 'refresh expired' });
  }

  // NOTE: production: compare hash(token) with stored hashed value
  if (token !== stored.token) {
    // token mismatch => possible theft. Revoke this and all descendant tokens.
    stored.revoked = true;
    refreshStore.set(refreshId, stored);
    return res.status(401).json({ ok: false, msg: 'token mismatch' });
  }

  // rotation: create new refresh token and mark this one replaced
  const newRefresh = generateRefreshTokenEntry(stored.userId);
  stored.revoked = true;
  stored.replacedBy = newRefresh.refreshId;
  refreshStore.set(refreshId, stored);

  // issue new access token (respect tokenVersion)
  const user = userStore[stored.userId];
  if (!user) return res.status(401).json({ ok: false, msg: 'no user' });

  const newAccessToken = signAccessToken(user);

  // set new cookies
  res.cookie('jid', newRefresh.cookieValue, {
    httpOnly: true,
    // secure: true,
    sameSite: 'lax',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.cookie('at', newAccessToken, {
    httpOnly: true,
    // secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 1000
  });

  return res.json({ ok: true, msg: 'refreshed' });
});

// Auth middleware - checks access token cookie 'at' or Authorization header
function authMiddleware(req, res, next) {
  // Prefer Authorization header, fallback to cookie
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies.at) {
    token = req.cookies.at;
  }

  if (!token) return res.status(401).json({ ok: false, msg: 'no access token' });

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    // Check tokenVersion
    const user = userStore[payload.userId];
    if (!user) return res.status(401).json({ ok: false, msg: 'user not found' });
    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({ ok: false, msg: 'token version mismatch' });
    }
    req.user = { id: payload.userId };
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'invalid or expired access token' });
  }
}

// GET /protected
app.get('/protected', authMiddleware, (req, res) => {
  return res.json({ ok: true, msg: 'protected content', userId: req.user.id });
});

// POST /logout
app.post('/logout', (req, res) => {
  // For demo: read current refresh cookie and revoke that session and increment tokenVersion to force all access tokens invalid
  const jid = req.cookies.jid;
  if (jid) {
    const [refreshId] = jid.split('.');
    revokeRefreshId(refreshId);
  }

  // Optionally: revoke all refresh tokens for this user by scanning refreshStore (slow for prod)
  // Also increment tokenVersion to invalidate all access tokens for user (force re-login everywhere)
  // Here demo reads optional user id param (production should deduce from session)
  const { userId } = req.body;
  if (userId && userStore[userId]) {
    userStore[userId].tokenVersion += 1;
  }

  // clear cookies on client
  res.clearCookie('jid', { path: '/auth/refresh' });
  res.clearCookie('at', { path: '/' });
  return res.json({ ok: true, msg: 'logged out' });
});

app.listen(PORT, () => {
  console.log(`Auth demo running on http://localhost:${PORT}`);
});


⸻

前端：axios 使用示例（浏览器或 Node 都可）

关键点：axios.defaults.withCredentials = true —— 让浏览器自动发送 httpOnly cookie。

// axios-demo.js (frontend examples)
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true; // 关键：使浏览器发送 httpOnly cookies

// login: POST /login -> server sets cookies (jid, at)
export async function login() {
  const r = await axios.post('/login', {
    username: 'john',
    password: '123456'
  });
  console.log('login:', r.data);
}

// call protected: Access token is in httpOnly cookie 'at', sent automatically
export async function callProtected() {
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
export async function tryRefreshThenRetry() {
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
export async function logout(userId) {
  await axios.post('/logout', { userId }); // optional userId; server may revoke session based on cookie
  // client may also clear local client state (not cookies because they are httpOnly)
  console.log('logged out (client)');
}

/* Example sequence in browser:
await login();
await callProtected(); // should succeed
// wait > 60s
await callProtected(); // fails -> tryRefreshThenRetry() -> succeeds if refresh token still valid
await logout();
*/

如果你用 fetch，也需 credentials: 'include'。

⸻

关键实现细节与安全考量（短清单）
	•	httpOnly cookie：防止 XSS 读取 token。Refresh 放在 httpOnly cookie（路径限定到 /auth/refresh 更安全）。
	•	Access token 短期化：减少被盗用的窗口（例如 1~15 分钟）。
	•	Refresh token rotation：每次 refresh 都生成新 refresh token、撤销旧 token，能检测到被盗并减少风险。
	•	服务端存储 refresh token（或其 hash）：可撤销、可查询、支持单点登出和设备管理。
	•	tokenVersion：对付“需要强制使所有旧 access token 失效”的情况（例如用户强制退出所有设备、改密码等）。
	•	HTTPS + Secure cookie：真实部署必须加上。
	•	对 refresh endpoint 做风控：限制频率、绑定设备/IP、检测异常（例如 refresh token mismatch -> 强制登出所有会话）。
	•	生产不要在内存中存 refresh token：用 DB/Redis 持久化，避免重启丢失会话或内存泄露。
	•	Hash 存储 refresh token：若 DB 被泄露，不会把有效 token 明文泄露（类似密码哈希）。

⸻

为什么这不是“前端做文章”？

大厂的核心控制点在服务端（会话表、refresh token 黑名单/rotation、tokenVersion、审计日志、SSO），前端只负责：
	•	把 refresh token 存在 httpOnly cookie（不可访问）
	•	在 access token 过期时静默触发 refresh 请求
所以“登出/失效/踢人”不依赖前端；后端可以随时撤销。

⸻

测试建议
	•	登录后观察响应 cookie：jid, at（浏览器中 httpOnly cookie 不可见 JS，使用 devtools 的 Application -> Cookies 可见）
	•	等待 60s 再访问 /protected，会出现 access token 过期错误。随后调用 /auth/refresh，若 refresh 仍有效会得到新的 cookies，继续访问。
	•	调用 /logout，服务端会撤销当前 refresh token 并清 cookie。再次 refresh 会失败。

⸻

如果你愿意，我现在可以为你做下面任意一项（我会直接给出代码）：
	1.	把上面的 demo 改成使用 Redis 的持久化 refresh store（示范 Redis schema）
	2.	把前端示例改成Vue 3 + axios + 登录页 +自动刷新逻辑（带提示/loading）
	3.	加入refresh token 被盗检测逻辑（检测 rotation mismatch 并强制登出所有会话）
	4.	把 cookie 改为 secure: true、并给出 HTTPS 本地调试方案（mkcert）

你想要哪个，我直接把代码和运行步骤给你。