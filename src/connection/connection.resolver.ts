import { NotAcceptableException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ServerCountry } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { BigNumberScalar } from '../common/scalars/bigNumber';
import { User } from '../users/models/user.model';
import { ConnectionService } from './connection.service';
import { CreateServerInput } from './dto/createServer.input';
import { Connection, Server, TrafficUsage } from './models/connection.model';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ConnectionResolver {
  constructor(private connectionService: ConnectionService, private prisma: PrismaService) {}

  @Query(() => [Server])
  servers(@UserEntity() _user: User): Promise<Server[]> {
    return this.connectionService.getAvailableServer();
  }

  @Query(() => TrafficUsage)
  getUsage(@UserEntity() user: User): Promise<TrafficUsage> {
    return this.connectionService.getUsage(user);
  }

  @Mutation(() => Connection)
  getConnection(@UserEntity() user: User, @Args('country') country: string): Promise<Connection> {
    return this.connectionService.getConnection(user, country as ServerCountry);
  }

  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => Domain)
  // issueCert(@UserEntity() _user: User, @Args('data') data: IssueCertInput): Promise<Domain> {
  //   return this.serverService.issueCert(data);
  // }

  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => Server)
  // addServer(@UserEntity() _user: User, @Args('data') data: CreateServerInput): Promise<Server> {
  //   return this.serverService.createServer(data);
  // }

  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => Boolean)
  // updateLetsEncryptSslStates(@UserEntity() _user: User): boolean {
  //   void this.serverService.updateLetsEncryptSslStates();

  //   return true;
  // }
}
