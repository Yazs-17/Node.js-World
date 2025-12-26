# 最小模型
  Controller 负责路由
  Service 负责业务
  Module 负责装配
  main.ts 负责启动
> - **Service 负责业务逻辑，供 Controller（以及其他 Service）使用**
> - **Controller 和 Service 都需要在同一个 Module 中声明**
> - **一个功能（业务模块）通常由 Controller + Service + 其他 Provider 组成**
> - **Module 不是在 `main.ts` 中注册，而是以 `AppModule` 为根，通过 `imports` 逐级引入**
# 现在新增一个功能模板

## 例子：

> 新增一个接口:
> GET /users/hello
> 返回：Hello Nest
## 1️⃣ 新增一个 Service（业务逻辑）
### `users.service.ts`

```ts

import { Injectable } from '@nestjs/common';

  

@Injectable()

export class UsersService {

  sayHello() {

    return 'Hello Nest';

  }

}

```

------
## 2️⃣ 新增一个 Controller（路由）

### `users.controller.ts`

```ts

import { Controller, Get } from '@nestjs/common';

import { UsersService } from './users.service';

  

@Controller('users')

export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  

  @Get('hello')

  hello() {

    return this.usersService.sayHello();

  }

}

```
## 3️⃣ 用 Module 把它们“装”进容器
### `users.module.ts`
```ts

import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';

  

@Module({

  controllers: [UsersController],

  providers: [UsersService],

})

export class UsersModule {}

```

## 4️⃣ 在根模块中引入（非常关键）

### `app.module.ts`


```ts

import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';

  

@Module({

  imports: [UsersModule],

})

export class AppModule {}

```

  

📌 **如果不 import，这个模块等于不存在**（新手最常踩坑）

  

------

  

## 5️⃣ 启动应用（你已有）

  

### `main.ts`

  

```ts

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  await app.listen(3000);

}

bootstrap();

```

  

------

  

## 6️⃣ 访问验证

  

```

GET http://localhost:3000/users/hello

```

  

返回：

  

```txt

Hello Nest

```

  

🎉 路由 + 功能完成

  

------

  

# 🧠 固定流程（重要）

  

**每加一个功能，机械式照做**：

  

```

1. 写 Service（业务）

2. 写 Controller（路由）

3. 写 Module（装配）

4. import 到 AppModule（或上级 Module）

```

  

**绝对不要：**

  

- ❌ 手动 new Service

- ❌ 在 Controller 里写复杂业务

- ❌ 忘了 import Module