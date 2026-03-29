import { Test } from '@nestjs/testing';
import { ICategoriesRepository } from '../domain/categories.repository.interface';
import { CreateCategoryUseCase } from './create-category.use-case';

const makeCategoryRecord = (slug: string) => ({
  id: 'cat-1',
  name: 'any',
  slug,
  disabledAt: null,
});

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let categoriesRepo: jest.Mocked<ICategoriesRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateCategoryUseCase,
        {
          provide: ICategoriesRepository,
          useValue: {
            create: jest.fn(),
            findSlugsByBaseName: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(CreateCategoryUseCase);
    categoriesRepo = module.get(ICategoriesRepository);
  });

  it('generates a clean slug from name', async () => {
    categoriesRepo.findSlugsByBaseName.mockResolvedValue([]);
    categoriesRepo.create.mockResolvedValue(makeCategoryRecord('infraestrutura'));

    await useCase.execute({ name: 'Infraestrutura' });

    expect(categoriesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'infraestrutura' }),
    );
  });

  it('appends -1 when base slug already exists', async () => {
    categoriesRepo.findSlugsByBaseName.mockResolvedValue(['saude']);
    categoriesRepo.create.mockResolvedValue(makeCategoryRecord('saude-1'));

    await useCase.execute({ name: 'Saúde' });

    expect(categoriesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'saude-1' }),
    );
  });

  it('appends -2 when base slug and -1 are both taken', async () => {
    categoriesRepo.findSlugsByBaseName.mockResolvedValue(['saude', 'saude-1']);
    categoriesRepo.create.mockResolvedValue(makeCategoryRecord('saude-2'));

    await useCase.execute({ name: 'Saúde' });

    expect(categoriesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'saude-2' }),
    );
  });
});
