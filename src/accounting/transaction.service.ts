import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Transaction, User } from '@prisma/client';
import {
  CreateTransactionDTO,
  TransactionFilterDTO,
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
        amount: dto.amount * 100,
        comment: dto.comment,
        time: dto.time ?? new Date(),
      },
    });
  }

  async listTransactions(
    user: User,
    filters: TransactionFilterDTO,
    limit: number,
    page: number,
  ): Promise<Page<Transaction>> {
    const res = new Page<Transaction>();
    res.total = await this.prisma.transaction.count({
      where: {
        userId: user.id,
        ...filters,
      },
    });
    res.data = await this.prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...filters,
      },
      orderBy: {
        time: 'desc',
      },
      take: limit,
      skip: limit * (page - 1),
    });
    return res;
  }
}
