import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { XuiModule } from '../xui/xui.module';
import { XuiService } from '../xui/xui.service';
import { ConnectionResolver } from './connection.resolver';
import { ConnectionService } from './connection.service';

@Module({
  imports: [HttpModule, XuiModule, UsersModule],
  providers: [ConnectionResolver, ConnectionService, XuiService],
})
export class ConnectionModule {}
