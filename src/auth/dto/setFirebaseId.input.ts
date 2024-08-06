import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class SetFirebaseIdInput {
  @Field()
  @IsNotEmpty()
  firebaseId: string;

  @Field()
  @IsNotEmpty()
  deviceId: string;
}
