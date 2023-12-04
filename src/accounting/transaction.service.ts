import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Transaction, User } from '@prisma/client';
import { CreateTransactionDTO } from './dto/transaction.dto';

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
      },
    });
  }
}
