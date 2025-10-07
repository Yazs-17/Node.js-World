## Description

会话管理中间件，比较经典和简易，但不够现代化，

| 场景                   | 方案                  |
| ---------------------- | --------------------- |
| 单机后台（管理页面等） | express-session       |
| 前后端分离+Token鉴权   | JWT                   |
| 分布式部署（多实例）   | express-session+redis |
| 对接第三方登陆         | passport+任意方案     |



> 本demo用 `express-session` 做了一个登陆保持的玩具

```bash
npm install express-session

```

```js
import session from 'express-session';
import express from 'express';

const app = express();

app.use(
  session({
    secret: 'keyboard cat', // 加密 key
    resave: false,          // 若无修改不重新保存
    saveUninitialized: true,// 保存未初始化 session
    cookie: { maxAge: 60000 } // 1 分钟
  })
);

app.get('/', (req, res) => {
  if (!req.session.views) req.session.views = 0;
  req.session.views++;
  res.send(`访问次数：${req.session.views}`);
});

```

`npm install connect-redis ioredis`

生产环境建议搭配redis等存储会话，做持久化
