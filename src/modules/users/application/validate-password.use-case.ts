import { Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class ValidatePasswordUseCase {
  async execute(plain: string, hashed: string): Promise<boolean> {
    return bcryptjs.compare(plain, hashed);
  }
}
