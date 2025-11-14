module.exports = async (ctx, next) => {
	const token = ctx.headers.authorization?.split(' ')[1];
	if (!token) ctx.throw(401, '未提供 Token');

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET);
		ctx.state.user = user;
		await next();
	} catch (err) {
		ctx.throw(401, 'Token 无效或过期');
	}
};