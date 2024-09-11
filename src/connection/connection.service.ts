/* eslint-disable max-len */
import { BadRequestException, Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerCountry } from '@prisma/client';
import type { Request as RequestType } from 'express';
import fs from 'fs';
import { customAlphabet } from 'nanoid';
import { PrismaService } from 'nestjs-prisma';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { v4 as uuid } from 'uuid';

import { PostgresConfig, TelGroup } from '../common/configs/config.interface';
import { errors } from '../common/errors';
import { bytesToGB, bytesToMB, getCountryName, getVlessLink } from '../common/helpers';
import { Context } from '../common/interfaces/context.interface';
import { MinioClientService } from '../minio/minio.service';
import { Server, ServerFullInfo } from '../server/models/server.model';
import { User } from '../users/models/user.model';
import { XuiService } from '../xui/xui.service';
import { Connection, TrafficUsage } from './models/connection.model';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly minioService: MinioClientService,
    private readonly xuiService: XuiService,
  ) {
    // setTimeout(() => {
    //   (async () => {
    //     const user = await this.prisma.user.findFirst();
    //     void this.getConnection(user, 'FI');
    //   })();
    // }, 2000);
  }

  private readonly logger = new Logger(ConnectionService.name);

  private readonly backupGroup = this.configService.get<TelGroup>('telGroup')!.backup;

  async getAvailableServer(req: RequestType): Promise<ServerFullInfo[]> {
    const servers = await this.prisma.server.findMany({ where: { deletedAt: null } });
    const host = req.get('host');

    return servers.map((server) => ({
      ...server,
      country: getCountryName(server.type),
      flagUrl: `https://${host}/file/iguard/countries/${server.type.toLowerCase()}.png`,
      pingURL: `https://${server.domain}/v`,
    }));
  }

  getBestServer(country: ServerCountry): Promise<Server> {
    return this.prisma.server.findFirstOrThrow({ where: { type: country } });
  }

  async getUsage(user: User): Promise<TrafficUsage> {
    const id = uuid();
    let totalUsage = BigInt(0);
    let lastTotalUsage = BigInt(0);

    const clientInfo = await this.prisma.clientInfo.findFirst();

    const userStats = await this.prisma.clientStat.findMany({
      where: { userId: user.id, deletedAt: null },
    });

    for (const stat of userStats) {
      totalUsage += BigInt(stat.down) + BigInt(stat.up);
      lastTotalUsage += BigInt(stat.lastTotalUsage || 0);
    }

    const byte = totalUsage - lastTotalUsage;
    const dailyTrafficLimit = (clientInfo?.android as JsonObject)?.dailyTrafficLimit || 0;
    const isLimitReached = dailyTrafficLimit * 1024 * 1024 < byte;

    return {
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      byte,
      megabyte: bytesToMB(byte),
      gigabyte: bytesToGB(byte),
      isLimitReached,
    };
  }

  async getConnection(user: User, country: ServerCountry): Promise<Connection> {
    const server = await this.getBestServer(country);

    if (user.role === 'USER' && server.isPremium) {
      throw new NotAcceptableException(`${country} server is for premium users only.`);
    }

    const alreadyConnection = await this.prisma.clientStat.findFirst({
      where: {
        deletedAt: null,
        userId: user.id,
        server: {
          type: country,
        },
      },
      include: {
        server: true,
      },
    });

    if (alreadyConnection) {
      // to do => should double check with Xray core to make sure

      return {
        id: alreadyConnection.id,
        ip: server.ip,
        config: getVlessLink(alreadyConnection.id, alreadyConnection.server.tunnelDomain, country),
        country,
        createdAt: alreadyConnection.createdAt,
        updatedAt: alreadyConnection.updatedAt,
      };
    }

    const newConnection = await this.xuiService.addClient(user, { serverId: server.id });

    return {
      id: newConnection.id,
      ip: server.ip,
      config: getVlessLink(newConnection.id, server.tunnelDomain, country),
      country,
      createdAt: newConnection.createdAt,
      updatedAt: newConnection.updatedAt,
    };
  }
}
