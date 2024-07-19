import 'reflect-metadata';

import { Field, Float, HideField, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { IsMobilePhone } from 'class-validator';

import { BaseModel } from '../../common/models/base.model';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role',
});

@ObjectType()
export class User extends BaseModel {
  @Field()
  @IsMobilePhone()
  phone: string;

  @Field(() => String)
  firstname: string;

  @Field(() => String)
  lastname: string;

  @Field(() => Role)
  role: Role;

  @HideField()
  password: string;
}
