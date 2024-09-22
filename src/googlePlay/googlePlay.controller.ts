import { Body, Controller, Headers, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { PrismaService } from 'nestjs-prisma';

import { AuthService } from '../auth/auth.service';
import { GoogleServiceConfig } from '../common/configs/googleService.config';

interface PubSubMessage {
  attributes?: Record<string, string>;
  data: string;
  messageId?: string;
  message_id?: string;
  publishTime?: string;
  publish_time?: string;
}

interface PubSubRequestBody {
  message: PubSubMessage;
  subscription?: string;
}

interface SubscriptionNotification {
  notificationType: number;
  purchaseToken: string;
  subscriptionId: string;
}

interface Notification {
  packageName: string;
  subscriptionNotification?: SubscriptionNotification;
}

const googlePlayIAPWebhookUrl = 'googlePlayIAPWebhook';
@Controller('googlePlay')
export class GooglePlayController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post(googlePlayIAPWebhookUrl)
  async handleWebhook(
    @Headers('Authorization') authorization: string,
    @Body() body: PubSubRequestBody,
    @Res() res: Response,
  ) {
    // Step 1: Verify the JWT token in the Authorization header
    const isValid = await this.verifyPubSubJwtToken(authorization);

    if (!isValid) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid token');
    }

    // Step 2: Extract and decode the message
    const pubsubMessage = body.message;

    if (!pubsubMessage || !pubsubMessage.data) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid message format');
    }

    const messageData = Buffer.from(pubsubMessage.data, 'base64').toString('utf-8');
    const notification = JSON.parse(messageData);

    // Step 3: Process the notification
    await this.processNotification(notification);

    // Send a 200 OK response
    return res.status(HttpStatus.OK).send();
  }

  async verifyPubSubJwtToken(authorizationHeader: string): Promise<boolean> {
    const audience = `${this.configService.get('appDomain')}/${googlePlayIAPWebhookUrl}`;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authorizationHeader.slice('Bearer '.length);

    try {
      const decodedHeader = jwt.decode(token, { complete: true });

      if (!decodedHeader) {
        return false;
      }

      const kid = decodedHeader.header.kid;
      const client = jwksClient({
        jwksUri: 'https://www.googleapis.com/oauth2/v1/certs',
      });

      const key = await new Promise<jwksClient.SigningKey | undefined>((resolve, reject) => {
        client.getSigningKey(kid, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
      const signingKey = key?.getPublicKey();

      jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        audience,
        issuer: 'https://accounts.google.com',
      });

      // Token is valid
      return true;
    } catch (error) {
      console.error('Token verification failed', error);

      return false;
    }
  }

  async processNotification(notification: Notification) {
    const packageName = notification.packageName;

    if (notification.subscriptionNotification) {
      const { notificationType, purchaseToken, subscriptionId } = notification.subscriptionNotification;

      await this.authService.verifyGoogleSubscription(null, {
        packageName,
        subscriptionId,
        purchaseToken,
      });
    }
  }
}
