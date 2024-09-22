import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebaseAdmin from 'firebase-admin';
import { androidpublisher_v3, google } from 'googleapis';

export enum CancelReason {
  /** 0: User canceled the subscription. */
  USER_CANCELED = 0,
  /** 1: Subscription was canceled by the system. */
  SYSTEM_CANCELED = 1,
  /** 2: Subscription was replaced with a new subscription. */
  REPLACED = 2,
  /** 3: Subscription was canceled by the developer. */
  DEVELOPER_CANCELED = 3,
}

export enum PaymentState {
  /** 0: Payment pending. */
  PAYMENT_PENDING = 0,
  /** 1: Payment received. */
  PAYMENT_RECEIVED = 1,
  /** 2: Free trial. */
  FREE_TRIAL = 2,
  /** 3: Pending deferred upgrade/downgrade. */
  PENDING_DEFERRED_UPGRADE_DOWNGRADE = 3,
}

export enum PromotionType {
  /** 0: One-time code. */
  ONE_TIME_CODE = 0,
  /** 1: Vanity code. */
  VANITY_CODE = 1,
}

export enum PurchaseType {
  /** 0: Test purchase. */
  TEST = 0,
  /** 1: Promo purchase. */
  PROMO = 1,
}

@Injectable()
export class GoogleServiceConfig {
  private playDeveloperApiClient: androidpublisher_v3.Androidpublisher;

  constructor(private configService: ConfigService) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: configService.get<string>('GOOGLE_SERVICE_ACCOUNT_PROJECT_ID'),
        clientEmail: configService.get<string>('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL'),
        privateKey: configService.get<string>('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      }),
      databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL'),
        private_key: this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    this.playDeveloperApiClient = google.androidpublisher({
      version: 'v3',
      auth,
    });
  }

  getFirebaseAuth() {
    return firebaseAdmin.auth();
  }

  getPlayDeveloperApiClient() {
    return this.playDeveloperApiClient;
  }
}
