import { Optional, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { Request as RequestType } from 'express';

import { GqlAuthGuard, OptionalGqlAuthGuard } from '../auth/gql-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { User } from '../users/models/user.model';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SetFirebaseIdInput } from './dto/setFirebaseId.input';
import { SignupInput } from './dto/signup.input';
import { Auth } from './models/auth.model';
import { Login } from './models/login.model';
import { Token } from './models/token.model';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => String)
  async setFirebaseId(@Args('input') input: SetFirebaseIdInput): Promise<string> {
    await this.auth.setFirebaseId(input);

    return 'OK';
  }

  @Query(() => String)
  async getCustomToken(@Args('deviceId') deviceId: string): Promise<string> {
    return this.auth.getCustomToken(deviceId);
  }

  // @UseGuards(OptionalGqlAuthGuard)
  // @Mutation(() => Auth)
  // async signup(@UserEntity() _user: User, @Args('data') data: SignupInput, @Context() context: { req: RequestType }) {
  //   const { accessToken, refreshToken } = await this.auth.createUser(data, context.req);

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  // @Mutation(() => Login)
  // async login(@Args('data') { phone, password }: LoginInput, @Context() context: { req: RequestType }): Promise<Login> {
  //   return this.auth.login(phone.toLowerCase(), password, context.req);
  // }

  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => Boolean)
  // logout(@Context() context: { req: RequestType }): boolean {
  //   this.auth.logout(context.req);

  //   return true;
  // }

  // @Mutation(() => Token)
  // refreshToken(@Args() { token }: RefreshTokenInput) {
  //   return this.auth.refreshToken(token);
  // }

  // @ResolveField('user', () => User)
  // async user(@Parent() auth: Auth) {
  //   return this.auth.getUserFromToken(auth.accessToken);
  // }
}
