import { Module } from '@nestjs/common';

import { PasswordService } from '../auth/password.service';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  providers: [UsersResolver, UsersService, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}
