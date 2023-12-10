import { Prisma } from '@prisma/client';

export interface UpdateTransactionDTO {
  accountId?: number;
  categoryId?: number;
  type: string;
  amount: number;
  comment?: string;
  time?: Date;
}

export interface TransactionFilterDTO {
  accountId?: number;
  categoryId?: number;
  type?: string;
  time?: Prisma.DateTimeFilter;
}

export interface TransactionGroupResult {
  accountId?: number;
  categoryId?: number;
  type?: string;
  amount: number;
}
