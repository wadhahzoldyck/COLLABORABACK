import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentSchema } from './schema/document.schema';
import { FolderSchema } from '../folder/schema/folder.schema';
describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: 'DocumentModel', useValue: DocumentSchema },
        { provide: 'FolderModel', useValue: FolderSchema },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
