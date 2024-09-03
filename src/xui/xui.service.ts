/* eslint-disable max-len */
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { ClientStat as PrismaClientStat, Prisma, Server } from '@prisma/client';
import { AxiosRequestConfig } from 'axios';
import * as Cookie from 'cookie';
import https from 'https';
import { customAlphabet } from 'nanoid';
import { PrismaService } from 'nestjs-prisma';
import { InjectBot } from 'nestjs-telegraf';
import PQueue from 'p-queue';
import { firstValueFrom } from 'rxjs';
import { Telegraf } from 'telegraf';
import { v4 as uuid } from 'uuid';

import { TelGroup } from '../common/configs/config.interface';
import { errors } from '../common/errors';
import {
  excludeFromArr,
  getDateTimeString,
  isSessionExpired,
  isUUID,
  jsonObjectToQueryString,
} from '../common/helpers';
import { Context } from '../common/interfaces/context.interface';
import { User } from '../users/models/user.model';
import { GetClientStatsFiltersInput } from './dto/getClientStatsFilters.input';
import { ClientStat } from './models/clientStat.model';
import {
  AddClientInput,
  AuthenticatedReq,
  InboundListRes,
  InboundSetting,
  OnlineInboundRes,
  ServerStat,
  Stat,
  UpdateClientInput,
  UpdateClientReqInput,
} from './xui.types';

const ENDPOINTS = (domain: string) => {
  const url = `https://${domain}/v`;

  return {
    login: `${url}/login`,
    inbounds: `${url}/panel/inbound/list`,
    onlines: `${url}/panel/inbound/onlines`,
    addInbound: `${url}/panel/inbound/add`,
    addClient: `${url}/panel/inbound/addClient`,
    updateClient: (id: string) => `${url}/panel/inbound/updateClient/${id}`,
    resetClientTraffic: (email: string, inboundId: number) =>
      `${url}/panel/inbound/${inboundId}/resetClientTraffic/${email}`,
    delClient: (id: string, inboundId: number) => `${url}/panel/inbound/${inboundId}/delClient/${id}`,
    serverStatus: `${url}/server/status`,
    getDb: `${url}/server/getDb`,
  };
};

@Injectable()
export class XuiService {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    private prisma: PrismaService,
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // setTimeout(() => {
    //   void this.resetTrafficUsage();
    // }, 2000);
  }

  private readonly logger = new Logger(XuiService.name);

  private readonly backupGroup = this.configService.get<TelGroup>('telGroup')!.backup;

  private readonly reportGroup = this.configService.get<TelGroup>('telGroup')!.report;

  async login(domain: string): Promise<string> {
    try {
      const password = this.configService.get('xui').password;
      const login = await firstValueFrom(
        this.httpService.post<{ success: boolean }>(ENDPOINTS(domain).login, `username=mamad&password=${password}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        }),
      );
      const cookie = login?.headers['set-cookie']?.[1];

      if (!cookie) {
        throw new NotFoundException(errors.xui.accountNotFound);
      }

      return cookie;
    } catch (_error) {
      const error = _error as { response?: string };

      if (error?.response) {
        console.error(error.response);
      }

      throw new BadRequestException();
    }
  }

  async getAuthorization(serverId: string): Promise<[string, Server]> {
    const server = await this.prisma.server.findUniqueOrThrow({ where: { id: serverId, deletedAt: null } });

    if (!isSessionExpired(server.token)) {
      return [`3x-ui=${Cookie.parse(server.token)['3x-ui']}`, server];
    }

    const token = await this.login(server.domain);

    await this.prisma.server.update({
      where: {
        id: serverId,
        deletedAt: null,
      },
      data: {
        token,
      },
    });

    return [`3x-ui=${Cookie.parse(token)['3x-ui']}`, server];
  }

  async authenticatedReq<T>({ serverId, url, method, body, headers, isBuffer }: AuthenticatedReq) {
    const [auth, server] = await this.getAuthorization(serverId);

    const config: AxiosRequestConfig = {
      headers: { ...(headers || {}), cookie: auth },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      maxContentLength: 10_485_760,
      ...(isBuffer && { responseType: 'arraybuffer' }),
    };

    return firstValueFrom(
      method === 'get'
        ? this.httpService.get<T>(url(server.domain), config)
        : this.httpService[method]<T>(url(server.domain), body, config),
    );
  }

  async getInbounds(serverId: string): Promise<Stat[]> {
    const inbounds = await this.authenticatedReq<InboundListRes>({
      serverId,
      url: (domain) => ENDPOINTS(domain).inbounds,
      method: 'post',
    });

    if (!inbounds.data.obj) {
      throw new BadRequestException('Getting DNS records failed.');
    }

    const clientStats: Stat[] = [];
    inbounds.data.obj.forEach((item) => {
      const setting = JSON.parse(item.settings) as InboundSetting;
      clientStats.push(
        ...item.clientStats.map((stat) => ({
          ...stat,
          ...setting.clients.filter((i) => i.id).find((client) => client.email === stat.email)!,
          port: item.port,
        })),
      );
    });

    return clientStats.filter((i) => i.id);
  }

  async getOnlinesInbounds(serverId: string): Promise<string[]> {
    const inbounds = await this.authenticatedReq<OnlineInboundRes>({
      serverId,
      url: (domain) => ENDPOINTS(domain).onlines,
      method: 'post',
    });

    if (!inbounds.data.obj) {
      return [];
    }

    return inbounds.data.obj;
  }

  async resetClientTraffic(clientStatId: string) {
    const clientStat = await this.prisma.clientStat.findUniqueOrThrow({
      where: { id: clientStatId },
      include: { server: true },
    });

    const res = await this.authenticatedReq<{ success: boolean }>({
      serverId: clientStat.server.id,
      url: (domain) => ENDPOINTS(domain).resetClientTraffic(clientStat.email, clientStat.server.inboundId),
      method: 'post',
    });

    if (!res.data.success) {
      throw new BadRequestException(errors.xui.addClientError);
    }
  }

  async deleteClient(clientStatId: string) {
    const clientStat = await this.prisma.clientStat.findUniqueOrThrow({
      where: { id: clientStatId },
      include: { server: true },
    });

    const res = await this.authenticatedReq<{ success: boolean }>({
      serverId: clientStat.server.id,
      url: (domain) => ENDPOINTS(domain).delClient(clientStat.id, clientStat.server.inboundId),
      method: 'post',
    });

    if (!res.data.success) {
      throw new BadRequestException(errors.xui.addClientError);
    }
  }

  async upsertClientStats(stats: Stat[], serverId: string, onlinesStat: string[]) {
    if (stats.length === 0) {
      return; // Nothing to upsert
    }

    const onlineStatDic = stats.reduce<Record<number, Date>>(
      (dic, stat) => (onlinesStat.includes(stat.email) ? { ...dic, [stat.id]: Date.now() } : dic),
      {},
    );

    const updatedValues: Prisma.Sql[] = [];

    // ? Prisma.sql`to_timestamp(${onlineStatDic[stat.id]} / 1000.0)`

    for (const stat of stats) {
      const lastConnectedAtSQL = onlineStatDic[stat.id]
        ? Prisma.sql`to_timestamp(${onlineStatDic[stat.id]} / 1000.0)`
        : Prisma.sql`NULL::timestamp`;

      const statSql = Prisma.sql`(${stat.id}::uuid, ${serverId}::uuid, ${stat.enable}, ${stat.email}, ${stat.up}, ${
        stat.down
      }, ${stat.total}, ${stat.expiryTime}, to_timestamp(${Date.now()} / 1000.0), ${stat.flow}, ${stat.subId}, ${
        stat.tgId
      }, ${stat.limitIp || 0}, ${lastConnectedAtSQL})`;
      updatedValues.push(statSql);
    }

    try {
      await this.prisma.$queryRaw`
        UPDATE "ClientStat" AS cs
        SET
          "serverId" = v."serverId",
          "enable" = v."enable",
          email = v.email,
          up = v.up,
          down = v.down,
          total = v.total,
          "expiryTime" = v."expiryTime",
          "updatedAt" = v."updatedAt",
          "flow" = v."flow",
          "subId" = v."subId",
          "tgId" = v."tgId",
          "limitIp" = v."limitIp",
          "lastConnectedAt" = CASE WHEN v."lastConnectedAt" IS NOT NULL THEN v."lastConnectedAt" ELSE cs."lastConnectedAt" END
        FROM (
          VALUES ${Prisma.join(updatedValues)}
        ) AS v(id, "serverId", "enable", email, up, down, total, "expiryTime", "updatedAt", "flow", "subId", "tgId", "limitIp", "lastConnectedAt")
        WHERE cs.id = v.id
      `;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.toString() : String(error);
      console.error('Error update ClientStats:', errorMessage);
      await this.bot.telegram.sendMessage(this.reportGroup, `Error update ClientStats.\n\n${errorMessage}`);
    }
  }

  async addClient(user: User, input: AddClientInput): Promise<PrismaClientStat> {
    const server = await this.prisma.server.findUniqueOrThrow({ where: { id: input.serverId } });

    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);
    const email = `${user.id}__${nanoid()}`;
    const id = uuid();
    const subId = nanoid();
    const jsonData = {
      id: server.inboundId,
      settings: {
        clients: [
          {
            id,
            flow: '',
            email,
            limitIp: 0,
            totalGB: 0,
            expiryTime: 0,
            enable: true,
            tgId: '',
            subId,
          },
        ],
      },
    };

    const params = jsonObjectToQueryString(jsonData);

    const res = await this.authenticatedReq<{ success: boolean }>({
      serverId: input.serverId,
      url: (domain) => ENDPOINTS(domain).addClient,
      method: 'post',
      body: params,
    });

    if (!res.data.success) {
      await this.bot.telegram.sendMessage(this.reportGroup, `Couldn't addClient from ${server.domain}.`);

      throw new BadRequestException(errors.xui.addClientError);
    }

    try {
      const clientStat = {
        id,
        userId: user.id,
        serverId: input.serverId,
        down: 0,
        up: 0,
        flow: '',
        tgId: '',
        subId,
        limitIp: 0,
        total: 0,
        expiryTime: 0,
        enable: true,
        email,
      } as Prisma.ClientStatUpsertArgs['create'];

      return await this.prisma.clientStat.upsert({
        where: {
          id,
        },
        create: clientStat,
        update: clientStat,
      });
    } catch (error) {
      console.error(error);

      throw new BadRequestException('upsert client Stat or create userPackage got failed.');
    }
  }

  async updateClientReq(input: UpdateClientReqInput) {
    const clientStat = await this.prisma.clientStat.findUniqueOrThrow({
      where: { id: input.id },
      include: { server: true },
    });

    const jsonData = {
      id: clientStat.server.inboundId,
      settings: {
        clients: [
          {
            flow: clientStat.flow,
            email: clientStat.email,
            limitIp: clientStat.limitIp,
            totalGB: Number(clientStat.total),
            expiryTime: Number(clientStat.expiryTime),
            enable: clientStat.enable,
            tgId: clientStat.tgId,
            subId: clientStat.subId,
            ...input,
          },
        ],
      },
    };

    const params = jsonObjectToQueryString(jsonData);

    const res = await this.authenticatedReq<{ success: boolean }>({
      serverId: clientStat.server.id,
      url: (domain) => ENDPOINTS(domain).updateClient(clientStat.id),
      method: 'post',
      body: params,
    });

    if (!res.data.success) {
      throw new BadRequestException(errors.xui.addClientError);
    }
  }

  async toggleClientState(clientId: string, state: boolean) {
    await this.updateClientReq({
      id: clientId,
      enable: state,
    });
  }

  async updateClient(_user: User, input: UpdateClientInput): Promise<void> {
    await this.updateClientReq({
      id: input.id,
      expiryTime: 0,
      limitIp: 0,
      totalGB: 0,
      enable: input.enable,
    });
  }

  getClientStats(filters?: GetClientStatsFiltersInput): Promise<ClientStat[]> {
    try {
      return this.prisma.clientStat.findMany({
        where: {
          ...(filters?.id && {
            id: {
              equals: filters.id,
            },
          }),
          // ...(filters?.email && {
          //   email: {
          //     contains: filters.email,
          //   },
          // }),
        },
      });
    } catch {
      throw new BadRequestException('Get ClientStats failed.');
    }
  }

  // @Interval('getServerStatus', 0.25 * 60 * 1000)
  async getServerStatus(): Promise<void> {
    const servers = await this.prisma.server.findMany({ where: { deletedAt: null } });

    for (const server of servers) {
      try {
        const status = await this.authenticatedReq({
          serverId: server.id,
          url: (domain) => ENDPOINTS(domain).serverStatus,
          method: 'post',
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async getUnusedStatIds(serverId: string): Promise<string[]> {
    try {
      const xuiClientStats = (await this.getInbounds(serverId)).filter((i) => isUUID(i.id));
      const dbClientsStats = await this.prisma.clientStat.findMany({
        where: {
          id: {
            in: xuiClientStats.map((i) => i.id),
          },
          deletedAt: null,
        },
      });

      return excludeFromArr(
        xuiClientStats.map((i) => i.id),
        dbClientsStats.map((i) => i.id),
      );
    } catch (error) {
      throw new Error(`Failed to get unusedStatIds: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async deleteUnusedClients(unusedStatIds: string[], server: Server) {
    const queue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 1 });

    for (const unusedStatId of unusedStatIds) {
      await queue.add(async () => {
        try {
          await this.deleteClient(unusedStatId);
        } catch (deleteError) {
          await this.handleError(`Failed to delete client with ID ${unusedStatId} on ${server.domain}`, deleteError);
        }
      });
    }

    await queue.onIdle(); // Ensure all tasks are complete
  }

  private async handleError(message: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await this.bot.telegram.sendMessage(this.reportGroup, `${message}\n\n${errorMessage}`);
    console.error(`${message}:`, error);
  }

  @Interval('resetTrafficUsage', 5 * 60 * 1000)
  async resetTrafficUsage() {
    this.logger.debug('Reset Traffic Usage call every 24H');
    await this.prisma.$queryRaw`
      UPDATE "ClientStat"
      SET "lastTotalUsage" = "down" + "up"
      WHERE "deletedAt" IS NULL;
    `;
  }

  @Interval('backupDB', 1 * 60 * 1000)
  async backupDB() {
    if (this.configService.get('env') === 'development') {
      return;
    }

    this.logger.debug('BackupDB call every 1 min');
    const servers = await this.prisma.server.findMany({ where: { deletedAt: null } });

    for (const server of servers) {
      try {
        const res = await this.authenticatedReq<string>({
          serverId: server.id,
          url: (domain) => ENDPOINTS(domain).getDb,
          method: 'get',
          isBuffer: true,
        });

        await this.bot.telegram.sendDocument(this.backupGroup, {
          source: res.data,
          filename: `${server.domain}-${getDateTimeString()}.db`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : String(error);
        await this.bot.telegram.sendMessage(
          this.reportGroup,
          `Couldn't get backup from ${server.domain}.\n\n${errorMessage}`,
        );
      }
    }
  }

  @Interval('syncClientStats', 1 * 60 * 1000)
  async syncClientStats() {
    this.logger.debug('SyncClientStats called every 1 min');
    const servers = await this.prisma.server.findMany({ where: { deletedAt: null } });

    for (const server of servers) {
      try {
        const updatedClientStats = (await this.getInbounds(server.id)).filter((i) => isUUID(i.id));
        const onlinesStat = await this.getOnlinesInbounds(server.id);
        // Upsert ClientStat records in bulk
        await this.upsertClientStats(updatedClientStats, server.id, onlinesStat);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : String(error);
        await this.bot.telegram.sendMessage(
          this.reportGroup,
          `Couldn't update stats of ${server.domain} server.\n\n${errorMessage}`,
        );
      }
    }
  }

  @Interval('RemoveUnusedClients', 24 * 60 * 60 * 1000)
  async removeUnusedClients() {
    this.logger.debug('RemoveUnusedClients called every 24 hours');
    const servers = await this.prisma.server.findMany({ where: { deletedAt: null } });

    for (const server of servers) {
      try {
        const unusedStatIds = await this.getUnusedStatIds(server.id);
        await this.deleteUnusedClients(unusedStatIds, server);
      } catch (error) {
        await this.handleError(`Couldn't process unused clients of ${server.domain}.`, error);
      }
    }
  }
}
