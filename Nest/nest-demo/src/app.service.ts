import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getNow(): string {
    return JSON.stringify(Date.now());
  }
}
