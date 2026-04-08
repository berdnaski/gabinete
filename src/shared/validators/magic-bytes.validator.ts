import { FileValidator, Injectable } from '@nestjs/common';
import * as fileType from 'file-type';

export interface MagicBytesValidatorOptions {
  allowedMimeTypes: string[];
}

@Injectable()
export class MagicBytesValidator extends FileValidator<MagicBytesValidatorOptions> {
  buildErrorMessage(): string {
    return `O arquivo enviado possui uma assinatura inválida. Os formatos permitidos são: ${this.validationOptions.allowedMimeTypes.join(
      ', ',
    )}`;
  }

  async isValid(file: Express.Multer.File): Promise<boolean> {
    if (!file || !file.buffer) {
      return false;
    }

    try {
      const type = await fileType.fromBuffer(file.buffer);
      if (!type) {
        return false;
      }
      return this.validationOptions.allowedMimeTypes.includes(type.mime);
    } catch {
      return false;
    }
  }
}
