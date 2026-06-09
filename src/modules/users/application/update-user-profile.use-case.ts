import { Injectable, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import { IUsersRepository } from '../domain/users.repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { StorageService } from '../../../shared/domain/services/storage.service';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(id: string, data: UpdateUserDto, file?: Express.Multer.File) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let resolvedAvatarUrl: string | null | undefined = undefined;

    if (data.removeAvatar) {
      await this.storageService.delete(`avatars/${id}/avatar.jpg`).catch(() => null);
      resolvedAvatarUrl = null;
    } else if (file) {
      const sanitizedBuffer = await sharp(file.buffer)
        .rotate()
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const avatarKey = `avatars/${id}/avatar.jpg`;
      await this.storageService.delete(avatarKey).catch(() => null);

      const uploaded = await this.storageService.upload({
        buffer: sanitizedBuffer,
        filename: 'avatar.jpg',
        mimetype: 'image/jpeg',
        key: avatarKey,
      });
      const generated = await this.storageService.getUrl(uploaded.path);
      resolvedAvatarUrl = generated.signedUrl;
    }

    return this.usersRepository.update(id, {
      name: data.name,
      avatarUrl: resolvedAvatarUrl,
      phone: data.phone,
      address: data.address,
      zipcode: data.zipcode,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      lat: data.lat,
      long: data.long,
      termsAcceptedAt: data.termsAcceptedAt ? new Date(data.termsAcceptedAt) : undefined,
    });
  }
}
