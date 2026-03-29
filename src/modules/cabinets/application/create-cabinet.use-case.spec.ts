import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { CreateCabinetUseCase } from './create-cabinet.use-case';

const makeCabinetRecord = (slug: string) => ({
  id: 'cab-1',
  name: 'any',
  slug,
  description: null,
  avatarUrl: null,
  disabledAt: null,
});

const makeMemberRecord = () => ({
  id: 'mem-1',
  userId: 'u1',
  cabinetId: 'cab-1',
  role: CabinetRole.OWNER,
});

describe('CreateCabinetUseCase', () => {
  let useCase: CreateCabinetUseCase;
  let cabinetsRepo: jest.Mocked<ICabinetsRepository>;
  let membersRepo: jest.Mocked<ICabinetMembersRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateCabinetUseCase,
        {
          provide: ICabinetsRepository,
          useValue: {
            create: jest.fn(),
            findSlugsByBaseName: jest.fn(),
          },
        },
        {
          provide: ICabinetMembersRepository,
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(CreateCabinetUseCase);
    cabinetsRepo = module.get(ICabinetsRepository);
    membersRepo = module.get(ICabinetMembersRepository);
  });

  it('generates a clean slug from name', async () => {
    cabinetsRepo.findSlugsByBaseName.mockResolvedValue([]);
    cabinetsRepo.create.mockResolvedValue(makeCabinetRecord('gabinete-silva'));
    membersRepo.add.mockResolvedValue(makeMemberRecord());

    await useCase.execute({ name: 'Gabinete Silva', ownerUserId: 'u1' });

    expect(cabinetsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'gabinete-silva' }),
    );
  });

  it('strips diacritics in slug', async () => {
    cabinetsRepo.findSlugsByBaseName.mockResolvedValue([]);
    cabinetsRepo.create.mockResolvedValue(makeCabinetRecord('infraestrutura'));
    membersRepo.add.mockResolvedValue(makeMemberRecord());

    await useCase.execute({ name: 'Infraestrutura', ownerUserId: 'u1' });

    expect(cabinetsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'infraestrutura' }),
    );
  });

  it('appends -1 when base slug already exists', async () => {
    cabinetsRepo.findSlugsByBaseName.mockResolvedValue(['gabinete-silva']);
    cabinetsRepo.create.mockResolvedValue(makeCabinetRecord('gabinete-silva-1'));
    membersRepo.add.mockResolvedValue(makeMemberRecord());

    await useCase.execute({ name: 'Gabinete Silva', ownerUserId: 'u1' });

    expect(cabinetsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'gabinete-silva-1' }),
    );
  });

  it('appends -2 when base slug and -1 are both taken', async () => {
    cabinetsRepo.findSlugsByBaseName.mockResolvedValue(['gabinete-silva', 'gabinete-silva-1']);
    cabinetsRepo.create.mockResolvedValue(makeCabinetRecord('gabinete-silva-2'));
    membersRepo.add.mockResolvedValue(makeMemberRecord());

    await useCase.execute({ name: 'Gabinete Silva', ownerUserId: 'u1' });

    expect(cabinetsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'gabinete-silva-2' }),
    );
  });

  it('assigns the creating user as OWNER', async () => {
    cabinetsRepo.findSlugsByBaseName.mockResolvedValue([]);
    cabinetsRepo.create.mockResolvedValue(makeCabinetRecord('test'));
    membersRepo.add.mockResolvedValue(makeMemberRecord());

    await useCase.execute({ name: 'Test', ownerUserId: 'user-42' });

    expect(membersRepo.add).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-42', role: CabinetRole.OWNER }),
    );
  });
});
