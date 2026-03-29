import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CreateCategoryUseCase } from '../application/create-category.use-case';
import { DeleteCategoryUseCase } from '../application/delete-category.use-case';
import { FindCategoryBySlugUseCase } from '../application/find-category-by-slug.use-case';
import { ListCategoriesUseCase } from '../application/list-categories.use-case';
import { UpdateCategoryUseCase } from '../application/update-category.use-case';
import { CategoryEntity } from '../domain/category.entity';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly findCategoryBySlugUseCase: FindCategoryBySlugUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.createCategoryUseCase.execute({ name: dto.name });
    return this.toDto(category);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async list(): Promise<CategoryResponseDto[]> {
    const categories = await this.listCategoriesUseCase.execute();
    return categories.map((c) => this.toDto(c));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    const category = await this.findCategoryBySlugUseCase.execute(slug);
    return this.toDto(category);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category by slug' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.findCategoryBySlugUseCase.execute(slug);
    const updated = await this.updateCategoryUseCase.execute({ id: category.id, ...dto });
    return this.toDto(updated);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete category by slug' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('slug') slug: string): Promise<void> {
    const category = await this.findCategoryBySlugUseCase.execute(slug);
    await this.deleteCategoryUseCase.execute(category.id);
  }

  private toDto(entity: CategoryEntity): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.slug = entity.slug;
    return dto;
  }
}
