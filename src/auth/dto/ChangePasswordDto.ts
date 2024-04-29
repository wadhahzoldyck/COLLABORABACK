import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  readonly oldpassword: string;
  @IsNotEmpty()
  @IsString()
  readonly newpassword: string;
}
