import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from '../application/create-category.use-case';
import { DeleteCategoryUseCase } from '../application/delete-category.use-case';
import { FindCategoryBySlugUseCase } from '../application/find-category-by-slug.use-case';
import { ListCategoriesUseCase } from '../application/list-categories.use-case';
import { UpdateCategoryUseCase } from '../application/update-category.use-case';
import { ICategoriesRepository } from '../domain/categories.repository.interface';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';

@Module({
  providers: [
    { provide: ICategoriesRepository, useClass: CategoriesRepository },
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    FindCategoryBySlugUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
