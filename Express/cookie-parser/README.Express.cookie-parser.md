## Description

`npm install cookie-parser`

cookie解析中间件

```js
import cookieParser from 'cookie-parser';
import express from 'express';

const app = express();

// 解析 Cookie
app.use(cookieParser('your_secret_key')); // 可选签名密钥

app.get('/', (req, res) => {
  console.log(req.cookies); // 普通 cookie
  console.log(req.signedCookies); // 签名 cookie
  res.cookie('user', 'yazs', { httpOnly: true, maxAge: 3600000 });
  res.send('Cookie set');
});

```

