import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Command, Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { TelegrafExceptionFilter } from '../common/filters/telegraf-exception.filter';
import { AdminGuard } from '../common/guards/admin.guard';
import { b64UrlToJson } from '../common/helpers';
import { ResponseTimeInterceptor } from '../common/interceptors/response-time.interceptor';
import { Context } from '../common/interfaces/context.interface';
import { TelegramService } from './telegram.service';

@Update()
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  async onStart(@Ctx() ctx: Context, @Message('text') msg: string): Promise<void> {
    const payload = msg.slice(6);

    await this.telegramService.handleStart(ctx, payload);
  }

  @On('callback_query')
  onCallbackQuery(@Ctx() ctx: Context): void {
    const callbackData = (ctx.callbackQuery as { data: string })?.data;
    const parsed = b64UrlToJson(callbackData);

    console.info('Parsed', parsed);
  }

  @Command('admin')
  @UseGuards(AdminGuard)
  onAdminCommand(): string {
    return 'Welcome judge';
  }
}
