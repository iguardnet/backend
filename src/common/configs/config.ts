import { description, name, version } from '../../../package.json';
import type { Config } from './config.interface';

const env = (process.env?.NODE_ENV || 'production') as 'production' | 'staging' | 'development';
const config: Config = {
  env,
  publicIP: process.env.PUBLIC_IP!,
  version,
  serviceName: name,
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  postgres: {
    dataBaseHost: process.env.DB_HOST!,
    dataBasePort: process.env.DB_PORT!,
    databaseName: process.env.POSTGRES_DB!,
    databaseUrl: process.env.DATABASE_URL!,
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
  },
  swagger: {
    enabled: true,
    title: name,
    description,
    version,
    path: 'api',
  },
  graphql: {
    playgroundEnabled: process.env?.PLAYGROUND_ENABLED ? Boolean(process.env.PLAYGROUND_ENABLED === 'true') : false,
    introspection: process.env?.GRAPHQL_INTROSPECTION ? Boolean(process.env.GRAPHQL_INTROSPECTION === 'true') : false,
    debug: Boolean(process.env.NODE_ENV === 'development'),
    schemaDestination: './src/schema.graphql',
    sortSchema: true,
  },
  security: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN || '2m',
    refreshIn: '7d',
    bcryptSaltOrRound: 10,
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT!,
    port: Number.parseInt(process.env?.MINIO_PORT || '9000', 10),
    rootUser: process.env.MINIO_ROOT_USER!,
    rootPassword: process.env.MINIO_ROOT_PASSWORD!,
    region: process.env.MINIO_REGION_NAME!,
    bucket: process.env.MINIO_BUCKET!,
  },
  telegraf: {
    token: process.env.TELEGRAM_BOT_TOKEN!,
  },
  telGroup: {
    report: process.env.REPORT_GROUP_ID!,
    backup: process.env.BACKUP_GROUP_ID!,
  },
};

// eslint-disable-next-line import/no-default-export
export default (): Config => config;
