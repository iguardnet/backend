import 'reflect-metadata';

import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { Prisma } from '@prisma/client';
import { Role } from '@prisma/client';

import { BaseModel } from '../../common/models/base.model';
import { BigNumberScalar } from '../../common/scalars/bigNumber';

export enum GoogleSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELED_BY_USER = 'CANCELED_BY_USER',
  CANCELED_BY_SYSTEM = 'CANCELED_BY_SYSTEM',
  REPLACED = 'REPLACED',
  CANCELED_BY_DEVELOPER = 'CANCELED_BY_DEVELOPER',
  REFUNDED = 'REFUNDED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  FREE_TRIAL = 'FREE_TRIAL',
  PENDING_UPGRADE_DOWNGRADE = 'PENDING_UPGRADE_DOWNGRADE',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(GoogleSubscriptionStatus, {
  name: 'GoogleSubscriptionStatus',
  description: 'Google Subscription Status',
});

@ObjectType()
export class GoogleSubscription extends BaseModel {
  @Field(() => GoogleSubscriptionStatus)
  status: GoogleSubscriptionStatus;

  @Field()
  subscriptionId: string;

  @Field()
  kind: string;

  @Field()
  startTimeMillis: Date;

  @Field()
  expiryTimeMillis: Date;

  @Field(() => Boolean)
  autoRenewing: boolean;

  @Field()
  priceCurrencyCode: string;

  @Field(() => BigNumberScalar)
  priceAmountMicros: bigint;

  @Field()
  countryCode: string;

  @Field()
  developerPayload: string;

  @Field()
  orderId: string;

  @Field(() => Int)
  acknowledgementState: number;
}
