import type { OnModuleInit } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';

import { MinioResolver } from './minio.resolver';
import { MinioClientService } from './minio.service';

@Global()
@Module({
  providers: [MinioResolver, MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule implements OnModuleInit {
  constructor(private readonly minioService: MinioClientService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.minioService.init();
    } catch (error) {
      console.error('minio crash');
      console.error(error);
    }
  }
}
