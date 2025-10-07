## Description

`compression` 是 Express 官方推荐的 **HTTP 响应压缩中间件**，
 可以显著减小前端接收到的资源体积、提高加载速度, 它使用 **gzip / deflate / br（Brotli）** 等压缩算法自动压缩你的 Express 响应内容（如 JSON、HTML、CSS、JS）

> [!note]
>
> 压缩会占用CPU，建议，也确实只需对较大的响应开启,
>
> 此外，Nginx 或 CDN 通常也会自动压缩文件；如果那层已压缩，可关闭 Express 压缩，
>
> 在具体使用的时候，一般建议在 `express.json()` 后、`static` 前使用 compression，即：
>
> ```js
> app.use(cors());
> app.use(express.json());
> app.use(compression());
> app.use(express.static('public'))
> ```

## Usage & Installation

- 返回JSON，作为API接口时可用
- 静态文件（HTML/CSS/JS）,如果使用`express.static()`, 建议使用compression
- SSR内容（服务器渲染HTML）

just: `npm i compression`

template:
```js
const express = require('express');
const compression = require('compression');

const app = express();

// 启用压缩中间件
app.use(compression());

// 示例接口
app.get('/api/data', (req, res) => {
  const largeData = { message: 'hello', list: Array(10000).fill('data') };
  res.json(largeData);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

```

效果：浏览器会自动在请求头中声明支持的压缩算法:

```js
Accept-Encoding: gzip, deflate, br
```

服务端自动压缩响应，并添加响应头：`Content-Encoding: gzip`,从而使响应体更小，传输更快

## Advanced Config

```js
app.use(
  compression({
    level: 6, // 压缩级别：0（无压缩）~9（最高压缩，最慢）
    threshold: 1024, // 仅压缩大于1KB的响应，设置阈值可避免压缩极小响应浪费 CPU
    filter: (req, res) => {
      // 自定义哪些响应需要压缩
      if (req.headers['x-no-compression']) {
        // 如果请求头中带这个字段，则不压缩
        return false;
      }
      return compression.filter(req, res); // 默认过滤规则
    },
  })
);

```

## Other Demo

```js
const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();

// 启用 gzip 压缩
app.use(
  compression({
    threshold: 1024, // 只压缩超过 1KB 的响应
  })
);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 模拟大 JSON 响应
app.get('/data', (req, res) => {
  const data = Array(10000).fill('😀').join('');
  res.send(data);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

```

