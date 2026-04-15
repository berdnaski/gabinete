import { Test, TestingModule } from '@nestjs/testing';
import { ListDemandsUseCase } from './list-demands.use-case';
import { IDemandsRepository } from '../domain/demands.repository.interface';

describe('ListDemandsUseCase', () => {
  let useCase: ListDemandsUseCase;
  let demandsRepo: jest.Mocked<IDemandsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListDemandsUseCase,
        {
          provide: IDemandsRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListDemandsUseCase>(ListDemandsUseCase);
    demandsRepo = module.get(IDemandsRepository);
  });

  it('should pass filters and userId to the repository', async () => {
    const filters = { search: 'luz', page: 1, limit: 10 };
    const userId = 'user-999';

    demandsRepo.findAll.mockResolvedValue({
      items: [],
      total: 0,
    });

    await useCase.execute(filters, userId);

    expect(demandsRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'luz' }),
      userId,
    );
  });

  it('should handle anonymous users (undefined userId)', async () => {
    demandsRepo.findAll.mockResolvedValue({
      items: [],
      total: 0,
    });

    await useCase.execute({ page: 1 });

    expect(demandsRepo.findAll).toHaveBeenCalledWith(
      expect.any(Object),
      undefined,
    );
  });
});
