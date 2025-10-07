## Description

HTTP 请求日志中间件。

可以在开发或者生产环境中方便记录请求信息（如 method、url、状态码、耗时等）

> [!note]
>
> 建议将该插件放在所有中间件依赖的最后，

## Function

- 记录每个请求的访问日志；

- 支持多种日志格式（==开发/生产模式==不同），建议与dotenv结合
  ```js
  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
  ```

  

- 可与 `fs`（文件系统）结合写入日志文件，默认写到控制台，可配置到文件；

- 可自定义日志内容与输出方式。

## Usage

```js
const express = require('express');
const morgan = require('morgan');

const app = express();

// 使用 morgan 中间件（开发模式下）
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello, Morgan!');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

```

visit `http://localhost:3000/` ，and find the additional words of console:

```js
GET / 200 5.123 ms - 14
```

## Config

有一些内置模式（网上搜就行），使用直接app.use(morgan('\<target\>'))

自定义日志模板：
`app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));`

自定义输出流：

```js
app.use(
  morgan('tiny', {
    stream: {
      write: (message) => {
        console.log('[LOG]', message.trim());
      },
    },
  })
);

// ------------  //

// 创建一个写入流（追加模式）
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// 将日志输出到文件
app.use(morgan('combined', { stream: accessLogStream }));
```

