import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { FindUserByEmailUseCase } from '../application/find-user-by-email.use-case';
import { FindUserByIdUseCase } from '../application/find-user-by-id.use-case';
import { ValidatePasswordUseCase } from '../application/validate-password.use-case';
import { IUsersRepository } from '../domain/users.repository.interface';
import { UsersRepository } from './users.repository';

@Module({
  providers: [
    { provide: IUsersRepository, useClass: UsersRepository },
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    CreateUserUseCase,
    ValidatePasswordUseCase,
  ],
  exports: [
    IUsersRepository,
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    CreateUserUseCase,
    ValidatePasswordUseCase,
  ],
})
export class UsersModule {}
