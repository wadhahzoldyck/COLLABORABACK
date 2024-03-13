// version.controller.ts

import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { documents } from './mock-data';


@Controller()
export class VersionController {
    @Get('document/:version')
    
    findAll(@Param('version') version: string) {
        const document = documents.find(doc => doc.version === version);
        return document ? document.content : 'Document not found.';
    }

    @Delete('document/:version')
    delete(@Param('version') version: string) {
        return `Delete operation for version ${version} of the document route.`;
    }

    @Put('document/:version')
    update(@Param('version') version: string, @Body() body: any) {
        return `Update operation for version ${version} of the document route. Data: ${JSON.stringify(body)}`;
    }
}
