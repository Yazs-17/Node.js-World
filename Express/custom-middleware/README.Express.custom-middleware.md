## Description



- 中间件就是一堆方法，接收客户端发来的请求，对请求做出响应
- 中间件由两部分构成，中间件方法由Express提供，负责拦截请求，请求处理函数自己提供，负责处理请求
- 可以对一个请求设置多个中间件，对同一个请求进行多次处理，按代码的顺序“由上到下”依次匹配，匹配成功，终止匹配，可以使用next函数将控制权交给下一个中间件，指定请求处理结束

## Usage

以`json`解析功能为例，下面展示一个自定义的中间件：

```js
function customJsonParser(req, res, next) {
   if (req.headers['content-type'] === 'application/json') {
       let data = '';
       req.on('data', chunk => {
           data += chunk;
       });
       req.on('end', () => {
           try {
               req.body = JSON.parse(data);
               next();
           } catch (error) {
               res.status(400).send('无效的 JSON');
           }
       });
   } else {
       next();
   }
}
const express = require('express');
const app = express();
app.use(customJsonParser);
app.post('/api/data', (req, res) => {
   console.log(req.body);
   res.send('数据已接收');
});
app.listen(3000, () => {
   console.log('服务器运行在 3000 端口');
});
```

## Besides

那么，中间件是如何多个调用的呢，为什么是顺序向下加载呢？答案是`next()`，它控制请求在中间件链中流动，

在express中，一个中间件函数的签名通常是：
`function (req, res, next) { ... }`

最基础示例：
```js
const express = require('express');
const app = express();

// 第一个中间件
app.use((req, res, next) => {
  console.log('1️⃣ 收到请求，进入第一个中间件');
  next(); // 继续向下
});

// 第二个中间件
app.use((req, res, next) => {
  console.log('2️⃣ 进入第二个中间件');
  next();
});

// 路由处理
app.get('/', (req, res) => {
  console.log('3️⃣ 进入路由处理');
  res.send('Hello Express');
});

app.listen(3000, () => console.log('Server running'));

```

**条件控制**

如果你不调用 `next()`，请求就会在这里“停住”，或直接返回，或断开连接

**错误处理**

如果在中间件中出错，可以传入一个参数给 `next()`，Express 会自动跳到错误处理中间件。

```js
app.use((req, res, next) => {
  try {
    throw new Error('出错啦！');
  } catch (err) {
    next(err); // 跳到错误处理
  }
});

// 错误处理中间件必须有 4 个参数
app.use((err, req, res, next) => {
  console.error('捕获错误:', err.message);
  res.status(500).send('服务器错误: ' + err.message);
});

```

**结合路由控制**

```js
const checkAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized');
  }
  next(); // 验证通过继续
};

app.get('/dashboard', checkAuth, (req, res) => {
  res.send('Welcome to Dashboard!');
});

```

