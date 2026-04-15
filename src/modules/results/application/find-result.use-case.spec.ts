import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindResultUseCase } from './find-result.use-case';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultType } from '@prisma/client';

describe('FindResultUseCase', () => {
  let useCase: FindResultUseCase;
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
        FindResultUseCase,
        { provide: IResultsRepository, useValue: { findById: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<FindResultUseCase>(FindResultUseCase);
    repository = module.get(IResultsRepository);
  });

  it('should find result by id', async () => {
    repository.findById.mockResolvedValue(mockResult as any);

    const result = await useCase.execute('result-1');

    expect(result).toEqual(mockResult);
  });

  it('should throw NotFoundException when result not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
