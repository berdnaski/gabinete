import { Test, TestingModule } from '@nestjs/testing';
import { ListResultsUseCase } from './list-results.use-case';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ResultType } from '@prisma/client';

describe('ListResultsUseCase', () => {
  let useCase: ListResultsUseCase;
  let repository: jest.Mocked<IResultsRepository>;

  const mockResults = [
    {
      id: 'result-1',
      title: 'Result 1',
      description: 'Desc 1',
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
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListResultsUseCase,
        { provide: IResultsRepository, useValue: { findAll: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<ListResultsUseCase>(ListResultsUseCase);
    repository = module.get(IResultsRepository);
  });

  it('should list all public results with pagination', async () => {
    repository.findAll.mockResolvedValue({
      items: mockResults as any,
      total: 1,
    });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublicOnly: true,
      }),
    );
  });

  it('should filter by cabinetId', async () => {
    repository.findAll.mockResolvedValue({
      items: mockResults as any,
      total: 1,
    });

    await useCase.execute({ cabinetId: 'cabinet-1' });

    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        cabinetId: 'cabinet-1',
        isPublicOnly: true,
      }),
    );
  });
});
