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
import { ICabinetInvitationsRepository } from '../domain/invitations.repository.interface';
import { InviteCabinetMemberUseCase } from '../application/invite-cabinet-member.use-case';
import { GetCabinetInvitationUseCase } from '../application/get-cabinet-invitation.use-case';
import { AcceptCabinetInvitationUseCase } from '../application/accept-cabinet-invitation.use-case';
import { ListCabinetInvitationsUseCase } from '../application/list-cabinet-invitations.use-case';
import { CancelCabinetInvitationUseCase } from '../application/cancel-cabinet-invitation.use-case';
import { CabinetInvitationsRepository } from './invitations.repository';
import { UsersModule } from '../../users/infrastructure/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    { provide: ICabinetsRepository, useClass: CabinetsRepository },
    { provide: ICabinetMembersRepository, useClass: CabinetMembersRepository },
    {
      provide: ICabinetInvitationsRepository,
      useClass: CabinetInvitationsRepository,
    },
    CreateCabinetUseCase,
    ListCabinetsUseCase,
    FindCabinetBySlugUseCase,
    UpdateCabinetUseCase,
    DeleteCabinetUseCase,
    AddCabinetMemberUseCase,
    InviteCabinetMemberUseCase,
    GetCabinetInvitationUseCase,
    AcceptCabinetInvitationUseCase,
    ListCabinetInvitationsUseCase,
    CancelCabinetInvitationUseCase,
    ListCabinetMembersUseCase,
    RemoveCabinetMemberUseCase,
  ],
  controllers: [CabinetsController],
  exports: [
    ICabinetMembersRepository,
    ICabinetsRepository,
    ICabinetInvitationsRepository,
  ],
})
export class CabinetsModule {}
