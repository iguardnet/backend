import { Body, Controller, Get, Headers, HttpStatus, Logger, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, validate, ValidateNested } from 'class-validator';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { PrismaService } from 'nestjs-prisma';

import { AuthService } from '../auth/auth.service';
import { ENV } from '../common/configs/config.interface';

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

class SubscriptionNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  notificationType: number;

  @IsString()
  @IsNotEmpty()
  purchaseToken: string;

  @IsString()
  @IsNotEmpty()
  subscriptionId: string;
}

class NotificationDto {
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionNotificationDto)
  subscriptionNotification?: SubscriptionNotificationDto;
}

const controllerName = 'googlePlay';
const googlePlayIAPWebhookUrl = 'googlePlayIAPWebhook';
@Controller(controllerName)
export class GooglePlayController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  private readonly logger = new Logger(GooglePlayController.name);

  @Get()
  test() {
    console.info('API is OK');

    return 'API is OK';
  }

  @Post(googlePlayIAPWebhookUrl)
  async handleWebhook(
    @Headers('Authorization') authorization: string,
    @Body() body: PubSubRequestBody,
    @Res() res: Response,
  ) {
    this.logger.debug('HandleWebhook (googlePlayIAPWebhookUrl) called');
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

    let messageData: string;

    try {
      messageData = Buffer.from(pubsubMessage.data, 'base64').toString('utf-8');
    } catch {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid base64 data');
    }

    let notification: NotificationDto;

    try {
      const plainObject = JSON.parse(messageData);
      notification = plainToInstance(NotificationDto, plainObject);
    } catch {
      return res.status(HttpStatus.OK).send('Invalid JSON data');
    }

    // Validate the notification object
    const errors = await validate(notification);

    if (errors.length > 0) {
      return res.status(HttpStatus.OK).send('Invalid notification data');
    }

    // Step 3: Process the notification
    await this.processNotification(notification);

    // Send a 200 OK response
    return res.status(HttpStatus.OK).send();
  }

  async verifyPubSubJwtToken(authorizationHeader: string): Promise<boolean> {
    const isDev = this.configService.get<ENV>('env') === 'development';
    const audience = isDev
      ? `https://${this.configService.get('appDomain')}/${controllerName}/${googlePlayIAPWebhookUrl}`
      : `https://${this.configService.get('appDomain')}/api/${controllerName}/${googlePlayIAPWebhookUrl}`;

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
        jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
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

  async processNotification(notification: NotificationDto) {
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
