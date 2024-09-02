import 'reflect-metadata';

import { Field, HideField, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { Prisma } from '@prisma/client';
import { ServerCountry } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';

import { BaseModel } from '../../common/models/base.model';
import { BigNumberScalar } from '../../common/scalars/bigNumber';

@ObjectType()
export class Connection extends BaseModel {
  @Field()
  ip: string;

  @Field(() => ServerCountry)
  country: ServerCountry;

  @Field()
  config: string;
}

@ObjectType()
export class TrafficUsage extends BaseModel {
  @Field(() => BigNumberScalar)
  byte: bigint;

  @Field(() => BigNumberScalar)
  megabyte: bigint;

  @Field(() => BigNumberScalar)
  gigabyte: bigint;

  @Field(() => Boolean)
  isLimitReached: boolean;
}
