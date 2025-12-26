import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  // Param,
  // Delete,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import type { SessionData } from 'express-session';
import { UsersService } from './users.service';
import { VerifyCodeDto } from './dto/verify-code.dto';
import type { Request, Response } from 'express';
import * as svgCaptcha from 'svg-captcha';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('code')
  createCode(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: SessionData,
  ) {
    const Captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      background: '#cc9966',
      noise: 3,
    });
    // req.session.code = Captcha.text;
    session.code = Captcha.text; // 将验证码存入session
    res.type('image/svg+xml');
    res.send(Captcha.data);
    // return {
    //   Captcha,
    // };
  }

  @Post('verify')
  createUser(@Body() Body: VerifyCodeDto, @Session() session: SessionData) {
    console.log(Body, session.code);
    if (
      Body.code?.toLowerCase() ??
      '2' !== (session?.code ?? '1').toLowerCase()
    ) {
      return {
        code: 400,
        message: '验证码错误',
      };
    }
    return {
      code: 200,
      message: '验证码正确',
    };
  }
}
