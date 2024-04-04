// versioning.controller.ts
import { Controller, Get, Post, Delete, Param, NotFoundException, InternalServerErrorException, Put, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document as DocumentModel } from '../document/schema/document.schema';
import { Versioning } from './schema/versioning.schema';

@Controller('versioning')

export class VersionController {
  constructor(
    @InjectModel(Versioning.name) private readonly versioningModel: Model<Versioning>,
    @InjectModel(DocumentModel.name) private readonly documentModel: Model<DocumentModel>,
  ) {}


  @Get(':id/version/:versionId')
  async getDocumentVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    try {
      // Find the versioning document by ID
      const versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
        throw new NotFoundException('Versioning document not found');
      }

      // Find the specific version by its ID
      // console.log(JSON.stringify(versioning.document));
      // console.log('versionId',versionId);
      const reversedDocument = [...versioning.document].reverse();
      const version = reversedDocument[versionId].data;
      console.log(version);
      if (!version) {
        throw new NotFoundException('Version not found');
      }

      return version;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Version not found');
    }
  }

  @Post(':id')
  async saveDocumentVersion(@Param('id') id: string) {
      const document = await this.documentModel.findById(id).exec();
      if (!document) {
          throw new NotFoundException('Document not found');
      }
  
      let versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
          versioning = await this.versioningModel.create({ _id: id, document: [] });
      }
  
      const versionDocument = new this.documentModel({
          data: document.data,
      });
  
      // Add the new version document to the versioning document's 'document' array
      versioning.document.push(versionDocument);
  
      // Check if the document array length exceeds 30
      if (versioning.document.length > 30) {
          // Remove the first document in the array
          versioning.document.shift();
      }
  
      // Save the updated versioning document
      const savedVersioning = await versioning.save();
  
      return savedVersioning;
  }

  @Delete(':id/version/:versionId')
  async deleteVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    try {
      const versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
        throw new NotFoundException('Versioning document not found');
      }
      const reversedDocument = [...versioning.document].reverse();
      const version = reversedDocument[versionId];
      if (!version) {
      throw new NotFoundException('Version not found');
      }
      
      // Remove the version from the document array
      versioning.document.splice(version, 1);
      const updatedVersioning = await versioning.save();
      return updatedVersioning;
    } catch (error) {
      console.error('Error deleting version:', error);
      throw new InternalServerErrorException('Error deleting version');
    }
  }
  
  @Put(':id/version/:versionId')
  async loadDocument (@Param('id') id: string, @Param('versionId') versionId: string) {
    try{
    const versioning = await this.versioningModel.findById(id).exec();
    if (!versioning) {
      throw new NotFoundException('Versioning document not found');
    }
    const reversedDocument = [...versioning.document].reverse();
    const data = reversedDocument[versionId].data;
    const document = await this.documentModel.findById(id).exec();
    console.log(document);
    if (!document) {
      throw new NotFoundException('document not found');
    }
    document.data= data;
    const updatedDocument = await document.save();
    
    return updatedDocument;
    }catch (error) {
      console.error('Error updating document:', error);
      throw new InternalServerErrorException('Error updating document');
    }
  }

  @Get(':id')
  async getNumberOfVersion(@Param('id') id: string) {
    try {
      // Find the versioning document by ID
      const versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
        throw new NotFoundException('Versioning document not found');
      }

      // Find the specific version by its ID
      // console.log(JSON.stringify(versioning.document));
      // console.log('versionId',versionId);
      const versionNumber = versioning.document.length;
      return versionNumber;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Version Number not found');
    }
  }
}
