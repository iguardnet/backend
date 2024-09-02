import type { Prisma } from '@prisma/client';

declare global {
  type JSONInput = Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
  interface JsonObject {
    [key: string]: string | number | boolean | JsonObject | JsonArray;
  }
}
