## Description
生产依赖，运行时加载环境变量，手动在命令行设置过于麻烦而诞生，

> [!note]
>
> PS：补充一下手动的方式，
>
> - 如果开发平台固定的话，直接就`package.json` 写
>   ```json
>   "scripts": {
>     "dev": "NODE_ENV=production node server.js"
>   }
>   ...bash/zsh
>     
>   "scripts": {
>     "dev": "$env:NODE_ENV='production'; node server.js"
>   }
>   ...windows powershell
>   ```
>
> - 跨平台可以用[`cross-env`](../cross-env/README.Express.cross-env.md)这个库, `npm i --save-dev cross-dev`
>
>   ```json
>   "scripts": {
>     "dev": "cross-env NODE_ENV=production node server.js"
>   }
>   ```
>
>   

## Installation

```bash
npm install express dotenv
```

## Usage

```js
// 方式1：在应用入口自动加载
import 'dotenv/config';
import express from 'express';

// 方式2：手动配置
import dotenv from 'dotenv';
dotenv.config();
...
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;
```

## DEMO

本文件夹内提供一个简易示例，文件结构：
```shell
my-express-app/
├─ .env.development
├─ .env.test
├─ .env.production
├─ src/
│  ├─ config/
│  │   └─ index.js # 统一配置
│  ├─ app.js			 # 业务逻辑
│  └─ server.js    # 启动入口
├─ package.json
```

依赖安装：
`npm i express dotenv cross-env`

运行：
```bash
npm run dev
npm run test
npm run start
```

## Deployment

##### Docker 生产环境
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production

COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

##### 云平台部署
```bash
# Heroku, Vercel, Railway 等平台
# 自动执行: npm install --production
# 环境变量通过平台界面配置，不需要 .env 文件
```

