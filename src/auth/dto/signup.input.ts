import { Field, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsUUID, Matches, MinLength } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  @Matches(/^9\d{9}$/)
  phone: string;

  @Field()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
