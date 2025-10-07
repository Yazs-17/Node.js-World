## Description

用于**防止暴力请求**或接口滥用，它通过给高频请求增加延迟来“惩罚”用户

> [!note]
>
> ⚠️ 可以搭配 `express-rate-limit` 一起使用：
>
> - `express-rate-limit`: 限制请求次数
> - `express-slow-down`: 超限后延迟响应

## Usage

```js
const slowDown = require('express-slow-down');
const express = require('express');
const app = express();

const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1分钟窗口
  delayAfter: 10, // 超过10次请求后开始限速
  delayMs: 500, // 每多一次请求，延迟500ms
});

app.use(speedLimiter);
app.get('/', (req, res) => res.send('Request received!'));

app.listen(3000);

```



## Installation

## Test

