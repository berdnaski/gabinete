import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { CabinetRole } from '../domain/cabinet-role.enum';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { AddCabinetMemberUseCase } from './add-cabinet-member.use-case';

const makeCabinet = () => ({
  id: 'cab-1',
  name: 'Test',
  slug: 'test',
  description: null,
  avatarUrl: null,
  disabledAt: null,
});

describe('AddCabinetMemberUseCase', () => {
  let useCase: AddCabinetMemberUseCase;
  let cabinetsRepo: jest.Mocked<ICabinetsRepository>;
  let membersRepo: jest.Mocked<ICabinetMembersRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AddCabinetMemberUseCase,
        {
          provide: ICabinetsRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: ICabinetMembersRepository,
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(AddCabinetMemberUseCase);
    cabinetsRepo = module.get(ICabinetsRepository);
    membersRepo = module.get(ICabinetMembersRepository);
  });

  it('adds a member successfully', async () => {
    cabinetsRepo.findById.mockResolvedValue(makeCabinet());
    membersRepo.add.mockResolvedValue({
      id: 'mem-1',
      userId: 'u1',
      cabinetId: 'cab-1',
      role: CabinetRole.STAFF,
    });

    const result = await useCase.execute({
      cabinetId: 'cab-1',
      userId: 'u1',
      role: CabinetRole.STAFF,
    });

    expect(result.role).toBe(CabinetRole.STAFF);
  });

  it('throws NotFoundException if cabinet does not exist', async () => {
    cabinetsRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ cabinetId: 'nonexistent', userId: 'u1', role: CabinetRole.STAFF }),
    ).rejects.toThrow(NotFoundException);
  });

  it('propagates ConflictException when user is already a member', async () => {
    cabinetsRepo.findById.mockResolvedValue(makeCabinet());
    membersRepo.add.mockRejectedValue(
      new ConflictException('User is already a member of this cabinet'),
    );

    await expect(
      useCase.execute({ cabinetId: 'cab-1', userId: 'u1', role: CabinetRole.STAFF }),
    ).rejects.toThrow(ConflictException);
  });
});
