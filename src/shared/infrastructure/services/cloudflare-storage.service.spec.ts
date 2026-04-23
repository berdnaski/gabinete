import { Test, TestingModule } from '@nestjs/testing';
import { CloudflareStorageService } from './cloudflare-storage.service';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('CloudflareStorageService', () => {
  let service: CloudflareStorageService;
  let s3Client: jest.Mocked<S3Client>;

  beforeEach(async () => {
    process.env.CLOUDFLARE_ENDPOINT = 'https://test.r2.cloudflarestorage.com';
    process.env.CLOUDFLARE_ACCESS_KEY_ID = 'test-key';
    process.env.CLOUDFLARE_SECRET_ACCESS_KEY = 'test-secret';
    process.env.CLOUDFLARE_BUCKET = 'test-bucket';
    delete process.env.CLOUDFLARE_PUBLIC_URL;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudflareStorageService],
    }).compile();

    service = module.get<CloudflareStorageService>(CloudflareStorageService);
    s3Client = service['s3'] as unknown as jest.Mocked<S3Client>;
  });

  describe('getUrl', () => {
    it('should return a public URL when CLOUDFLARE_PUBLIC_URL is defined', async () => {
      const publicBase = 'https://pub-test.r2.dev';
      process.env.CLOUDFLARE_PUBLIC_URL = publicBase;
      const key = 'folder/file.jpg';

      const result = await service.getUrl(key);

      expect(result.signedUrl).toBe(`${publicBase}/${key}`);
    });

    it('should strip trailing slash from CLOUDFLARE_PUBLIC_URL', async () => {
      process.env.CLOUDFLARE_PUBLIC_URL = 'https://pub-test.r2.dev/';
      const key = 'file.jpg';

      const result = await service.getUrl(key);

      expect(result.signedUrl).toBe(`https://pub-test.r2.dev/${key}`);
    });

    it('should fallback to signed URL when CLOUDFLARE_PUBLIC_URL is NOT defined', async () => {
      const key = 'private/file.jpg';
      const mockSignedUrl = 'https://signed-url.com/file';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      const result = await service.getUrl(key);

      expect(getSignedUrl).toHaveBeenCalledWith(
        s3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
      expect(result.signedUrl).toBe(mockSignedUrl);
    });
  });
});
