import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from 'nestjs-prisma';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { ChangePasswordInput } from './dto/change-password.input';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(private usersService: UsersService, private prisma: PrismaService) {}

  // @UseGuards(GqlAuthGuard)
  // @Query(() => User)
  // me(@UserEntity() user: User) {
  //   return this.usersService.getUser(user);
  // }

  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => User)
  // async changePassword(@UserEntity() user: User, @Args('data') changePassword: ChangePasswordInput) {
  //   return this.usersService.changePassword(user.id, user.password, changePassword);
  // }
}
