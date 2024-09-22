import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import type { Request as RequestType } from 'express';
import { PrismaService } from 'nestjs-prisma';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { FullUser, GoogleAllSubscriptions, User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(private usersService: UsersService, private prisma: PrismaService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => FullUser)
  me(@UserEntity() user: User, @Context() context: { req: RequestType }): Promise<FullUser> {
    return this.usersService.getFullUser(user, context.req);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => GoogleAllSubscriptions)
  googleSubscriptions(@UserEntity() user: User): Promise<GoogleAllSubscriptions> {
    return this.usersService.getGoogleSubscriptions(user);
  }

  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => User)
  // async changePassword(@UserEntity() user: User, @Args('data') changePassword: ChangePasswordInput) {
  //   return this.usersService.changePassword(user.id, user.password, changePassword);
  // }
}
