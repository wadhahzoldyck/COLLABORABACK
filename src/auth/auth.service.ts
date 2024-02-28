import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/token.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: UserDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const newUser = await this.userModel.create({
      email: dto.email,
      password: hash,
    });
    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    return tokens;
  }
  async signin(dto: UserDto): Promise<Tokens> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) throw new ForbiddenException('Access denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Password mismatch');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }
  logout() {}
  refreshTokens() {}
  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string) {
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
}
