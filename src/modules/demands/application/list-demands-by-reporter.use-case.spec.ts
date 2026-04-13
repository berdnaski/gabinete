import { Test, TestingModule } from '@nestjs/testing';
import { ListDemandsByReporterUseCase } from './list-demands-by-reporter.use-case';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { DemandStatus } from '@prisma/client';

describe('ListDemandsByReporterUseCase', () => {
  let useCase: ListDemandsByReporterUseCase;
  let demandsRepo: jest.Mocked<IDemandsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListDemandsByReporterUseCase,
        {
          provide: IDemandsRepository,
          useValue: {
            findByReporter: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListDemandsByReporterUseCase>(ListDemandsByReporterUseCase);
    demandsRepo = module.get(IDemandsRepository);
  });

  it('should pass reporterId, filters and userId correctly to the repository', async () => {
    const reporterId = 'rep-1';
    const filters = { status: DemandStatus.SUBMITTED, search: 'buraco', page: 1, limit: 10 };
    const userId = 'user-123';
    
    demandsRepo.findByReporter.mockResolvedValue({
      items: [],
      total: 0,
    });

    await useCase.execute(reporterId, filters, userId);

    expect(demandsRepo.findByReporter).toHaveBeenCalledWith(
      reporterId,
      filters,
      userId,
    );
  });

  it('should return paginated result with meta', async () => {
    demandsRepo.findByReporter.mockResolvedValue({
      items: [],
      total: 50,
    });

    const result = await useCase.execute('rep-1', { page: 1, limit: 10 });

    expect(result).toEqual({
      items: [],
      meta: {
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
      },
    });
  });
});
