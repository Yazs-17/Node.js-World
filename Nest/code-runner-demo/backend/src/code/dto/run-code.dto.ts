// src/code/dto/run-code.dto.ts
import { IsIn, IsString } from 'class-validator';

export class RunCodeDto {
  @IsIn(['js'])
  language: 'js';

  @IsString()
  code: string;
}
