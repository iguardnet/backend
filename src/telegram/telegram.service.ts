import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { b64UrlToJson, extractFileName, getFileFromURL } from '../common/helpers';
import { Context } from '../common/interfaces/context.interface';
import { MinioClientService } from '../minio/minio.service';
import { HOME_SCENE_ID, REGISTER_SCENE_ID } from './telegram.constants';

interface StartPayload {
  uid?: string;
}

@Injectable()
export class TelegramService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectBot()
    private readonly bot: Telegraf<Context>,
  ) {}

  echo(text: string): string {
    return `Echo: ${text}`;
  }

  async handleStart(ctx: Context, payload: string) {
    if (payload.length > 0) {
      const params = b64UrlToJson(payload);

      console.info('params =>', params);
    }

    await ctx.scene.enter(HOME_SCENE_ID);
  }
}
