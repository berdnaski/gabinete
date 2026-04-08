import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { FindUserByEmailUseCase } from '../application/find-user-by-email.use-case';
import { FindUserByIdUseCase } from '../application/find-user-by-id.use-case';
import { ValidatePasswordUseCase } from '../application/validate-password.use-case';
import { ListUsersUseCase } from '../application/list-users.use-case';
import { UpdateUserProfileUseCase } from '../application/update-user-profile.use-case';
import { DeleteAccountUseCase } from '../application/delete-account.use-case';
import { IUsersRepository } from '../domain/users.repository.interface';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    { provide: IUsersRepository, useClass: UsersRepository },
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    CreateUserUseCase,
    ValidatePasswordUseCase,
    ListUsersUseCase,
    UpdateUserProfileUseCase,
    DeleteAccountUseCase,
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
