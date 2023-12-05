import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Transaction, User } from '@prisma/client';
import {
  CreateTransactionDTO,
  TransactionFilterDTO,
  TransactionGroupResult,
} from './dto/transaction.dto';
import { Page } from '@/common/dto/page.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(
    user: User,
    dto: CreateTransactionDTO,
  ): Promise<Transaction> {
    return await this.prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: dto.amount,
        comment: dto.comment,
        time: dto.time ?? new Date(),
      },
    });
  }

  async listTransactions(
    user: User,
    filter: TransactionFilterDTO,
    limit: number,
    page: number,
  ): Promise<Page<Transaction>> {
    const res = new Page<Transaction>();
    res.total = await this.prisma.transaction.count({
      where: {
        userId: user.id,
        ...filter,
      },
    });
    res.data = await this.prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...filter,
      },
      orderBy: {
        time: 'desc',
      },
      take: limit,
      skip: limit * (page - 1),
    });
    return res;
  }

  async groupBy(
    user: User,
    fields: ['type' | 'categoryId' | 'accountId'],
    filter: TransactionFilterDTO,
  ): Promise<TransactionGroupResult[]> {
    const res = await this.prisma.transaction.groupBy({
      by: fields.length ? fields : ['userId'],
      where: {
        userId: user.id,
        ...filter,
      },
      _sum: {
        amount: true,
      },
    });
    return res.map((r) => {
      const result = new TransactionGroupResult();
      for (const field of fields) {
        // @ts-expect-error magic
        result[field] = r[field];
      }
      result.amount = r._sum.amount;
      return result;
    });
  }
}
