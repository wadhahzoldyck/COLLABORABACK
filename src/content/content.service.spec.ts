import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import {ContentSchema } from './schema/content.schema'; // Import the Content and ContentSchema

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: 'ContentModel', useValue: ContentSchema },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
