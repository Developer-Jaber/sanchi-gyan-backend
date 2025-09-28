import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString()
  @IsOptional() // Name is optional
  name?: string;

  @IsInt({ message: 'Role ID must be an integer' })
  roleId: number; // e.g., 1 for Student (seed roles in DB)
}
