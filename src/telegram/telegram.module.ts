import { Module } from '@nestjs/common';

import { HomeScene } from './scenes/home.scene';
import { RegisterScene } from './scenes/register.scene';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';

@Module({
  providers: [TelegramService, TelegramUpdate, RegisterScene, HomeScene],
})
export class TelegramModule {}
