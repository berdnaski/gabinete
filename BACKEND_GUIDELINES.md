# Backend Development Guidelines — Gabinete System

**Data de Criação:** 2026-04-14  
**Versão:** 1.0  
**Padrão Arquitetural:** Clean Architecture + DDD + SOLID  

---

## 1. Estrutura de Módulos

### 1.1 Padrão Obrigatório para Novos Módulos

Cada módulo de domínio **DEVE** seguir esta estrutura de 4 camadas:

```
src/modules/{module}/
├── domain/                          # Entidades de negócio
│   ├── {entity}.entity.ts           # Entidade com @ApiProperty
│   ├── {related}.entity.ts          # Entidades relacionadas (Info classes)
│   └── {entity}.repository.interface.ts  # Contrato do repositório
│
├── application/                     # Lógica de negócio (use cases)
│   ├── {operation}.use-case.ts      # Uma classe por operação
│   └── {operation}.use-case.spec.ts # Jest tests obrigatórios
│
├── dto/                             # Transfer objects
│   ├── {operation}.dto.ts           # Input DTOs
│   ├── {response}.dto.ts            # Response DTOs
│   └── {list-query}.dto.ts          # Query filters para listagem
│
└── infrastructure/                  # Implementações NestJS
    ├── {entity}.controller.ts       # REST endpoints
    ├── {entity}.repository.ts       # Implementação Prisma
    ├── {entity}.module.ts           # NestJS Module
    ├── {entity}-entity.mapper.ts    # Prisma → Entity mapping
    └── {entity}.controller.spec.ts  # Testes do controller
```

### 1.2 Convenção de Nomes

| Camada | Padrão | Exemplo |
|--------|--------|---------|
| Entity | `{Entity}Entity` | `DemandEntity`, `CabinetMemberEntity` |
| Related Info | `{Entity}Info` | `DemandReporterInfo`, `ResultCabinetInfo` |
| Use Case | `{Operation}{Entity}UseCase` | `CreateDemandUseCase`, `ListDemandsUseCase` |
| Repository Interface | `I{Entity}Repository` | `IDemandsRepository`, `IResultsRepository` |
| Repository Class | `{Entity}Repository` | `DemandsRepository`, `ResultsRepository` |
| DTO Input | `{Operation}{Entity}Dto` | `CreateDemandDto`, `UpdateCabinetDto` |
| DTO Response | `{Entity}ResponseDto` | `DemandResponseDto` (se necessário) |
| DTO Listagem | `List{Entity}Dto` | `ListDemandsDto`, `ListCabinetsDto` |
| Controller | `{Entity}Controller` | `DemandsController`, `CabinetsController` |
| Module | `{Entity}Module` | `DemandsModule`, `CabinetsModule` |
| Mapper | `{Entity}EntityMapper` | `DemandEntityMapper`, `CabinetEntityMapper` |
| Guard | `{Purpose}Guard` | `JwtAuthGuard`, `DemandAccessGuard` |

---

## 2. Domain Layer (Entidades)

### 2.1 Estrutura de Entity

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { {Enum} } from '@prisma/client';

export class {RelatedInfo} {
  @ApiProperty({ example: 'value' })
  field: string;
}

export class {Entity}Entity {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Descrição clara' })
  nome: string;

  @ApiProperty({ enum: {Enum} })
  status: {Enum};

  @ApiProperty({ nullable: true })
  optionalField: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  disabledAt: Date | null;

  // Relacionamentos (sempre com required: false)
  @ApiProperty({ type: [{RelatedEntity}], required: false })
  children?: {RelatedEntity}[];

  @ApiProperty({ type: {RelatedInfo}, required: false, nullable: true })
  relation?: {RelatedInfo} | null;
}
```

### 2.2 Repository Interface

```typescript
import { {Entity}Entity } from './{entity}.entity';
import { PaginatedResult, PaginationParams } from 'src/shared/domain/pagination.interface';

export interface Create{Entity}Info {
  field1: string;
  field2?: string | null;
  relatedData?: Create{Related}Info[];
}

export interface Update{Entity}Info {
  field1?: string;
  field2?: string;
}

export interface List{Entity}Filters extends PaginationParams {
  search?: string;
  status?: string;
  // ... outros filtros
}

export abstract class I{Entity}Repository {
  abstract create(data: Create{Entity}Info): Promise<{Entity}Entity>;
  abstract findById(id: string): Promise<{Entity}Entity | null>;
  abstract findAll(filters: List{Entity}Filters): Promise<PaginatedResult<{Entity}Entity>>;
  abstract update(id: string, data: Update{Entity}Info): Promise<{Entity}Entity>;
  abstract softDelete(id: string): Promise<void>;
  // ... operações específicas do domínio
}
```

---

## 3. Application Layer (Use Cases)

### 3.1 Regra de Ouro

**Uma classe = Uma operação (execute() method)**

Nunca serviços monolíticos. Use cases **DEVEM ser puros** (sem dependências NestJS, exceto `@Injectable()` e exceções).

### 3.2 Template Básico

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { I{Entity}Repository } from '../domain/{entity}.repository.interface';
import { {Entity}Entity } from '../domain/{entity}.entity';

export interface {Operation}Input {
  field: string;
}

@Injectable()
export class {Operation}{Entity}UseCase {
  constructor(
    private readonly repository: I{Entity}Repository,
    // Outras dependências (sempre interfaces/repositórios)
  ) {}

  async execute(input: {Operation}Input, userId: string): Promise<{Entity}Entity> {
    // Validações de negócio
    const entity = await this.repository.findById(input.id);
    if (!entity) {
      throw new NotFoundException('{Entity} não encontrado');
    }

    // Lógica de domínio
    // ...

    return this.repository.update(input.id, { /* dados */ });
  }
}
```

### 3.3 Dependências Permitidas no Application

✅ **SIM:**
- Interfaces de repositório (`I{Entity}Repository`)
- Classes abstratas de domínio
- `@Injectable()` decorator
- Exceções NestJS (`NotFoundException`, `ForbiddenException`, etc.)
- Tipos do Prisma (`ResultType`, enums, etc.)

❌ **NÃO:**
- `@nestjs/common` (exceto decoradores e exceções)
- Prisma Client
- Interceptadores
- Guards
- Controladores
- NestJS specifics

---

## 4. DTO Layer (Validação)

### 4.1 Imports Padrão

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { {Enum} } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
```

### 4.2 Template de DTO Input

```typescript
export class {Operation}{Entity}Dto {
  @ApiProperty({ example: 'value', description: 'O que é' })
  @IsString()
  @MaxLength(255)
  field: string;

  @ApiPropertyOptional({ enum: {Enum}, example: {Enum}.ACTIVE })
  @IsEnum({Enum})
  @IsOptional()
  status?: {Enum};

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'true' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'uuid-id', nullable: true })
  @IsUUID()
  @IsOptional()
  relatedId?: string | null;
}
```

### 4.3 DTO Listagem (Query Filters)

**SEMPRE** estende `PaginationParams`:

```typescript
export class List{Entity}Dto {
  @ApiPropertyOptional({ example: 'search term', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: {Enum} })
  @IsEnum({Enum})
  @IsOptional()
  status?: {Enum};

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
```

---

## 5. Infrastructure Layer

### 5.1 Controller

#### Regra de Ouro: Sem lógica de negócio

O controller é um **proxy** que:
1. Extrai parâmetros
2. Valida (automático via DTOs)
3. Chama use case
4. Retorna resultado

```typescript
import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { {Entity}Entity } from '../domain/{entity}.entity';
import { {Operation}{Entity}UseCase } from '../application/{operation}-{entity}.use-case';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserEntity } from '../../users/domain/user.entity';
import { {Operation}{Entity}Dto } from '../dto/{operation}-{entity}.dto';

@ApiTags('{entities}')
@Controller('{entities}')
export class {Entity}Controller {
  constructor(
    private readonly {operation}{Entity}UseCase: {Operation}{Entity}UseCase,
    // Outros use cases
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo {entity}' })
  @ApiResponse({ status: 201, type: {Entity}Entity })
  @ApiResponse({ status: 400, description: 'Validação inválida' })
  async create(
    @Body() dto: {Operation}{Entity}Dto,
    @CurrentUser() user: UserEntity,
  ): Promise<{Entity}Entity> {
    return this.{operation}{Entity}UseCase.execute(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista {entities}' })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async list(@Query() query: List{Entity}Dto) {
    return this.list{Entity}UseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca {entity} por ID' })
  @ApiResponse({ status: 200, type: {Entity}Entity })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async findById(@Param('id') id: string) {
    return this.find{Entity}UseCase.execute(id);
  }
}
```

### 5.2 Repository (Prisma Implementation)

#### Padrão Obrigatório

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { {Entity}Entity } from '../domain/{entity}.entity';
import { 
  Create{Entity}Info,
  I{Entity}Repository,
  List{Entity}Filters,
  Update{Entity}Info,
} from '../domain/{entity}.repository.interface';
import { {Entity}EntityMapper } from './{entity}-entity.mapper';
import { PaginatedResult } from 'src/shared/domain/pagination.interface';
import { PaginationHelper } from 'src/shared/application/pagination.helper';

const {ENTITY}_INCLUDE = {
  relations: true,
  nested: { select: { id: true, name: true } },
} as const;

@Injectable()
export class {Entity}Repository implements I{Entity}Repository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Create{Entity}Info): Promise<{Entity}Entity> {
    const entity = await this.prisma.{entity}.create({
      data: {
        field1: data.field1,
        // ... mapeamento
      },
      include: {ENTITY}_INCLUDE,
    });

    return {Entity}EntityMapper.toDomain(entity);
  }

  async findById(id: string): Promise<{Entity}Entity | null> {
    const entity = await this.prisma.{entity}.findUnique({
      where: { id, disabledAt: null },  // SEMPRE filtrar soft deletes!
      include: {ENTITY}_INCLUDE,
    });

    return entity ? {Entity}EntityMapper.toDomain(entity) : null;
  }

  async findAll(filters: List{Entity}Filters): Promise<PaginatedResult<{Entity}Entity>> {
    const { skip, take } = PaginationHelper.getSkipTake(filters);

    const where = {
      disabledAt: null,
      status: filters.status ?? undefined,
      OR: filters.search
        ? [
            { name: { contains: filters.search, mode: 'insensitive' as const } },
            { description: { contains: filters.search, mode: 'insensitive' as const } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.{entity}.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {ENTITY}_INCLUDE,
      }),
      this.prisma.{entity}.count({ where }),
    ]);

    return {
      items: items.map({Entity}EntityMapper.toDomain),
      total,
    };
  }

  async update(id: string, data: Update{Entity}Info): Promise<{Entity}Entity> {
    const entity = await this.prisma.{entity}.update({
      where: { id },
      data: { /* selective update */ },
      include: {ENTITY}_INCLUDE,
    });

    return {Entity}EntityMapper.toDomain(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.{entity}.update({
      where: { id },
      data: { disabledAt: new Date() },
    });
  }
}
```

### 5.3 Entity Mapper

```typescript
import { Prisma } from '@prisma/client';
import { {Entity}Entity } from '../domain/{entity}.entity';

export type {Entity}WithRelations = Prisma.{Entity}GetPayload<{
  include: {
    children: true;
    parent: { select: { id: true; name: true } };
  };
}>;

export class {Entity}EntityMapper {
  static toDomain(prismaModel: {Entity}WithRelations): {Entity}Entity {
    const entity = new {Entity}Entity();
    
    entity.id = prismaModel.id;
    entity.name = prismaModel.name;
    // ... mapeamento todos os campos

    entity.children = prismaModel.children?.map((c) => ({
      id: c.id,
      name: c.name,
    }));

    entity.parent = prismaModel.parent
      ? { id: prismaModel.parent.id, name: prismaModel.parent.name }
      : null;

    return entity;
  }
}
```

### 5.4 Module

```typescript
import { Module } from '@nestjs/common';
import { I{Entity}Repository } from '../domain/{entity}.repository.interface';
import { Create{Entity}UseCase } from '../application/create-{entity}.use-case';
import { List{Entity}UseCase } from '../application/list-{entity}.use-case';
import { Find{Entity}UseCase } from '../application/find-{entity}.use-case';
import { Update{Entity}UseCase } from '../application/update-{entity}.use-case';
import { Delete{Entity}UseCase } from '../application/delete-{entity}.use-case';
import { {Entity}Controller } from './{entity}.controller';
import { {Entity}Repository } from './{entity}.repository';
import { {Access}Guard } from 'src/shared/guards/{access}.guard';

// Imports de módulos dependentes
import { CabinetsModule } from '../../cabinets/infrastructure/cabinets.module';

@Module({
  imports: [CabinetsModule],  // Apenas o que precisar
  controllers: [{Entity}Controller],
  providers: [
    { provide: I{Entity}Repository, useClass: {Entity}Repository },
    Create{Entity}UseCase,
    List{Entity}UseCase,
    Find{Entity}UseCase,
    Update{Entity}UseCase,
    Delete{Entity}UseCase,
    {Access}Guard,  // Se necessário
  ],
  exports: [I{Entity}Repository],  // Exportar interface se outro módulo precisar
})
export class {Entity}Module {}
```

---

## 6. Padrões de Segurança

### 6.0 Derivar Dados do Usuário Autenticado

**NUNCA** aceite IDs de recursos "pertencentes ao usuário" no body do request. Sempre **derive do contexto autenticado**:

```typescript
// ❌ ERRADO - Aceita cabinetId no body
export class CreateResultDto {
  cabinetId: string;  // ⚠️ Usuário pode passar ID de outro gabinete
}

// ✅ CORRETO - Usar slug do gabinete do usuário
export class CreateResultDto {
  cabinetSlug: string;  // Slug público, validado contra memberships do usuário
}

// Ou quando é realmente privado ao usuário:
export class UpdateProfileDto {
  // Não precisa userId - é sempre do @CurrentUser()
}
```

**Padrão de validação no use case:**
```typescript
async execute(input: CreateResultInput, userId: string): Promise<ResultEntity> {
  // 1. Buscar recurso pelo identificador público (slug, etc)
  const cabinet = await this.cabinetsRepository.findBySlug(input.cabinetSlug);
  
  // 2. Validar que o usuário está autorizado
  const membership = await this.cabinetMembersRepository.findMembership(userId, cabinet.id);
  if (!membership) {
    throw new ForbiddenException('Você não é membro deste gabinete');
  }
  
  // 3. Usar o cabinet.id derivado, não o input
  return this.resultsRepository.create({
    cabinetId: cabinet.id,  // ✅ Usa ID validado
    ...
  });
}
```

---

## 6. Padrões de Código

### 6.1 Soft Deletes (Obrigatório)

**NUNCA** delete físico. **SEMPRE** soft delete:

```typescript
// ❌ ERRADO
await this.prisma.demand.delete({ where: { id } });

// ✅ CORRETO
await this.prisma.demand.update({
  where: { id },
  data: { disabledAt: new Date() },
});
```

**SEMPRE** filtrar em queries:

```typescript
// ❌ ERRADO
const demands = await this.prisma.demand.findMany();

// ✅ CORRETO
const demands = await this.prisma.demand.findMany({
  where: { disabledAt: null },
});
```

### 6.2 Pagination

**Sempre** usar `PaginationHelper`:

```typescript
import { PaginationHelper } from 'src/shared/application/pagination.helper';

const { skip, take } = PaginationHelper.getSkipTake(filters);
// Defaults: page=1, limit=10, max limit=100

const [items, total] = await Promise.all([
  this.prisma.{entity}.findMany({ skip, take, ... }),
  this.prisma.{entity}.count({ where }),
]);

return { items, total };
```

### 6.3 Handling Relations with Selects

```typescript
// ✅ Para performance, use select em relações aninhadas
include: {
  cabinet: {
    select: { id: true, name: true, slug: true, avatarUrl: true },
  },
  demand: {
    select: { id: true, title: true },
  },
}

// ✅ Filtrar soft deletes em relações
include: {
  results: {
    where: { disabledAt: null },
    select: { id: true, title: true },
  },
}
```

### 6.4 Error Handling

```typescript
// ✅ Use exceções NestJS
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

if (!entity) {
  throw new NotFoundException('{Entity} não encontrado');
}

if (!hasPermission) {
  throw new ForbiddenException('Você não tem permissão para acessar este recurso');
}

if (!isValid) {
  throw new BadRequestException('Email já está registrado');
}
```

---

## 7. Guards & Access Control

### 7.1 Tipos de Guards

| Guard | Uso |
|-------|-----|
| `JwtAuthGuard` | Requer autenticação |
| `OptionalJwtAuthGuard` | Autenticação opcional (leitura pública) |
| `RolesGuard` | Verifica `UserRole` (ADMIN, USER, CITIZEN) |
| `{Entity}AccessGuard` | Verifica se user é dono/membro (ownership) |

### 7.2 Template de Access Guard

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../users/domain/user.entity';
import { I{Entity}Repository } from '../../{entity}/domain/{entity}.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';

@Injectable()
export class {Entity}AccessGuard implements CanActivate {
  constructor(
    private readonly {entity}Repository: I{Entity}Repository,
    private readonly cabinetMembersRepository: ICabinetMembersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: UserEntity;
      params: Record<string, string>;
    }>();
    const { user, params } = request;

    if (!user) return false;

    const {entity}Id = params.id;
    if (!{entity}Id) return true;

    const {entity} = await this.{entity}Repository.findById({entity}Id);
    if (!{entity}) {
      throw new NotFoundException('{Entity} não encontrado');
    }

    // Verificar membership se necessário
    const membership = await this.cabinetMembersRepository.findMembership(
      user.id,
      {entity}.cabinetId,
    );

    if (!membership) {
      throw new ForbiddenException('Você não tem permissão para gerenciar este {entity}');
    }

    return true;
  }
}
```

### 7.3 Uso no Controller

```typescript
// Protegido
@Patch(':id')
@UseGuards(JwtAuthGuard, {Entity}AccessGuard)
@ApiBearerAuth()
async update(@Param('id') id: string, @Body() dto: Update{Entity}Dto) {
  return this.update{Entity}UseCase.execute(id, dto);
}

// Público
@Get()
async list(@Query() query: List{Entity}Dto) {
  return this.list{Entity}UseCase.execute(query);
}
```

---

## 8. Testing (Jest)

### 8.1 Estrutura Básica

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { {Entity}UseCase } from './example.use-case';
import { I{Entity}Repository } from '../domain/{entity}.repository.interface';

describe('{Entity}UseCase', () => {
  let useCase: {Entity}UseCase;
  let repository: jest.Mocked<I{Entity}Repository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {Entity}UseCase,
        { provide: I{Entity}Repository, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<{Entity}UseCase>({Entity}UseCase);
    repository = module.get(I{Entity}Repository) as jest.Mocked<I{Entity}Repository>;
  });

  it('should perform action successfully', async () => {
    repository.findById.mockResolvedValue(mockEntity as any);

    const result = await useCase.execute({ ... });

    expect(result).toBeDefined();
  });

  it('should throw NotFoundException', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ ... })).rejects.toThrow(NotFoundException);
  });
});
```

---

## 9. Swagger Documentation

### 9.1 Decoradores Obrigatórios

```typescript
@ApiTags('entities')  // Agrupamento no Swagger
@Controller('entities')
@ApiBearerAuth()  // Ao usar auth
export class EntityController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cria uma nova entidade' })
  @ApiResponse({ status: 201, type: EntityEntity, description: 'Entidade criada' })
  @ApiResponse({ status: 400, description: 'Validação inválida' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(@Body() dto: CreateEntityDto): Promise<EntityEntity> {
    // ...
  }
}
```

---

## 10. Workflow para Adicionar Nova Feature

### 10.1 Checklist

- [ ] **1. Domain**: Criar `.entity.ts` e `.repository.interface.ts`
- [ ] **2. Application**: Criar use cases (create, list, find, update, delete, etc.)
- [ ] **3. DTO**: Criar input/output DTOs
- [ ] **4. Infrastructure**: 
  - [ ] `.repository.ts` (implementação Prisma)
  - [ ] `-entity.mapper.ts` (Prisma → Entity)
  - [ ] `.controller.ts` (endpoints)
  - [ ] `.module.ts` (DI wiring)
- [ ] **5. Tests**: Unit tests para use cases e controller
- [ ] **6. Guards**: Se necessário access control
- [ ] **7. Schema**: Atualizar `prisma/schema.prisma` se necessário
- [ ] **8. Migration**: `npx prisma migrate dev --name add_feature`
- [ ] **9. App Module**: Importar novo módulo
- [ ] **10. CHANGELOG**: Documentar em `architecture.md`

### 10.2 Exemplo Prático

**Adicionar recurso "Feedback"**

1. **Schema** (prisma/schema.prisma):
```prisma
model Feedback {
  id        String   @id @default(uuid())
  content   String
  rating    Int      @db.SmallInt
  userId    String   @map("user_id")
  resultId  String   @map("result_id")
  createdAt DateTime @default(now()) @map("created_at")
  disabledAt DateTime? @map("disabled_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  result    Result   @relation(fields: [resultId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([resultId])
  @@map("feedbacks")
}
```

2. **Entity** (feedback.entity.ts)
3. **Repository Interface** (feedback.repository.interface.ts)
4. **Use Cases**: CreateFeedback, ListFeedback, DeleteFeedback
5. **DTOs**: CreateFeedbackDto, ListFeedbackDto
6. **Repository** (feedback.repository.ts)
7. **Mapper** (feedback-entity.mapper.ts)
8. **Controller** (feedback.controller.ts)
9. **Module** (feedback.module.ts)
10. **Tests**: *.spec.ts files
11. **Migration**: `npx prisma migrate dev --name add_feedback`

---

## 11. Considerações Críticas

### 11.1 Não Fazer

❌ Serviços monolíticos  
❌ Lógica no controller  
❌ Importações circulares  
❌ Soft deletes "opcionais"  
❌ Queries sem soft delete filter  
❌ DTOs sem @ApiProperty  
❌ Use cases com dependencies NestJS  
❌ Sem testes  
❌ **Aceitar IDs de recursos pertencentes ao usuário no body** (ex: `cabinetId`, `userId`)  
❌ **Confiar em IDs do request para autorização** (sempre validar contra autenticação)

### 11.2 Fazer Sempre

✅ Uma classe = Uma operação  
✅ @Injectable() em use cases  
✅ Soft deletes em tudo  
✅ Type safety com Prisma Payload types  
✅ Interfaces para repositórios  
✅ Tests para use cases  
✅ @ApiProperty em entities  
✅ Pagination com helper  
✅ Error handling com exceções NestJS  

---

## 12. Exemplo Completo: Criar Módulo de Tags

Ver estrutura em `src/modules/results/` ou `src/modules/demands/` como referência.

**Estrutura que será criada:**
```
src/modules/tags/
├── domain/
│   ├── tag.entity.ts
│   └── tags.repository.interface.ts
├── application/
│   ├── create-tag.use-case.ts
│   ├── list-tags.use-case.ts
│   ├── find-tag.use-case.ts
│   ├── update-tag.use-case.ts
│   ├── delete-tag.use-case.ts
│   └── *.spec.ts (5 testes)
├── dto/
│   ├── create-tag.dto.ts
│   ├── update-tag.dto.ts
│   └── list-tags.dto.ts
└── infrastructure/
    ├── tag.controller.ts
    ├── tag.repository.ts
    ├── tag-entity.mapper.ts
    ├── tag.module.ts
    └── tag.controller.spec.ts
```

---

## Referência Rápida

| Precisa de... | Use | Exemplo |
|---------------|-----|---------|
| Dados do usuário | `@CurrentUser()` | `@CurrentUser() user: UserEntity` |
| Validação | `class-validator` em DTO | `@IsEmail()` |
| Paginação | `PaginationHelper` | `PaginationHelper.getSkipTake(filters)` |
| Storage | `StorageService` | `this.storage.upload({...})` |
| Exceção | Exceções NestJS | `throw new NotFoundException(...)` |
| Teste | `Test.createTestingModule()` | Ver section 8 |
| Documentação | `@ApiProperty` em entities | Ver section 9 |

---

**Última Atualização:** 2026-04-14  
**Mantido por:** Equipe de Desenvolvimento  
**Próxima Revisão:** 2026-05-14
