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

