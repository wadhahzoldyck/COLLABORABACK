
import { Body, Controller, Delete, Get, Param, Put, Version } from '@nestjs/common';

@Controller({ path: 'hello' })
export class VersionController {
    @Get('document/:version')
    findAll(@Param('version') version: string) {
      switch (version) {
        case 'v1':
          return 'This is version 1 of the document route.';
        case 'v2':
          return 'This is version 2 of the document route.';
        case 'v3':
            return 'This is version 3 of the document route.';
        default:
          return 'Invalid version.';
      }
    }
    @Delete('document/:version')
    delete(@Param('version') version: string) {
      switch (version) {
        case 'v1':
          return 'Delete operation for version 1 of the document route.';
        case 'v2':
          return 'Delete operation for version 2 of the document route.';
          case 'v3':
            return 'Delete operation for version 3 of the document route.';
        default:
          return 'Invalid version.';
      }
    }
    @Put('document/:version')
    update(@Param('version') version: string, @Body() body: any) {
      switch (version) {
        case 'v1':
          return `Update operation for version 1 of the document route. Data: ${JSON.stringify(body)}`;
        case 'v2':
          return `Update operation for version 2 of the document route. Data: ${JSON.stringify(body)}`;
        case 'v3':
            return `Update operation for version 3 of the document route. Data: ${JSON.stringify(body)}`;
        default:
          return 'Invalid version.';
      }
    }
}
