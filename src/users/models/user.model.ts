import 'reflect-metadata';

import { Field, Float, HideField, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { Prisma } from '@prisma/client';
import { Role, SignInProvider } from '@prisma/client';
import { IsMobilePhone } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { BaseModel } from '../../common/models/base.model';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role',
});

registerEnumType(SignInProvider, {
  name: 'SignInProvider',
  description: 'SignInProvider',
});

@ObjectType()
export class User extends BaseModel {
  @Field(() => String, { nullable: true })
  @IsMobilePhone()
  phone?: string | null;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => Role)
  role: Role;

  @HideField()
  password?: string | null;

  @Field(() => String, { nullable: true })
  firebaseId?: string | null;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  deviceId?: string | null;

  @Field(() => SignInProvider, { nullable: true })
  signInProvider?: SignInProvider | null;

  @Field(() => Boolean, { nullable: true })
  emailVerified?: boolean | null;
}

@ObjectType()
export class ClientInfo extends BaseModel {
  @Field(() => GraphQLJSON, { nullable: true })
  android?: Prisma.JsonValue | null;

  @Field(() => GraphQLJSON, { nullable: true })
  ios?: Prisma.JsonValue | null;
}

@ObjectType()
export class UserWithClientInfo extends User {
  @Field(() => ClientInfo, { nullable: true })
  clientInfo?: ClientInfo | null;
}
