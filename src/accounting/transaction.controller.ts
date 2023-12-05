import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import {
  Controller,
  Request,
  UseGuards,
  Body,
  Post,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  CreateTransactionDTO,
  TransactionFilterDTO,
} from './dto/transaction.dto';

@UseGuards(AuthenticatedGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private transaction: TransactionService) {}

  @Post()
  async createTransaction(@Request() req, @Body() dto: CreateTransactionDTO) {
    return await this.transaction.createTransaction(req.user, dto);
  }

  @Post('page')
  async paginateTransactions(
    @Request() req,
    @Body('filters') filters: TransactionFilterDTO,
    @Query('limit', new DefaultValuePipe('10'), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe('1'), ParseIntPipe) page: number,
  ) {
    return await this.transaction.listTransactions(
      req.user,
      filters,
      limit,
      page,
    );
  }
}
