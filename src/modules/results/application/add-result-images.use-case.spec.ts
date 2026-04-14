import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AddResultImagesUseCase } from './add-result-images.use-case';
import { IResultsRepository } from '../domain/results.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';
import { ResultType } from '@prisma/client';

jest.mock('sharp', () => () => ({
  rotate: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-buffer')),
}));

describe('AddResultImagesUseCase', () => {
  let useCase: AddResultImagesUseCase;
  let repository: jest.Mocked<IResultsRepository>;
  let storageService: jest.Mocked<StorageService>;

  const mockResult = {
    id: 'result-1',
    title: 'Test Result',
    description: 'Test Description',
    type: ResultType.INFRASTRUCTURE,
    cabinetId: 'cabinet-1',
    demandId: null,
    protocolFileKey: null,
    protocolFileUrl: null,
    protocolFileName: null,
    protocolFileMimeType: null,
    protocolFileSize: null,
    createdAt: new Date(),
    disabledAt: null,
    images: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddResultImagesUseCase,
        { provide: IResultsRepository, useValue: { findById: jest.fn(), addImages: jest.fn() } },
        { provide: StorageService, useValue: { upload: jest.fn(), getUrl: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<AddResultImagesUseCase>(AddResultImagesUseCase);
    repository = module.get(IResultsRepository) as jest.Mocked<IResultsRepository>;
    storageService = module.get(StorageService) as jest.Mocked<StorageService>;
  });

  it('should add images to result', async () => {
    repository.findById.mockResolvedValue(mockResult as any);
    storageService.upload.mockResolvedValue({ path: 'results/cabinet-1/uuid.jpg' } as any);
    storageService.getUrl.mockResolvedValue({ signedUrl: 'https://example.com/image.jpg' });

    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    await useCase.execute('result-1', [mockFile]);

    expect(repository.addImages).toHaveBeenCalled();
  });

  it('should throw NotFoundException when result not found', async () => {
    repository.findById.mockResolvedValue(null);

    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    await expect(useCase.execute('invalid-id', [mockFile])).rejects.toThrow(NotFoundException);
  });
});
