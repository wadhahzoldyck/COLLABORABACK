// versioning.controller.ts
import { Controller, Get, Post, Delete, Param, NotFoundException, InternalServerErrorException, Put, Body, Res, Query, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document as DocumentModel } from '../document/schema/document.schema';
import { Versioning } from './schema/versioning.schema';
import { AddHistoryDto } from './dto/versioning.dto';



interface Inserts {
  ops: { insert: string }[]; // Define the structure of 'ops' array
}

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
      const document = await this.documentModel.findById(id).populate('owner').exec();
      if (!document) {
          throw new NotFoundException('Document not found');
      }
  
      let versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
          versioning = await this.versioningModel.create({ _id: id, document: [] });
      }
      console.log(document)
  
      const versionDocument = new this.documentModel({
        owner:document.owner,
          data: document.data,
          documentName: document.documentName,
      });
      console.log(document.owner);
      console.log(document.documentName);
  
      
      versioning.document.push(versionDocument);
  
   
      if (versioning.document.length > 30) {

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
  
  @Get(':id/compare/:versionId1/:versionId2')
  async compareVersions(
    @Param('id') id: string,
    @Param('versionId1') versionId1: string,
    @Param('versionId2') versionId2: string
  ) {
    try {
      // Find the versioning document by ID
      const versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
        throw new NotFoundException('Versioning document not found');
      }
  
      // Get the data of the specified versions
      const reversedDocument = [...versioning.document].reverse();
      const versionData1 = reversedDocument[versionId1]?.data?.ops; // Access the 'ops' array
      const versionData2 = reversedDocument[versionId2]?.data?.ops; // Access the 'ops' array
  
      // Check if both versions exist
      if (!versionData1 || !versionData2) {
        throw new NotFoundException('One or both versions not found');
      }
  
      // Compare the data of the two versions using the compare function
      const comparisonResult = this.compare(versionData1, versionData2);
      console.log("hi",comparisonResult)
  
      return comparisonResult;
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw new InternalServerErrorException('Error comparing versions');
    }
  }
  
  private compare(versionData1: any[], versionData2: any[]): any[] {
    const comparisonResult = [];
  
    // Determine the maximum length of the arrays
    const maxLength = Math.max(versionData1.length, versionData2.length);
  
    // Iterate over the arrays of objects in each version's data
    for (let i = 0; i < maxLength; i++) {
      const insert1 = versionData1[i]?.insert || '';
      const insert2 = versionData2[i]?.insert || '';
      
      // Compare the inserts in each array item
      if (insert1 === insert2) {
        // Inserts are identical, no difference
        comparisonResult.push({ insert: insert1, difference: 'identical' });
      } else {
        // Inserts are different, highlight the differences
        comparisonResult.push({ insert: insert1, difference: 'different' });
  
        // Compare the inserts and underline the different part
        let underlineIndex = 0;
        while (insert1[underlineIndex] === insert2[underlineIndex]) {
          underlineIndex++;
        }
        const difference = `${insert2.substring(underlineIndex)}`;
        comparisonResult.push({ insert: difference, difference: 'different' });
      }
    }
  
    console.log(comparisonResult);
  
    return comparisonResult;
  }

  @Post(':id/history')
  async addHistory(@Param('id') id: string, @Body() addHistoryDto: AddHistoryDto) {
    try {
      const versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
        throw new NotFoundException('Versioning document not found');
      }


      versioning.history.push(addHistoryDto);
      

      const updatedVersioning = await versioning.save();
  
      return updatedVersioning;
    } catch (error) {
      console.error('Error adding history:', error);
      throw new InternalServerErrorException('Error adding history');
    }
  }

  @Get(':id/history')
  async getHistoryList(@Param('id') id: string) {
    try {
      const versioning = await this.versioningModel.findById(id).exec();
      if (!versioning) {
        throw new NotFoundException('Versioning document not found');
      }

      // Return the history array
      return versioning.history;
    } catch (error) {
      console.error('Error retrieving history:', error);
      throw new InternalServerErrorException('Error retrieving history');
    }
  }


  @Get(':id/text')
  async getText(@Param('id') id: string): Promise<any> {
    try {

      const doc = await this.documentModel.findById(id).exec();
      let TransformersApi  = Function('return import("@xenova/transformers")')();
   
      const insets: any = doc.data;
      if (!insets) {
        throw new NotFoundException('Versioning document not found');
      }

      // Log the insets to see its structure
      console.log("Insets:", insets);

      // Access the 'ops' array if it exists
      const ops = insets.ops || [];

      let concatenatedText = '';
      for (const op of ops) {
        concatenatedText += op.insert;
      }
      console.log(concatenatedText);
      const { pipeline, env } = await TransformersApi;
            const pipe = await pipeline("summarization","Xenova/distilbart-cnn-6-6");


      const result = await pipe(concatenatedText,{max_length: 30}); 
      result[1]=doc.documentName;
      console.log("result",result);
      console.log("fama summary")
      return result;
    } catch (error) {
      console.error("Error in getText:", error);
      throw error; // Handle the error appropriately
    }
  }







  @Get(':id/translate')
  async getTranslation(@Param('id') id: string): Promise<any> {
    try {

      const doc = await this.documentModel.findById(id).exec();
      let TransformersApi  = Function('return import("@xenova/transformers")')();
   
      const insets: any = doc.data;
      if (!insets) {
        throw new NotFoundException('data document not found');
      }

      // Log the insets to see its structure
      console.log("Insets:", insets);

      // Access the 'ops' array if it exists
      const ops = insets.ops || [];

      let concatenatedText = '';
      for (const op of ops) {if(!op.insert.video || !op.insert.image )
        concatenatedText += op.insert;
      }
      console.log(concatenatedText);
      const { pipeline, env } = await TransformersApi;
    
      let pipe = await pipeline('translation');

      let result = await pipe(concatenatedText, {
        src_lang: 'eng_Latn',
        tgt_lang: 'ell_Grek'
        });
      console.log("result",result);
      console.log("fama traslate")
      return result;
    } catch (error) {
      console.error("Error in getText:", error);
      throw error; // Handle the error appropriately
    }
  }








  @Get(':id/image')
  async getImageToText(@Param('id') id: string): Promise<any> {
    try {
      const doc = await this.documentModel.findById(id).exec();
      let TransformersApi = Function('return import("@xenova/transformers")')();

      const insets: any = doc.data;
      if (!insets) {
        throw new NotFoundException('data document not found');
      }

      // Access the 'ops' array if it exists
      const ops = insets.ops || [];
      

      let image = '';
      for (const op of ops) {
        image += op.insert.image;
      }
     
      console.log("Image:", image);

      // Transform the image to text
      const { pipeline } = await TransformersApi;
      const pipe = await pipeline('image-to-text');

      console.log("Text from image:", pipe);

      // // Convert image to JPG using sharp
      // const jpgBuffer = await sharp(Buffer.from(image, 'base64')).toFormat('jpeg').toBuffer();
      const base64ImageData = image.toString;
      const result = await pipe(base64ImageData);
      console.log("result hathy heya", result);
      // Send the JPG image as response
      return result;
    } catch (error) {
      console.error("Error in getImageToText:", error);
    }
  }





  @Get(':id/answer')
  async getanswer(@Param('id') id: string,@Query('question') question: string): Promise<any> {
    try {

      const doc = await this.documentModel.findById(id).exec();
      let TransformersApi  = Function('return import("@xenova/transformers")')();
   
      const insets: any = doc.data;
      if (!insets) {
        throw new NotFoundException('data document not found');
      }

      // Log the insets to see its structure
      console.log("Insets:", insets);

      // Access the 'ops' array if it exists
      const ops = insets.ops || [];

      let concatenatedText = '';
      for (const op of ops) {if(!op.insert.video || !op.insert.image )
        concatenatedText += op.insert;
      }
      console.log(concatenatedText);
      const { pipeline, env } = await TransformersApi;
      let pipe = await pipeline('question-answering');     
      console.log("text",concatenatedText ) 
      console.log(question)
      let result = pipe(question,concatenatedText)
      console.log("result",result);
      console.log("fama answer")
      return result;
    } catch (error) {
      console.error("Error in getText:", error);
      throw error; // Handle the error appropriately
    }
}
}
