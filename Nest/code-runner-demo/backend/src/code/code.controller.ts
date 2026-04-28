// src/code/code.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { RunCodeDto } from './dto/run-code.dto';
import { CodeService } from './code.service';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('run')
  run(@Body() dto: RunCodeDto) {
    return this.codeService.run(dto);
  }
}
