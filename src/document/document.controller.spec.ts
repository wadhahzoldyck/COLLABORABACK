import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentSchema } from './schema/document.schema';

describe('DocumentController', () => {
  let controller: DocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        DocumentService,
        { provide: 'DocumentModel', useValue: DocumentSchema },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
