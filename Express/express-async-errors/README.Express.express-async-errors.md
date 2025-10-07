## Description

让 Express **自动捕获 async/await 异步函数中抛出的错误**，而不需要每次手动写 try-catch

`npm install express-async-errors`

```js
app.get('/error', async (req, res) => {
  // 不需要 try-catch！
  throw new Error('Something went wrong');
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);
  res.status(500).json({ message: '服务器内部错误' });
});

```

