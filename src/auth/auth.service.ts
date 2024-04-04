
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

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

  async signup(dto: UserDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const newUser = await this.userModel.create({
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      password: hash,
    });
    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    return tokens;
  }

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
    const url = `http://localhost:3000/reset/${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `
      Click <a href="${url}">here</a> to reset your password.
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

  async searchUsersNotInDocument(documentId: string, query: string): Promise<User[]> {
    try {
      const regex = new RegExp(query, 'i'); // Case-insensitive regex
  
      // Find users matching the search query
      const users = await this.userModel.find({
        $or: [
          { firstname: { $regex: regex } },
          { lastname: { $regex: regex } },
          { email: { $regex: regex } },
        ],
      }).exec();
  
      // Find the document by ID and get its usersWithAccess
      const document = await this.documentModel
        .findById(documentId)
        .select('usersWithAccess')
        .exec();
  
      // Extract user IDs from the document's usersWithAccess
      const documentUserIds = document.usersWithAccess.map(user => user._id.toString());
  
      // Filter out users that are already in the document's access list
      const usersNotInDocument = users.filter(user => !documentUserIds.includes(user._id.toString()));
  
      return usersNotInDocument;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Error searching users');
    }
  }
  
}
