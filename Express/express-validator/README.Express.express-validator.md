## Description

用于在路由层**验证和清理用户输入**（防止空值、类型错误、XSS、SQL注入等）

```bash
npm install express-validator
```

## Usage

```js
import express from 'express';
import { body, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

// 注册接口校验
app.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('用户名至少3个字符'),
    body('email')
      .isEmail()
      .withMessage('请输入有效的邮箱'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码至少6位'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 返回400错误
      return res.status(400).json({ errors: errors.array() });
    }

    res.send('注册成功');
  }
);

```

> [!note]
>
> - 可以用 `.trim().escape()` 去除空格、转义输入。
> - 验证失败的结果通过 `validationResult(req)` 获取。
> - 适合放在 **controller 前** 的中间件链中。