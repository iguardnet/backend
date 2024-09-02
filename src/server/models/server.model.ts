import 'reflect-metadata';

import { Field, HideField, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { Prisma } from '@prisma/client';
import { ServerCountry } from '@prisma/client';

import { BaseModel } from '../../common/models/base.model';

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

  @Field()
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
