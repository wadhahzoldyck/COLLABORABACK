import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Multer } from 'multer';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  readonly confirm_password: string;
  profileImage: Express.Multer.File;
}
