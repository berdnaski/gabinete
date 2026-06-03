import { UserNeighborhoodEntity } from './user-neighborhood.entity';

export interface CreateUserNeighborhoodData {
  userId: string;
  neighborhood: string;
  city: string;
  state: string;
  label?: string;
  isPrimary: boolean;
}

export abstract class IUserNeighborhoodsRepository {
  abstract findByUserId(userId: string): Promise<UserNeighborhoodEntity[]>;
  abstract findById(id: string): Promise<UserNeighborhoodEntity | null>;
  abstract findByLocation(
    userId: string,
    neighborhood: string,
    city: string,
    state: string,
  ): Promise<UserNeighborhoodEntity | null>;
  abstract countByUserId(userId: string): Promise<number>;
  abstract create(data: CreateUserNeighborhoodData): Promise<UserNeighborhoodEntity>;
  abstract delete(id: string): Promise<void>;
  abstract clearPrimary(userId: string): Promise<void>;
  abstract setPrimary(id: string): Promise<void>;
}
