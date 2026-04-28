// src/code/code.service.ts
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { RunCodeDto } from './dto/run-code.dto';

@Injectable()
export class CodeService {
  async run(dto: RunCodeDto) {
    const id = randomUUID();
    const baseTmpDir = path.join(process.cwd(), '.tmp');
    const workDir = path.join(baseTmpDir, id);

    await fs.mkdir(workDir, { recursive: true });
    const filePath = path.join(workDir, 'main.js');
    await fs.writeFile(filePath, dto.code);
    const dockerWorkDir = workDir.replace(/\\/g, '/');
    const cmd =
      `docker run --rm ` +
      `--network none ` +
      `--memory=128m ` +
      `--cpus=0.5 ` +
      `-v "${dockerWorkDir}:/app" ` +
      `node:18-alpine ` +
      `node /app/main.js`;

    return new Promise((resolve) => {
      exec(cmd, { timeout: 3000 }, async (err, stdout, stderr) => {
        await fs.rm(workDir, { recursive: true, force: true });

        if (err) {
          resolve({
            success: false,
            error: stderr || err.message,
          });
        } else {
          resolve({
            success: true,
            output: stdout,
          });
        }
      });
    });
  }
}
