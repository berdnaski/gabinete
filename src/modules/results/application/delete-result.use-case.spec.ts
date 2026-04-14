import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteResultUseCase } from './delete-result.use-case';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultType } from '@prisma/client';

describe('DeleteResultUseCase', () => {
  let useCase: DeleteResultUseCase;
  let repository: jest.Mocked<IResultsRepository>;

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
        DeleteResultUseCase,
        { provide: IResultsRepository, useValue: { findById: jest.fn(), softDelete: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<DeleteResultUseCase>(DeleteResultUseCase);
    repository = module.get(IResultsRepository) as jest.Mocked<IResultsRepository>;
  });

  it('should soft delete result', async () => {
    repository.findById.mockResolvedValue(mockResult as any);

    await useCase.execute('result-1');

    expect(repository.softDelete).toHaveBeenCalledWith('result-1');
  });

  it('should throw NotFoundException when result not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
