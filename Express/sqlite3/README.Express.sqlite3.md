## Description
Node.js 内置轻量数据库

本demo将结合多环境配置([dotenv](../dotenv/README.Express.dotenv.md))

项目结构:
```shell
express-dotenv-sqlite-demo/
├── package.json
├── server.js
├── .env.development
├── .env.test
├── .env.production
├── config/
│   ├── index.js       # 环境配置
│   └── db.js          # 数据库连接
└── db/
    ├── dev.sqlite
    ├── test.sqlite
    └── prod.sqlite
```

## Start
```bash
npm i 
npm run <your env script>
```
## TODOs
- 数据库迁移 + 种子数据 （migrations + seeds） -> ORM(e.g. Sequelize, Prisma)
...


## Test
#### 发送POST请求
```shell
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```
解释：
- -X POST → 使用 POST 方法
- -H "Content-Type: application/json" → 设置请求头，告诉服务器发送的是 JSON
- -d '{"name": "Alice"}' → 发送 JSON 数据
- 使用-F参数可以向服务器上传文件，这通常涉及到文件上传操作
- 使用-b参数可以向服务器发送Cookie
- 使用-c参数可以将服务器设置的Cookie保存到文件中

或者直接用`test/`下的脚本