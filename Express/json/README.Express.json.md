## Description

内置中间件`express.json()`即可

**作用**: 
用于自动解析所有 **Content-Type: application/json** 的请求体，并把结果放进 `req.body`

## Usage

```js
const express = require('express');
const app = express();
// 全局启用 JSON 请求体解析中间件
app.use(express.json());
app.post('/api/data', (req, res) => {
   console.log(req.body); // 输出解析后的 JSON 数据
   res.send('ok');
});
// 自己写
// let data = '';
// req.on('data', chunk => data += chunk);
// req.on('end', () => JSON.parse(data));

app.listen(3000, () => {
   console.log('server on 3000...');
});
```



> [!important]
>
> `express.json()`默认可选参数：
>
> - `limit`:限制请求体最大大小，默认值`100kb`,例：`express.json({ limit: '1mb' })`
> - **strict**: 是否仅接受数组和对象作为有效 JSON，默认为 *true*
> - **type**: 指定解析的媒体类型，默认值为` application/json`
> - **verify**: 自定义验证函数，可用于在解析前检查请求体



> [!note]
>
> 1. 它不会影响其它类型的请求体
>
>    比如 `multipart/form-data`（文件上传） 或 `application/x-www-form-urlencoded`，要用：
>
>    ```apl
>    app.use(express.urlencoded({ extended: true }));
>    ```
>
> 2. 敬请期待......