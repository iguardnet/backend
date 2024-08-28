import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { androidpublisher_v3, google } from 'googleapis';

@Injectable()
export class FirebaseConfig {
  private playDeveloperApiClient: androidpublisher_v3.Androidpublisher;

  constructor(private configService: ConfigService) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      }),
      databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        private_key: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    this.playDeveloperApiClient = google.androidpublisher({
      version: 'v3',
      auth,
    });
  }

  getAuth() {
    return admin.auth();
  }

  getPlayDeveloperApiClient() {
    return this.playDeveloperApiClient;
  }
}
