import { IsEmail } from 'class-validator';
export class SendResetEmailDto {
  @IsEmail()
  email!: string;
}
