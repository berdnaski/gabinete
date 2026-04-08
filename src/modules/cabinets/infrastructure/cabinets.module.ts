import { Module } from '@nestjs/common';
import { AddCabinetMemberUseCase } from '../application/add-cabinet-member.use-case';
import { CreateCabinetUseCase } from '../application/create-cabinet.use-case';
import { DeleteCabinetUseCase } from '../application/delete-cabinet.use-case';
import { FindCabinetBySlugUseCase } from '../application/find-cabinet-by-slug.use-case';
import { ListCabinetMembersUseCase } from '../application/list-cabinet-members.use-case';
import { ListCabinetsUseCase } from '../application/list-cabinets.use-case';
import { RemoveCabinetMemberUseCase } from '../application/remove-cabinet-member.use-case';
import { UpdateCabinetUseCase } from '../application/update-cabinet.use-case';
import { ICabinetMembersRepository } from '../domain/cabinet-members.repository.interface';
import { ICabinetsRepository } from '../domain/cabinets.repository.interface';
import { CabinetMembersRepository } from './cabinet-members.repository';
import { CabinetsController } from './cabinets.controller';
import { CabinetsRepository } from './cabinets.repository';

@Module({
  providers: [
    { provide: ICabinetsRepository, useClass: CabinetsRepository },
    { provide: ICabinetMembersRepository, useClass: CabinetMembersRepository },
    CreateCabinetUseCase,
    ListCabinetsUseCase,
    FindCabinetBySlugUseCase,
    UpdateCabinetUseCase,
    DeleteCabinetUseCase,
    AddCabinetMemberUseCase,
    ListCabinetMembersUseCase,
    RemoveCabinetMemberUseCase,
  ],
  controllers: [CabinetsController],
  exports: [ICabinetMembersRepository, ICabinetsRepository],
})
export class CabinetsModule {}
