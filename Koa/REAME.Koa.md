### 写在前面

作为一个中间件框架，在其它知识基础上，学好中间件实现方法，就已经学好了一半。

### 类比Express
⸻

 一、Koa 是什么

Koa = 更现代、更轻量的 Express

• 作者：同一批人（Express 团队）
• 特点：
	• 基于 async/await
	• 极简、无内置路由或中间件
	• 适合自定义中间件链式逻辑

⸻

二、初始化项目
```js
mkdir koa-demo && cd koa-demo
npm init -y
npm install koa
```

⸻

三、最小可运行示例

新建 index.js：
```js
const Koa = require('koa');
const app = new Koa();

// ctx = context = 封装的 request + response
app.use(async ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
```
运行：
```
node index.js
```
访问 👉 http://localhost:3000
输出：
```
Hello Koa
```

⸻

四、ctx 结构（Koa 的灵魂）

ctx（上下文）相当于 Express 的 req + res：
```
ctx.request  // 请求相关
ctx.response // 响应相关
ctx.body     // 响应体
ctx.method   // GET / POST
ctx.url      // 请求 URL
ctx.status   // 状态码
ctx.query    // ?a=1
ctx.params   // 路径参数
ctx.request.body // POST 请求体（需解析中间件）
```

⸻

五、中间件机制（洋葱模型 🌰）

Koa 的核心是中间件栈，每个中间件都是一个 async 函数：
```
app.use(async (ctx, next) => {
  console.log('👉 进入中间件1');
  await next(); // 调用下一个中间件
  console.log('👈 返回中间件1');
});

app.use(async (ctx, next) => {
  console.log('👉 进入中间件2');
  await next();
  console.log('👈 返回中间件2');
  ctx.body = 'Done';
});
```
运行顺序：

进入中间件1
进入中间件2
返回中间件2
返回中间件1


⸻

六、路由

Koa 不带路由模块，要装一个：
```
npm install koa-router
```
```
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/', ctx => ctx.body = 'Home');
router.get('/user/:id', ctx => ctx.body = `User ID: ${ctx.params.id}`);
router.post('/login', ctx => ctx.body = 'Login OK');

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
```

⸻

七、解析请求体（POST body）

Koa 默认不会解析 JSON 或表单，需要装中间件：
```
npm install koa-bodyparser
```
```
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

router.post('/login', ctx => {
  const { username, password } = ctx.request.body;
  ctx.body = `Welcome ${username}`;
});
```

⸻

八、静态文件托管
```
npm install koa-static
```
```
const serve = require('koa-static');
app.use(serve(__dirname + '/public'));
```
放一个 public/index.html，访问 http://localhost:3000/index.html 即可。

⸻

九、错误处理
```
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
  }
});
```

⸻

十、组合示例（最小 REST API）
```
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

let users = [{ id: 1, name: 'Alice' }];

router
  .get('/users', ctx => ctx.body = users)
  .post('/users', ctx => {
    const user = { id: Date.now(), ...ctx.request.body };
    users.push(user);
    ctx.body = user;
  });

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => console.log('✅ API on http://localhost:3000'));
```



⸻

十一、推荐中间件清单

需求	包名
body 解析	koa-bodyparser
文件上传	koa-multer / koa-body
静态资源	koa-static
CORS 支持	@koa/cors
JWT 登录认证	koa-jwt
日志输出	koa-logger
模板渲染	koa-views


### Proj demo
**1. koa-helloworld**
```
koa-helloworld/
├── package.json
├── index.js              # 入口文件
├── routes/
│   ├── index.js          # 首页路由
│   └── auth.js           # 登录注册路由
├── middleware/
│   └── auth.js           # JWT 校验中间件
├── public/               # 静态资源目录（前端页面、图片）
│   └── index.html
└── .env                  # 环境变量文件（JWT_SECRET）
```

TODO