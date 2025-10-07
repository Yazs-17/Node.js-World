## Description

会话管理中间件

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

生产环境建议搭配redis存储会话