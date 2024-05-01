import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as fs from 'fs';

import { UserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/token.type';
import { JwtService } from '@nestjs/jwt';
import { Token } from './types/schema/token.schema';
import { Reset } from './schema/reset.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { NotFoundError } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import { updateProfil } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { Document } from '../document/schema/document.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    @InjectModel(Reset.name) private readonly resetModel: Model<Reset>,
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,

    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async signup(dto: UserDto, file: Express.Multer.File): Promise<Tokens> {
    try {
      const hash = await this.hashData(dto.password);

      // Read the file data and convert it to a Buffer
      const fileData = fs.readFileSync(file.path);

      const newUser = await this.userModel.create({
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        password: hash,
        profileImage: fileData, // Save the file data as binary in the database
      });

      // Generate tokens for the new user
      const tokens = await this.getTokens(newUser.id, newUser.email);

      // Update refresh token hash in the database
      await this.updateRtHash(newUser.id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      throw new BadRequestException(error.message); // Handle any other errors
    }
  }

  // async signup(dto: UserDto): Promise<Tokens> {
  //   const hash = await this.hashData(dto.password);
  //   const newUser = await this.userModel.create({
  //     firstname: dto.firstname,
  //     lastname: dto.lastname,
  //     email: dto.email,
  //     password: hash,
  //   });
  //   const tokens = await this.getTokens(newUser.id, newUser.email);
  //   await this.updateRtHash(newUser.id, tokens.refresh_token);
  //   return tokens;
  // }
  async signin(dto: LoginDto): Promise<Tokens> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) throw new ForbiddenException('Access denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Password mismatch');

    const tokens = await this.getTokens(user.id, user.email);

    const { access_token, refresh_token } = tokens;
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(
    userId: number,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    const expired_at = new Date();
    expired_at.setDate(expired_at.getDate() + 7);
    await this.tokenModel.create({
      user_id: userId,
      token: rt,
      expired_at: expired_at,
    });
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    try {
      await this.userModel.updateOne({ _id: userId }, { hashedRT: hash });
      console.log('Refresh token hash updated successfully.');
    } catch (error) {
      console.error('Error updating refresh token hash:', error);
      throw error; // You may handle the error according to your application logic
    }
  }

  async Authuser(accesstoken: string) {
    try {
      const { sub } = await this.jwtService.verifyAsync(accesstoken, {
        secret: 'at-secret',
      });

      const userData = await this.userModel
        .findOne({ _id: sub })
        .select('-password') // Exclude the password field
        .lean() // Convert the Mongoose document to a plain JavaScript object
        .exec();

      if (!userData) {
        throw new UnauthorizedException('User not found');
      }

      return userData;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
  async refreshTokens(refresh_token: string) {
    const { sub } = await this.jwtService.verifyAsync(refresh_token, {
      secret: 'rt-secret',
    });
    const tokenEntity = await this.tokenModel.findOne({
      user_id: sub,
      expired_at: { $gte: new Date() },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException();
    }
    const token = await this.jwtService.signAsync(
      {
        sub: sub,
      },
      {
        secret: 'at-secret',
        expiresIn: 60 * 60 * 24 * 7,
      },
    );
    return {
      token,
    };
  }

  async logout(refresh_token: string) {
    return this.tokenModel.deleteOne({ token: refresh_token });
  }

  async forgotPassword(email: string) {
    const token = Math.random().toString(20).substring(2, 12);
    await this.resetModel.create({ email: email, token: token });
    const url = `http://localhost:5173/reset/${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `
      <!doctype html>
      <html lang="en-US">
      
      <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Reset Password Email Template</title>
          <meta name="description" content="Reset Password Email Template.">
          <style type="text/css">
              a:hover {text-decoration: underline !important;}
          </style>
      </head>
      
      <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
          <!--100% body table-->
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
              style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
              <tr>
                  <td>
                      <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                          align="center" cellpadding="0" cellspacing="0">
                          <tr>
                              <td style="height:80px;">&nbsp;</td>
                          </tr>
      
                          <tr>
                              <td style="height:20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td>
                                  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                      style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                      <tr>
                                          <td style="padding:0 35px;">
                                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                  requested to reset your password</h1>
                                              <span
                                                  style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                  We cannot simply send you your old password. A unique link to reset your
                                                  password has been generated for you. To reset your password, click the
                                                  following link and follow the instructions.
                                              </p>
                                              <a href="${url}"
                                                  style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                  Password</a>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                  </table>
                              </td>
                          <tr>
                              <td style="height:20px;">&nbsp;</td>
                          </tr>
      
                          <tr>
                              <td style="height:80px;">&nbsp;</td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
          <!--/100% body table-->
      </body>
      
      </html>
      `,
    });
  }

  async resetPassword(token: string, password: string) {
    const reset = await this.resetModel.findOne({ token: token });

    const user = await this.userModel.findOne({ email: reset.email });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await this.userModel.updateOne(
      { _id: user._id },
      { password: hashedPassword },
      { multi: true },
    );
  }

  async searchUsers(query: string, documentId: string): Promise<User[]> {
    try {
      const document = await this.documentModel.findById(documentId).exec();
      if (!document) {
        throw new Error('Document not found');
      }

      const existingUserIds = document.usersWithAccess.map(
        (user) => user.user._id,
      );

      const regex = new RegExp(query, 'i');
      const users = await this.userModel
        .find({
          $and: [
            {
              $or: [
                { firstname: { $regex: regex } },
                { lastname: { $regex: regex } },
                { email: { $regex: regex } },
              ],
            },
            { _id: { $nin: existingUserIds } },
          ],
        })
        .lean()
        .exec();
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Error searching users');
    }
  }

  async updateProfile(userId: string, dto: updateProfil): Promise<User> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (dto.firstname) {
        user.firstname = dto.firstname;
      }

      if (dto.lastname) {
        user.lastname = dto.lastname;
      }

      if (dto.email) {
        user.email = dto.email;
      }

      await user.save();

      return user;
    } catch (error) {
      throw new BadRequestException('Error updating profile');
    }
  }

  async updatePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const passwordMatches = await bcrypt.compare(
        dto.oldpassword,
        user.password,
      );
      if (!passwordMatches) {
        throw new BadRequestException('Old password is incorrect');
      }

      console.log(passwordMatches);
      const hashedNewPassword = await bcrypt.hash(dto.newpassword, 10);

      user.password = hashedNewPassword;
      await user.save();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
