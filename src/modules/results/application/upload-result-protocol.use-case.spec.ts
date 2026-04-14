import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadResultProtocolUseCase } from './upload-result-protocol.use-case';
import { IResultsRepository } from '../domain/results.repository.interface';
import { StorageService } from 'src/shared/domain/services/storage.service';
import { ResultType } from '@prisma/client';

describe('UploadResultProtocolUseCase', () => {
  let useCase: UploadResultProtocolUseCase;
  let repository: jest.Mocked<IResultsRepository>;
  let storageService: jest.Mocked<StorageService>;

  const mockResult = {
    id: 'result-1',
    title: 'Test Result',
    description: 'Test Description',
    type: ResultType.INFRASTRUCTURE,
    cabinetId: 'cabinet-1',
    demandId: null,
    protocolFileKey: 'old-protocol.pdf',
    protocolFileUrl: 'https://example.com/old.pdf',
    protocolFileName: 'old.pdf',
    protocolFileMimeType: 'application/pdf',
    protocolFileSize: 1024,
    createdAt: new Date(),
    disabledAt: null,
    images: [],
  };

  const updatedResult = {
    ...mockResult,
    protocolFileKey: 'results/cabinet-1/protocols/new.pdf',
    protocolFileUrl: 'https://example.com/new.pdf',
    protocolFileName: 'new.pdf',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadResultProtocolUseCase,
        { provide: IResultsRepository, useValue: { findById: jest.fn(), setProtocol: jest.fn() } },
        { provide: StorageService, useValue: { delete: jest.fn(), upload: jest.fn(), getUrl: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<UploadResultProtocolUseCase>(UploadResultProtocolUseCase);
    repository = module.get(IResultsRepository) as jest.Mocked<IResultsRepository>;
    storageService = module.get(StorageService) as jest.Mocked<StorageService>;
  });

  it('should upload protocol and delete old one', async () => {
    repository.findById.mockResolvedValue(mockResult as any);
    storageService.delete.mockResolvedValue(undefined);
    storageService.upload.mockResolvedValue({ path: 'results/cabinet-1/protocols/new.pdf' } as any);
    storageService.getUrl.mockResolvedValue({ signedUrl: 'https://example.com/new.pdf' });
    repository.setProtocol.mockResolvedValue(updatedResult as any);

    const mockFile = {
      originalname: 'new.pdf',
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
      size: 2048,
    } as Express.Multer.File;

    const result = await useCase.execute('result-1', mockFile);

    expect(storageService.delete).toHaveBeenCalledWith('old-protocol.pdf');
    expect(repository.setProtocol).toHaveBeenCalled();
    expect(result).toEqual(updatedResult);
  });

  it('should throw NotFoundException when result not found', async () => {
    repository.findById.mockResolvedValue(null);

    const mockFile = {
      originalname: 'new.pdf',
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
      size: 2048,
    } as Express.Multer.File;

    await expect(useCase.execute('invalid-id', mockFile)).rejects.toThrow(NotFoundException);
  });
});
