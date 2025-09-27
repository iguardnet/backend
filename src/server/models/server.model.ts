import 'reflect-metadata';

import { Field, HideField, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { InboundType, Prisma, ServerCountry } from '@prisma/client';

import { BaseModel } from '../../common/models/base.model';

registerEnumType(ServerCountry, {
  name: 'ServerCountry',
  description: 'ServerCountry',
});

registerEnumType(InboundType, {
  name: 'InboundType',
  description: 'InboundType',
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

  @Field()
  tunnelDomain: string;

  @Field(() => Int)
  port: number;

  @Field(() => InboundType)
  inboundType: InboundType;

  @HideField()
  stats?: Prisma.JsonValue | null;

  @Field(() => Boolean)
  isPremium: boolean;

  // @Field(() => String)
  // pingURL?: string | null;
}

@ObjectType()
export class ServerFullInfo extends Server {
  @Field()
  country: string;

  @Field()
  flagUrl: string;
}
