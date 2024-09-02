import 'reflect-metadata';

import { Field, HideField, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { Prisma } from '@prisma/client';
import { ServerCountry } from '@prisma/client';
import { GraphQLJSON } from 'graphql-type-json';

import { BaseModel } from '../../common/models/base.model';
import { BigNumberScalar } from '../../common/scalars/bigNumber';

registerEnumType(ServerCountry, {
  name: 'ServerCountry',
  description: 'ServerCountry',
});

@ObjectType()
export class Server extends BaseModel {
  @Field(() => ServerCountry)
  type: ServerCountry;

  @Field()
  ip: string;

  @HideField()
  domain: string;

  @HideField()
  inboundId: number;

  @HideField()
  token: string;

  @HideField()
  tunnelDomain: string;

  @HideField()
  stats?: Prisma.JsonValue | null;

  @Field(() => Boolean)
  isPremium: boolean;
}

@ObjectType()
export class ServerFullInfo extends Server {
  @Field()
  country: string;

  @Field()
  flagUrl: string;
}

@ObjectType()
export class Connection extends BaseModel {
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
}
