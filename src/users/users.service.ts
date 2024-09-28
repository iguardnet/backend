/* eslint-disable no-return-await */
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Request as RequestType } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { v4 as uuid } from 'uuid';

import { PasswordService } from '../auth/password.service';
import { GoogleSubscription, GoogleSubscriptionStatus } from './models/subscription.model';
import { FullUser, GoogleAllSubscriptions, User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private passwordService: PasswordService) {}

  private mapPaymentState(paymentState: number | null): GoogleSubscriptionStatus {
    switch (paymentState) {
      case 0:
        return GoogleSubscriptionStatus.PAYMENT_PENDING;
      case 1:
        return GoogleSubscriptionStatus.ACTIVE;
      case 2:
        return GoogleSubscriptionStatus.FREE_TRIAL;
      case 3:
        return GoogleSubscriptionStatus.PENDING_UPGRADE_DOWNGRADE;
      default:
        return GoogleSubscriptionStatus.UNKNOWN;
    }
  }

  private mapCancelReason(cancelReason: number | null): GoogleSubscriptionStatus {
    switch (cancelReason) {
      case 0:
        return GoogleSubscriptionStatus.CANCELED_BY_USER;
      case 1:
        return GoogleSubscriptionStatus.CANCELED_BY_SYSTEM;
      case 2:
        return GoogleSubscriptionStatus.REPLACED;
      case 3:
        return GoogleSubscriptionStatus.CANCELED_BY_DEVELOPER;
      default:
        return GoogleSubscriptionStatus.UNKNOWN;
    }
  }

  async getFullUser(user: User, req: RequestType): Promise<FullUser> {
    // Fetch the user with only their active subscriptions
    const fullUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        id: true,
        phone: true,
        emailVerified: true,
        signInProvider: true,
        email: true,
        name: true,
        deviceId: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        GoogleSubscription: {
          where: {
            AND: [
              // Subscription has not expired
              { expiryTimeMillis: { gte: new Date() } },
              // Payment state is 'Payment received' or 'Free trial'
              { paymentState: { in: [1, 2] } },
              // Cancel reason is null (not canceled)
              { OR: [{ cancelReason: null }, { cancelReason: undefined }] },
            ],
          },
          orderBy: {
            expiryTimeMillis: 'desc',
          },
          select: {
            id: true,
            subscriptionId: true,
            startTimeMillis: true,
            expiryTimeMillis: true,
            autoRenewing: true,
            priceCurrencyCode: true,
            priceAmountMicros: true,
            countryCode: true,
            kind: true,
            orderId: true,
            developerPayload: true,
            acknowledgementState: true,
            cancelReason: true,
            paymentState: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // If the IP is in IPv6 format, extract the IPv4 part
    if (typeof ip === 'string' && ip.slice(0, 7) === '::ffff:') {
      ip = ip.slice(7);
    }

    const requestIP = typeof ip === 'string' ? ip.split(',')[0] : 'IP';

    const client = await this.prisma.clientInfo.findFirst();

    // Map subscriptions with their statuses
    let activeGoogleSubscription: GoogleSubscription | null = null;

    if (fullUser.GoogleSubscription && fullUser.GoogleSubscription.length > 0) {
      const sub = fullUser.GoogleSubscription[0];
      let status: GoogleSubscriptionStatus = this.mapPaymentState(sub.paymentState);

      // Override status if canceled
      if (sub.cancelReason !== null) {
        status = this.mapCancelReason(sub.cancelReason);
      }

      // Additional checks for refunded subscriptions
      if (sub.paymentState === 0 && sub.cancelReason === 1) {
        status = GoogleSubscriptionStatus.REFUNDED;
      }

      activeGoogleSubscription = {
        ...sub,
        status,
      };
    }

    return { ...fullUser, clientInfo: client, requestIP, activeGoogleSubscription };
  }

  async getGoogleSubscriptions(user: User): Promise<GoogleAllSubscriptions> {
    // Fetch the user along with their subscriptions

    const subscriptions = await this.prisma.googleSubscription.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        expiryTimeMillis: 'desc',
      },
    });

    const currentTime = new Date();

    // Map subscriptions with their statuses
    const googleSubscriptions: GoogleSubscription[] = subscriptions.map((sub) => {
      let status: GoogleSubscriptionStatus = GoogleSubscriptionStatus.UNKNOWN;

      // Check if subscription is expired
      if (sub.expiryTimeMillis < currentTime) {
        status = GoogleSubscriptionStatus.EXPIRED;
      } else {
        // Map payment state
        status = this.mapPaymentState(sub.paymentState);

        // Override status if canceled
        if (sub.cancelReason !== null) {
          status = this.mapCancelReason(sub.cancelReason);
        }

        // Additional checks for refunded subscriptions
        if (sub.paymentState === 0 && sub.cancelReason === 1) {
          status = GoogleSubscriptionStatus.REFUNDED;
        }
      }

      return {
        ...sub,
        status,
      };
    });

    // Identify the most recent active subscription
    const activeGoogleSubscription = googleSubscriptions.find(
      (sub) => sub.status === GoogleSubscriptionStatus.ACTIVE || sub.status === GoogleSubscriptionStatus.FREE_TRIAL,
    );

    return {
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      googleSubscriptions,
      activeGoogleSubscription,
    };
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const activeSubscription = await this.prisma.googleSubscription.findFirst({
      where: {
        userId,
        expiryTimeMillis: { gte: new Date() },
        paymentState: { in: [1, 2] },
        OR: [{ cancelReason: null }, { cancelReason: undefined }],
      },
      select: { id: true }, // Only select the ID for performance
    });

    return activeSubscription !== null;
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
