import { BadRequestException } from '@nestjs/common';

export const validateImageMimeType = (mimetype: string) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(mimetype)) {
    throw new BadRequestException(`File type not allowed: ${mimetype}`);
  }
};
