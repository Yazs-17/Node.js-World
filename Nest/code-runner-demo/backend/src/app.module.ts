// src/app.module.ts
import { Module } from '@nestjs/common';
import { CodeModule } from './code/code.module';

@Module({
  imports: [CodeModule],
})
export class AppModule {}
