import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { Tokens } from './types/token.type';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './types/schema/token.schema';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { updateProfil } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
  ) {}
  @Post('signup')
  async signup(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UserDto,
  ): Promise<any> {
    if (dto.password !== dto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Include file handling logic as necessary, for example, saving the file path to the database
    if (file) {
      dto.profileImage = file;
    }

    return this.authService.signup(dto, file);
  }

  // @Post('/signup')
  // signup(@Body() dto: UserDto): Promise<Tokens> {
  //   if (dto.password !== dto.confirm_password) {
  //     throw new BadRequestException('Password does not match');
  //   }
  //   return this.authService.signup(dto);
  // }
  @Post('/signin')
  async signin(
    @Body() dto: LoginDto,
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
    console.log(tokens);

    return tokens;
  }

  @UseGuards(AuthGuard('jwt'))
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
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const accessToken = authorizationHeader.replace('Bearer ', '');
    return this.authService.Authuser(accessToken);
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

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('documentId') documentId: string,
  ) {
    try {
      const users = await this.authService.searchUsers(query, documentId);
      console.log(users);
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Error searching users');
    }
  }

  @Get('search/workspace')
  async searchUsers2(
    @Query('q') query: string
  ) {
    try {
      const users = await this.authService.searchUsers2(query);
      console.log(users);
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Error searching users');
    }
  }

  

  @Put('profile/:userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: updateProfil,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Put('password/:userId')
  async updatePassword(
    @Param('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    try {
      await this.authService.updatePassword(userId, dto);
    } catch (error) {
      throw error;
    }
  }
}
