import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { GooglePlayController } from './googlePlay.controller';

@Module({
  imports: [AuthModule],
  controllers: [GooglePlayController],
})
export class GooglePlayModule {}
