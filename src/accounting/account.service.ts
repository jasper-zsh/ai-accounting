import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account, Prisma, User } from '@prisma/client';
import { CreateAccountDTO } from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async createAccount(user: User, dto: CreateAccountDTO): Promise<Account> {
    return await this.prisma.account.create({
      data: {
        userId: user.id,
        name: dto.name,
      },
    });
  }

  async listAccounts(user: User): Promise<Account[]> {
    return await this.prisma.account.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  async deleteAccount(user: User, id: number) {
    await this.prisma.account.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  }

  async updateAccount(
    user: User,
    id: number,
    input: Prisma.AccountUpdateInput,
  ) {
    return await this.prisma.account.update({
      where: {
        id,
        userId: user.id,
      },
      data: input,
    });
  }
}
