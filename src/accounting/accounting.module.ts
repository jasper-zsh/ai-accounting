import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { CategoryService } from './category.service';
import { TransactionService } from './transaction.service';

@Module({
  providers: [AccountService, CategoryService, TransactionService],
  exports: [TransactionService, AccountService, CategoryService],
})
export class AccountingModule {}
