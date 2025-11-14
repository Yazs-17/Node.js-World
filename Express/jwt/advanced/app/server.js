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
function signAccessToken (user) {
	// payload minimal: id + tokenVersion
	return jwt.sign(
		{ userId: user.id, tokenVersion: user.tokenVersion },
		ACCESS_TOKEN_SECRET,
		{ expiresIn: '60s' } // 1 minute
	);
}

function generateRefreshTokenEntry (userId, expiresInDays = 7) {
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

function revokeRefreshId (refreshId) {
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
function authMiddleware (req, res, next) {
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