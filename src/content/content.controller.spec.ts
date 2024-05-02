import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentSchema } from './schema/content.schema'; // Import the Content and ContentSchema
import { CloudinaryService } from '../../CloudinaryService';

describe('ContentController', () => {
  let controller: ContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        ContentService,
        CloudinaryService, // Provide CloudinaryService
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
