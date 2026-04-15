import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateResultUseCase } from './update-result.use-case';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultType } from '@prisma/client';

describe('UpdateResultUseCase', () => {
  let useCase: UpdateResultUseCase;
  let repository: jest.Mocked<IResultsRepository>;

  const mockResult = {
    id: 'result-1',
    title: 'Old Title',
    description: 'Old Description',
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

  const updatedResult = {
    ...mockResult,
    title: 'New Title',
    description: 'New Description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateResultUseCase,
        {
          provide: IResultsRepository,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<UpdateResultUseCase>(UpdateResultUseCase);
    repository = module.get(IResultsRepository);
  });

  it('should update result', async () => {
    repository.findById.mockResolvedValue(mockResult as any);
    repository.update.mockResolvedValue(updatedResult as any);

    const result = await useCase.execute('result-1', {
      title: 'New Title',
      description: 'New Description',
    });

    expect(result.title).toBe('New Title');
    expect(repository.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException when result not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-id', { title: 'New Title' }),
    ).rejects.toThrow(NotFoundException);
  });
});
