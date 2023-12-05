import { Prisma } from '@prisma/client';

export class CreateTransactionDTO {
  accountId?: number;
  categoryId?: number;
  type: string;
  amount: number;
  comment?: string;
  time?: Date;
}

export class TransactionFilterDTO {
  accountId?: number;
  categoryId?: number;
  type?: string;
  time?: Prisma.DateTimeFilter;
}

export class TransactionGroupResult {
  accountId?: number;
  categoryId?: number;
  type?: string;
  amount: number;
}
