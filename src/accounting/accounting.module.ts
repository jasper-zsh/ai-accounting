import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { CategoryService } from './category.service';
import { TransactionService } from './transaction.service';
import { AccountController } from './account.controller';
import { CategoryController } from './category.controller';
import { TransactionController } from './transaction.controller';

@Module({
  controllers: [AccountController, CategoryController, TransactionController],
  providers: [AccountService, CategoryService, TransactionService],
  exports: [TransactionService, AccountService, CategoryService],
})
export class AccountingModule {}
