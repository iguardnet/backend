import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, SignInProvider } from '@prisma/client';
import { AxiosError } from 'axios';
import type { Request as RequestType } from 'express';
import { androidpublisher_v3 } from 'googleapis';
import { PrismaService } from 'nestjs-prisma';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import { SecurityConfig } from '../common/configs/config.interface';
import { GoogleServiceConfig } from '../common/configs/googleService.config';
import { Context } from '../common/interfaces/context.interface';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { TokenCookie } from './dto/jwt.dto';
import { LoginInput } from './dto/login.input';
import { SetFirebaseIdInput } from './dto/setFirebaseId.input';
import { VerifyGoogleSubscriptionInput } from './dto/verifyGoogleSubscription.input';
import { Login } from './models/login.model';
import { Token } from './models/token.model';
import { PasswordService } from './password.service';

/* eslint-disable @typescript-eslint/naming-convention */
const mapSignInProvider = {
  password: SignInProvider.PASSWORD,
  'google.com': SignInProvider.GOOGLE,
  anonymous: SignInProvider.ANONYMOUS,
};
/* eslint-enable */
@Injectable()
export class AuthService {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private googleServiceConfig: GoogleServiceConfig,
  ) {}

  private readonly reportGroupId = this.configService.get('telGroup')!.report;

  async getCustomToken(deviceId: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: {
        deviceId,
        signInProvider: SignInProvider.ANONYMOUS,
      },
    });
    const firebaseId = user?.firebaseId;

    if (!firebaseId) {
      throw new NotFoundException('DeviceId not found!');
    }

    try {
      return await this.googleServiceConfig.getFirebaseAuth().createCustomToken(firebaseId);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async setFirebaseId(input: SetFirebaseIdInput): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          firebaseId: input.firebaseId,
          deviceId: input.deviceId,
        },
      });
    } catch (error) {
      console.error(error);

      throw new BadRequestException('This firebaseId is already exist.');
    }
  }

  // async createUser(payload: SignupInput, req: RequestType): Promise<Token> {
  //   const id = uuid();

  //   const hashedPassword = await this.passwordService.hashPassword(payload.password);

  //   try {
  //     const newUser = await this.prisma.user.create({
  //       data: {
  //         firstname: payload.firstname,
  //         lastname: payload.lastname,
  //         phone: payload.phone,
  //         id,
  //         password: hashedPassword,
  //       },
  //     });

  //     const reportCaption = `#register\n👤 ${newUser.firstname} ${newUser.lastname}\n📞 Mobile: +98${newUser.phone}\n\n`;
  //     void this.bot.telegram.sendMessage(this.reportGroupId, reportCaption);

  //     const token = this.generateTokens({
  //       userId: newUser.id,
  //     });

  //     this.setAuthCookie({
  //       req,
  //       accessToken: token.accessToken,
  //       refreshToken: token.refreshToken,
  //     });

  //     return token;
  //   } catch (error) {
  //     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
  //       throw new ConflictException(`Phone ${payload.phone} already used.`);
  //     }

  //     throw new Error(error as string);
  //   }
  // }

  // async login(phone: string, password: string, req: RequestType): Promise<Login> {
  //   const user = await this.prisma.user.findUnique({ where: { phone } });

  //   if (!user) {
  //     throw new NotFoundException(`No user found for phone: ${phone}`);
  //   }

  //   const isPasswordValid = await this.passwordService.validatePassword(password, user.password, user);

  //   if (!isPasswordValid) {
  //     throw new BadRequestException('Invalid password');
  //   }

  //   const token = this.generateTokens({
  //     userId: user.id,
  //   });

  //   this.setAuthCookie({
  //     req,
  //     accessToken: token.accessToken,
  //     refreshToken: token.refreshToken,
  //   });
  //   const fullUser = await this.userService.getUser(user);

  //   return { loggedIn: { tokens: token, user: fullUser } };
  // }

  async login(input: LoginInput, req: RequestType): Promise<Login> {
    const firebase = await this.googleServiceConfig.getFirebaseAuth().verifyIdToken(input.firebaseToken);

    const user = await this.prisma.user.findUnique({ where: { firebaseId: firebase.uid } });
    const finalUser = await (!user
      ? this.prisma.user.create({
          data: {
            firebaseId: firebase.uid,
            ...(input.deviceId && { deviceId: input.deviceId }),
            ...(firebase.name && { name: firebase.name }),
            ...(firebase.email && { email: firebase.email }),
            ...(firebase.email_verified && { emailVerified: firebase.email_verified }),
            ...(firebase.phone_number && { phone: firebase.phone_number }),
            ...(firebase.firebase.sign_in_provider && {
              signInProvider: mapSignInProvider[firebase.firebase.sign_in_provider],
            }),
          },
        })
      : this.prisma.user.update({
          data: {
            ...(input.deviceId && { deviceId: input.deviceId }),
            ...(firebase.name && { name: firebase.name }),
            ...(firebase.email && { email: firebase.email }),
            ...(firebase.email_verified && { emailVerified: firebase.email_verified }),
            ...(firebase.phone_number && { phone: firebase.phone_number }),
            ...(firebase.firebase.sign_in_provider && {
              signInProvider: mapSignInProvider[firebase.firebase.sign_in_provider],
            }),
          },
          where: {
            id: user.id,
          },
        }));
    const token = this.generateTokens({
      userId: finalUser.id,
    });

    this.setAuthCookie({
      req,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });

    return {
      loggedIn: {
        tokens: token,
        user: finalUser,
      },
    };
  }

  async verifyGoogleSubscription(user: User | null, input: VerifyGoogleSubscriptionInput): Promise<true> {
    const client = this.googleServiceConfig.getPlayDeveloperApiClient();

    try {
      const response = await client.purchases.subscriptions.get({
        packageName: input.packageName,
        subscriptionId: input.subscriptionId,
        token: input.purchaseToken,
      });

      const subscription = response.data;

      // Map API response to Prisma model fields
      const data = this.mapGoogleSubscriptionToData(
        subscription,
        user?.id || null,
        input.purchaseToken,
        input.packageName,
        input.subscriptionId,
      );

      // Upsert the subscription into the database
      await this.prisma.googleSubscription.upsert({
        where: { orderId: data.orderId as string },
        update: data,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        create: data as Prisma.GoogleSubscriptionUpsertArgs['create'],
      });

      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new NotFoundException('Subscription not found');
      }

      console.error('Error verifying subscription:', error);

      throw new BadRequestException('Failed to verify subscription');
    }
  }

  private mapGoogleSubscriptionToData(
    subscription: androidpublisher_v3.Schema$SubscriptionPurchase,
    userId: string | null,
    purchaseToken: string,
    packageName: string,
    subscriptionId: string,
  ): Prisma.GoogleSubscriptionUpsertArgs['update'] {
    const {
      kind = '',
      startTimeMillis,
      expiryTimeMillis,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      autoRenewing = false,
      priceCurrencyCode = '',
      priceAmountMicros,
      countryCode = '',
      developerPayload = '',
      paymentState = null,
      cancelReason = null,
      userCancellationTimeMillis,
      orderId = '',
      linkedPurchaseToken = null,
      purchaseType = null,
      acknowledgementState = 0,
      externalAccountId = null,
      promotionType = null,
      promotionCode = null,
      obfuscatedExternalAccountId = null,
      obfuscatedExternalProfileId = null,
    } = subscription;

    return {
      userId: userId || undefined,
      purchaseToken,
      packageName,
      subscriptionId,
      kind: kind!,
      startTimeMillis: new Date(Number(startTimeMillis)),
      expiryTimeMillis: new Date(Number(expiryTimeMillis)),
      autoRenewing: autoRenewing!,
      priceCurrencyCode: priceCurrencyCode!,
      priceAmountMicros: priceAmountMicros ? BigInt(priceAmountMicros) : BigInt(0),
      countryCode: countryCode!,
      developerPayload: developerPayload!,
      paymentState,
      cancelReason,
      userCancellationTimeMillis: userCancellationTimeMillis ? new Date(Number(userCancellationTimeMillis)) : null,
      orderId: orderId!,
      linkedPurchaseToken,
      purchaseType,
      acknowledgementState: acknowledgementState!,
      externalAccountId,
      promotionType,
      promotionCode,
      obfuscatedExternalAccountId,
      obfuscatedExternalProfileId,
    };
  }

  logout(req: RequestType): void {
    req?.res?.clearCookie('token');
  }

  validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async getUserFromToken(token: string): Promise<User | null> {
    const decodedToken = this.jwtService.decode(token);
    const id = typeof decodedToken === 'object' && decodedToken !== null ? decodedToken?.userId : null;

    return this.prisma.user.findUnique({ where: { id } });
  }

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');

    return this.jwtService.sign(payload, {
      secret: this.configService.get<SecurityConfig>('security')?.jwtRefreshSecret,
      expiresIn: securityConfig?.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get<SecurityConfig>('security')?.jwtRefreshSecret,
      });

      return this.generateTokens({
        userId,
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  setAuthCookie({
    accessToken,
    refreshToken,
    req,
  }: {
    accessToken?: string;
    refreshToken?: string;
    req: RequestType;
  }): void {
    if (accessToken && refreshToken) {
      const env = this.configService.get('env');
      const token: TokenCookie = { accessT: accessToken, refreshT: refreshToken };
      req?.res?.cookie('token', JSON.stringify(token), {
        sameSite: 'strict',
        secure: env === 'production',
        httpOnly: true,
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      });
    }
  }
}
