const Router = require('koa-router');
const router = new Router();

router.get('/', ctx => {
	ctx.body = 'Hello from Koa!';
});

router.get('/protected', ctx => {
	ctx.body = { message: 'You are authorized 🎉', user: ctx.state.user };
});

module.exports = router;