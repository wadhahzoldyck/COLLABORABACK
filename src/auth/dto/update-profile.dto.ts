import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class updateProfil {
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
}
