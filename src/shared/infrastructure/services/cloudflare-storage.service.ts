import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import {
  StorageService,
  UploadProps,
  UploadResult,
} from '../../domain/services/storage.service';

@Injectable()
export class CloudflareStorageService implements StorageService {
  private readonly logger = new Logger(CloudflareStorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.CLOUDFLARE_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
      },
      region: 'auto',
    });
    this.bucket = process.env.CLOUDFLARE_BUCKET!;
  }

  async upload(props: UploadProps): Promise<UploadResult> {
    const { buffer, filename, mimetype, folder } = props;

    const randomName = uuidv4().concat('-').concat(filename);
    const path = folder ? `${folder}/${randomName}` : randomName;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: buffer,
      ContentType: mimetype,
    });

    await this.s3.send(command);

    return { path, filename, mimetype, folder };
  }

  async getUrl(key: string): Promise<{ signedUrl: string }> {
    const publicUrlBase = process.env.CLOUDFLARE_PUBLIC_URL;

    if (publicUrlBase) {
      const cleanBase = publicUrlBase.endsWith('/')
        ? publicUrlBase.slice(0, -1)
        : publicUrlBase;
      return { signedUrl: `${cleanBase}/${key}` };
    }

    try {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
      return { signedUrl };
    } catch (error) {
      this.logger.error('Error generating signed URL', error);
      throw new Error('Failed to generate file URL');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
      await this.s3.send(command).catch((err) => {
        this.logger.warn(`File ${key} could not be deleted or not found in R2`, err);
      });
    } catch (error) {
      this.logger.error('Error deleting object from R2', error);
      throw error;
    }
  }

  async getPresignedUploadUrl(key: string, mimetype: string, expiresIn = 600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimetype,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      this.logger.error('Error generating presigned upload URL', error);
      throw new Error('Failed to generate presigned upload URL');
    }
  }
}
