import { Test, TestingModule } from '@nestjs/testing';
import { ResultsRepository } from './results.repository';
import { PrismaService } from '../../database/prisma.service';
import { ResultType } from '@prisma/client';

describe('ResultsRepository', () => {
  let repository: ResultsRepository;
  let prisma: jest.Mocked<PrismaService>;

  const mockResult = {
    id: 'result-1',
    title: 'Test Result',
    description: 'Test Description',
    type: ResultType.INFRASTRUCTURE,
    cabinetId: 'cabinet-1',
    demandId: null,
    protocolFileKey: null,
    protocolFileUrl: null,
    protocolFileName: null,
    protocolFileMimeType: null,
    protocolFileSize: null,
    createdAt: new Date(),
    disabledAt: null,
    images: [],
    cabinet: {
      id: 'cabinet-1',
      name: 'Cabinet',
      slug: 'cabinet',
      avatarUrl: null,
    },
    demand: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultsRepository,
        { provide: PrismaService, useValue: { result: {}, resultImage: {} } },
      ],
    }).compile();

    repository = module.get<ResultsRepository>(ResultsRepository);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create result with images', async () => {
      prisma.result.create = jest.fn().mockResolvedValue(mockResult);

      const result = await repository.create({
        title: 'Test Result',
        description: 'Test Description',
        type: ResultType.INFRASTRUCTURE,
        cabinetId: 'cabinet-1',
        images: [{ storageKey: 'key', url: 'url' }],
      });

      expect(result).toBeDefined();
      expect(prisma.result.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find result by id', async () => {
      prisma.result.findUnique = jest.fn().mockResolvedValue(mockResult);

      const result = await repository.findById('result-1');

      expect(result).toBeDefined();
      expect(prisma.result.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'result-1', disabledAt: null },
        }),
      );
    });

    it('should return null when result not found', async () => {
      prisma.result.findUnique = jest.fn().mockResolvedValue(null);

      const result = await repository.findById('invalid');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should list results with pagination', async () => {
      prisma.result.findMany = jest.fn().mockResolvedValue([mockResult]);
      prisma.result.count = jest.fn().mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('softDelete', () => {
    it('should soft delete result', async () => {
      prisma.result.update = jest.fn().mockResolvedValue(mockResult);

      await repository.softDelete('result-1');

      expect(prisma.result.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'result-1' },
          data: { disabledAt: expect.any(Date) },
        }),
      );
    });
  });
});
