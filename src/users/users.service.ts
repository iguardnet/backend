/* eslint-disable no-return-await */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { PasswordService } from '../auth/password.service';
import { ChangePasswordInput } from './dto/change-password.input';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private passwordService: PasswordService) {}

  async getUser(user: User): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
  }

  async changePassword(userId: string, userPassword: string, changePassword: ChangePasswordInput) {
    const isPasswordValid = await this.passwordService.validatePassword(changePassword.oldPassword, userPassword);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const hashedPassword = await this.passwordService.hashPassword(changePassword.newPassword);

    return this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }
}
