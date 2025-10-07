## Description

使用`express-http-proxy`、`http-proxy-middleware`(高级)等中间件，可以在 Express 中实现代理功能

```js
const express = require('express');
const proxy = require('express-http-proxy')
app.use('/proxy', proxy('http://www.example.com'));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```

## Usage

该demo包含[express-json](../json/README.Express.json.md)

