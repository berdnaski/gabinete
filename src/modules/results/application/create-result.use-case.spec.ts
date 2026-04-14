import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateResultUseCase } from './create-result.use-case';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ICabinetsRepository } from '../../cabinets/domain/cabinets.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ResultType } from '@prisma/client';
import { CabinetRole } from '../../cabinets/domain/cabinet-role.enum';

describe('CreateResultUseCase', () => {
  let useCase: CreateResultUseCase;
  let resultsRepository: jest.Mocked<IResultsRepository>;
  let cabinetsRepository: jest.Mocked<ICabinetsRepository>;
  let cabinetMembersRepository: jest.Mocked<ICabinetMembersRepository>;

  const mockCabinet = { id: 'cabinet-1', name: 'Test Cabinet', slug: 'test-cabinet', disabledAt: null };
  const mockMembership = { id: 'member-1', userId: 'user-1', cabinetId: 'cabinet-1', role: CabinetRole.STAFF };
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
        CreateResultUseCase,
        { provide: IResultsRepository, useValue: { create: jest.fn() } },
        { provide: ICabinetsRepository, useValue: { findBySlug: jest.fn() } },
        { provide: ICabinetMembersRepository, useValue: { findMembership: jest.fn() } },
        { provide: 'StorageService', useValue: { upload: jest.fn(), getUrl: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<CreateResultUseCase>(CreateResultUseCase);
    resultsRepository = module.get(IResultsRepository) as jest.Mocked<IResultsRepository>;
    cabinetsRepository = module.get(ICabinetsRepository) as jest.Mocked<ICabinetsRepository>;
    cabinetMembersRepository = module.get(ICabinetMembersRepository) as jest.Mocked<ICabinetMembersRepository>;
  });

  it('should create result using cabinetSlug from authenticated user', async () => {
    cabinetsRepository.findBySlug.mockResolvedValue(mockCabinet as any);
    cabinetMembersRepository.findMembership.mockResolvedValue(mockMembership as any);
    resultsRepository.create.mockResolvedValue(mockResult as any);

    const result = await useCase.execute(
      {
        title: 'Test Result',
        description: 'Test Description',
        type: ResultType.INFRASTRUCTURE,
        cabinetSlug: 'test-cabinet',
      },
      'user-1',
      [],
    );

    expect(result).toEqual(mockResult);
    expect(cabinetsRepository.findBySlug).toHaveBeenCalledWith('test-cabinet');
    expect(cabinetMembersRepository.findMembership).toHaveBeenCalledWith('user-1', 'cabinet-1');
  });

  it('should throw NotFoundException when cabinet not found by slug', async () => {
    cabinetsRepository.findBySlug.mockResolvedValue(null);

    await expect(
      useCase.execute(
        {
          title: 'Test',
          description: 'Test',
          type: ResultType.INFRASTRUCTURE,
          cabinetSlug: 'nonexistent',
        },
        'user-1',
        [],
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when user is not cabinet member', async () => {
    cabinetsRepository.findBySlug.mockResolvedValue(mockCabinet as any);
    cabinetMembersRepository.findMembership.mockResolvedValue(null);

    await expect(
      useCase.execute(
        {
          title: 'Test',
          description: 'Test',
          type: ResultType.INFRASTRUCTURE,
          cabinetSlug: 'test-cabinet',
        },
        'unauthorized-user',
        [],
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
