import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentSchema } from './schema/document.schema';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: 'DocumentModel', useValue: DocumentSchema },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });
});
