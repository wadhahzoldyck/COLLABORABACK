import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { Tokens } from './types/token.type';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './types/schema/token.schema';
import { Model } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
  ) {}

  @Post('/signup')
  signup(@Body() dto: UserDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  @Post('/signin')
  async signin(
    @Body() dto: UserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Await the signin method call to get the Tokens object
    const tokens: Tokens = await this.authService.signin(dto);
    console.log(tokens.refresh_token);
    response.status(200);
    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, //1 week
    });
    return tokens;
  }

  @Post('/logout')
  logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    this.authService.logout(request.cookies['refresh_token']);
    const refresh_token = response.clearCookie('refresh_token');
    return {
      message: 'success',
    };
  }

  @Get('/user')
  authentifaction(@Req() request: Request) {
    const accesToken = request.headers.authorization.replace('Bearer ', '');
    return this.authService.Authuser(accesToken);
  }

  @Post('/refresh')
  refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = request.cookies['refresh_token'];
      console.log(refreshToken);
      response.status(200);
      return this.authService.refreshTokens(refreshToken);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  @Post('forgot')
  forgotPassword(@Body('email') email: string) {
    this.authService.forgotPassword(email);
    return {
      message: 'Check your Email',
    };
  }

  @Post('reset')
  reset(
    @Body('token') token: string,
    @Body('password') password: string,
    @Body('confirm_password') password_confirm: string,
  ) {
    if (password !== password_confirm) {
      throw new BadRequestException('Password does not match');
    }
    this.authService.resetPassword(token, password);
    
    return {
      message: 'Password updated successfully',
    };
  }
}
