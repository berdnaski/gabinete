import { Test, TestingModule } from '@nestjs/testing';
import { ResultsController } from './results.controller';
import { CreateResultUseCase } from '../application/create-result.use-case';
import { ListResultsUseCase } from '../application/list-results.use-case';
import { FindResultUseCase } from '../application/find-result.use-case';
import { UpdateResultUseCase } from '../application/update-result.use-case';
import { DeleteResultUseCase } from '../application/delete-result.use-case';
import { AddResultImagesUseCase } from '../application/add-result-images.use-case';
import { UploadResultProtocolUseCase } from '../application/upload-result-protocol.use-case';
import { ResultAccessGuard } from '../../../shared/guards/result-access.guard';
import { IResultsRepository } from '../domain/results.repository.interface';
import { ICabinetMembersRepository } from '../../cabinets/domain/cabinet-members.repository.interface';
import { ResultType } from '@prisma/client';

describe('ResultsController', () => {
  let controller: ResultsController;
  let createResultUseCase: jest.Mocked<CreateResultUseCase>;
  let listResultsUseCase: jest.Mocked<ListResultsUseCase>;
  let findResultUseCase: jest.Mocked<FindResultUseCase>;
  let updateResultUseCase: jest.Mocked<UpdateResultUseCase>;
  let deleteResultUseCase: jest.Mocked<DeleteResultUseCase>;
  let addResultImagesUseCase: jest.Mocked<AddResultImagesUseCase>;
  let uploadResultProtocolUseCase: jest.Mocked<UploadResultProtocolUseCase>;

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultsController],
      providers: [
        { provide: CreateResultUseCase, useValue: { execute: jest.fn() } },
        { provide: ListResultsUseCase, useValue: { execute: jest.fn() } },
        { provide: FindResultUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateResultUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteResultUseCase, useValue: { execute: jest.fn() } },
        { provide: AddResultImagesUseCase, useValue: { execute: jest.fn() } },
        { provide: UploadResultProtocolUseCase, useValue: { execute: jest.fn() } },
        { provide: ResultAccessGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: IResultsRepository, useValue: { findById: jest.fn() } },
        { provide: ICabinetMembersRepository, useValue: { findMembership: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ResultsController>(ResultsController);
    createResultUseCase = module.get(CreateResultUseCase) as jest.Mocked<CreateResultUseCase>;
    listResultsUseCase = module.get(ListResultsUseCase) as jest.Mocked<ListResultsUseCase>;
    findResultUseCase = module.get(FindResultUseCase) as jest.Mocked<FindResultUseCase>;
    updateResultUseCase = module.get(UpdateResultUseCase) as jest.Mocked<UpdateResultUseCase>;
    deleteResultUseCase = module.get(DeleteResultUseCase) as jest.Mocked<DeleteResultUseCase>;
    addResultImagesUseCase = module.get(AddResultImagesUseCase) as jest.Mocked<AddResultImagesUseCase>;
    uploadResultProtocolUseCase = module.get(UploadResultProtocolUseCase) as jest.Mocked<UploadResultProtocolUseCase>;
  });

  describe('POST /results', () => {
    it('should create result', async () => {
      createResultUseCase.execute.mockResolvedValue(mockResult as any);

      const result = await controller.create(
        { title: 'Test', description: 'Test', type: ResultType.INFRASTRUCTURE, cabinetSlug: 'test-cabinet' },
        { id: 'user-1' } as any,
        {},
      );

      expect(result).toEqual(mockResult);
      expect(createResultUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('GET /results', () => {
    it('should list results', async () => {
      listResultsUseCase.execute.mockResolvedValue({ items: [mockResult], total: 1 } as any);

      const result = await controller.list({});

      expect(result.items).toHaveLength(1);
      expect(listResultsUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('GET /results/:id', () => {
    it('should find result', async () => {
      findResultUseCase.execute.mockResolvedValue(mockResult as any);

      const result = await controller.findById('result-1');

      expect(result).toEqual(mockResult);
      expect(findResultUseCase.execute).toHaveBeenCalledWith('result-1');
    });
  });

  describe('PATCH /results/:id', () => {
    it('should update result', async () => {
      updateResultUseCase.execute.mockResolvedValue(mockResult as any);

      const result = await controller.update('result-1', { title: 'Updated' });

      expect(updateResultUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('DELETE /results/:id', () => {
    it('should delete result', async () => {
      deleteResultUseCase.execute.mockResolvedValue(undefined);

      await controller.delete('result-1');

      expect(deleteResultUseCase.execute).toHaveBeenCalledWith('result-1');
    });
  });
});
