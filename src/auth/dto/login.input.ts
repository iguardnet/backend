import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @Matches(/^9\d{9}$/)
  phone: string;

  @Field()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
