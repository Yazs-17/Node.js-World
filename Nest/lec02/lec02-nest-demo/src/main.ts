import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'yazs-secret-key',
      rolling: true, // 每次请求都重新设置cookie过期时间
      name: 'yazs-session-id',
      cookie: {
        maxAge: 60000, // 1分钟
      },
      resave: false,
      // saveUninitialized: false,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
