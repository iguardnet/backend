import type { Prisma } from '@prisma/client';

declare global {
  type JSONInput = Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
}
