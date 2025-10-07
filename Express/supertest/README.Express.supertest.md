## Description

配合 [Jest](../jest/README.Express.jest.md) 测试 Express 接口，能模拟 HTTP 请求，测试响应内容

## Usage

**示例：**

```
// app.js
const express = require('express');
const app = express();
app.get('/hello', (req, res) => res.send('Hello World'));
module.exports = app;
// app.test.js
const request = require('supertest');
const app = require('./app');

describe('GET /hello', () => {
  it('should return Hello World', async () => {
    const res = await request(app).get('/hello');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World');
  });
});
```

运行：

```
npx jest
```

## Installation

## Test

