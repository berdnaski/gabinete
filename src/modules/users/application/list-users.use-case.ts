import { Injectable } from '@nestjs/common';
import {
  IUsersRepository,
  ListUsersFilters,
} from '../domain/users.repository.interface';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute(filters: ListUsersFilters) {
    return this.usersRepository.findAll(filters);
  }
}
