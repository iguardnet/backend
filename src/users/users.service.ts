/* eslint-disable no-return-await */
import { Injectable } from '@nestjs/common';
import type { Request as RequestType } from 'express';
import { PrismaService } from 'nestjs-prisma';

import { PasswordService } from '../auth/password.service';
import { User, UserWithClientInfo } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private passwordService: PasswordService) {}

  async getUser(user: User, req: RequestType): Promise<UserWithClientInfo> {
    const fullUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // If the IP is in IPv6 format, extract the IPv4 part
    if (typeof ip === 'string' && ip.slice(0, 7) === '::ffff:') {
      ip = ip.slice(7);
    }

    const client = await this.prisma.clientInfo.findFirst();

    return { ...user, clientInfo: client, requestIP: ip as string };
  }

  // async changePassword(userId: string, userPassword: string, changePassword: ChangePasswordInput) {
  //   const isPasswordValid = await this.passwordService.validatePassword(changePassword.oldPassword, userPassword);

  //   if (!isPasswordValid) {
  //     throw new BadRequestException('Invalid password');
  //   }

  //   const hashedPassword = await this.passwordService.hashPassword(changePassword.newPassword);

  //   return this.prisma.user.update({
  //     data: {
  //       password: hashedPassword,
  //     },
  //     where: { id: userId },
  //   });
  // }
}
