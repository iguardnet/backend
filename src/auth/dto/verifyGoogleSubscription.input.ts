import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

@InputType()
export class VerifyGoogleSubscriptionInput {
  @Field()
  purchaseToken: string;

  @Field()
  packageName: string;

  @Field()
  subscriptionId: string;
}
