import { Test, TestingModule } from '@nestjs/testing';
import { FindDemandUseCase } from './find-demand.use-case';
import { IDemandsRepository } from '../domain/demands.repository.interface';
import { NotFoundException } from '@nestjs/common';

describe('FindDemandUseCase', () => {
  let useCase: FindDemandUseCase;
  let demandsRepo: jest.Mocked<IDemandsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindDemandUseCase,
        {
          provide: IDemandsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindDemandUseCase>(FindDemandUseCase);
    demandsRepo = module.get(IDemandsRepository);
  });

  it('should pass id and userId to the repository', async () => {
    const demandId = 'd-1';
    const userId = 'u-1';
    demandsRepo.findById.mockResolvedValue({ id: demandId } as any);

    const result = await useCase.execute(demandId, userId);

    expect(demandsRepo.findById).toHaveBeenCalledWith(demandId, userId);
    expect(result.id).toBe(demandId);
  });

  it('should throw NotFoundException if demand does not exist', async () => {
    demandsRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('none')).rejects.toThrow(NotFoundException);
  });
});
