import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { AtStartegy, RtStartegy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { TokenSchema } from './types/schema/token.schema';
import { ResetSchema } from './schema/reset.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { DocumentSchema } from '../document/schema/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
    MongooseModule.forFeature([{ name: 'Reset', schema: ResetSchema }]),
    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema }]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'wadhah.naggui@gmail.com',
          pass: 'szsbhdbczqxytslb',
        },
      },
      defaults: {
        from: 'wadhah.naggui@gmail.com',
      },
    }),

    JwtModule.register({}),
    
  ],

  controllers: [AuthController],
  providers: [AuthService, AtStartegy, RtStartegy],
})
export class AuthModule {}
