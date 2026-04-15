import { Test, TestingModule } from '@nestjs/testing';
import { AddDemandEvidenceUseCase } from './add-demand-evidence.use-case';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { StorageService } from '../../../shared/domain/services/storage.service';
import { IUsersRepository } from '../../users/domain/users.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

jest.mock('sharp', () => () => ({
  rotate: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-buffer')),
}));

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('AddDemandEvidenceUseCase', () => {
  let useCase: AddDemandEvidenceUseCase;
  let demandsRepo: jest.Mocked<IDemandsRepository>;
  let storageService: jest.Mocked<StorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddDemandEvidenceUseCase,
        {
          provide: IDemandsRepository,
          useValue: {
            findById: jest.fn(),
            addEvidence: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn(),
            getUrl: jest.fn(),
          },
        },
        {
          provide: IUsersRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<AddDemandEvidenceUseCase>(AddDemandEvidenceUseCase);
    demandsRepo = module.get(IDemandsRepository);
    storageService = module.get(StorageService);
  });

  it('should save the URL returned by storageService (validating eternal URL flow)', async () => {
    const demandId = 'd-1';
    const mockFile = {
      buffer: Buffer.from('fake-image'),
      originalname: 'test.png',
    } as any;

    demandsRepo.findById.mockResolvedValue({
      id: demandId,
      cabinetId: 'c1',
    } as any);
    storageService.upload.mockResolvedValue({
      path: 'demands/d-1/file.jpg',
    } as any);
    storageService.getUrl.mockResolvedValue({
      signedUrl: 'https://pub.r2.dev/demands/d-1/file.jpg',
    });

    await useCase.execute(demandId, 'u-1', [mockFile]);

    expect(storageService.getUrl).toHaveBeenCalledWith('demands/d-1/file.jpg');
    expect(demandsRepo.addEvidence).toHaveBeenCalledWith(
      demandId,
      expect.objectContaining({
        url: 'https://pub.r2.dev/demands/d-1/file.jpg',
      }),
    );
  });
});
