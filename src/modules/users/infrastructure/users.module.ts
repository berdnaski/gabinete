import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { FindUserByEmailUseCase } from '../application/find-user-by-email.use-case';
import { FindUserByIdUseCase } from '../application/find-user-by-id.use-case';
import { ValidatePasswordUseCase } from '../application/validate-password.use-case';
import { ListUsersUseCase } from '../application/list-users.use-case';
import { UpdateUserProfileUseCase } from '../application/update-user-profile.use-case';
import { DeleteAccountUseCase } from '../application/delete-account.use-case';
import { ListUserNeighborhoodsUseCase } from '../application/list-user-neighborhoods.use-case';
import { AddUserNeighborhoodUseCase } from '../application/add-user-neighborhood.use-case';
import { RemoveUserNeighborhoodUseCase } from '../application/remove-user-neighborhood.use-case';
import { SetPrimaryNeighborhoodUseCase } from '../application/set-primary-neighborhood.use-case';
import { IUsersRepository } from '../domain/users.repository.interface';
import { IUserNeighborhoodsRepository } from '../domain/user-neighborhoods.repository.interface';
import { UsersRepository } from './users.repository';
import { UserNeighborhoodsRepository } from './user-neighborhoods.repository';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    { provide: IUsersRepository, useClass: UsersRepository },
    { provide: IUserNeighborhoodsRepository, useClass: UserNeighborhoodsRepository },
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    CreateUserUseCase,
    ValidatePasswordUseCase,
    ListUsersUseCase,
    UpdateUserProfileUseCase,
    DeleteAccountUseCase,
    ListUserNeighborhoodsUseCase,
    AddUserNeighborhoodUseCase,
    RemoveUserNeighborhoodUseCase,
    SetPrimaryNeighborhoodUseCase,
  ],
  exports: [
    IUsersRepository,
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    CreateUserUseCase,
    ValidatePasswordUseCase,
    ListUsersUseCase,
    UpdateUserProfileUseCase,
    DeleteAccountUseCase,
  ],
})
export class UsersModule {}
