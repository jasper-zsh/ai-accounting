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
  Delete,
  Param,
  Get,
  HttpCode,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  UpdateTransactionDTO,
  TransactionFilterDTO,
} from './dto/transaction.dto';

@UseGuards(AuthenticatedGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private transaction: TransactionService) {}

  @Post()
  async createTransaction(@Request() req, @Body() dto: UpdateTransactionDTO) {
    return await this.transaction.createTransaction(req.user, dto);
  }

  @Get('data/:id')
  async getTransaction(@Request() req, @Param('id') id: string) {
    return await this.transaction.getTransaction(req.user, id);
  }

  @Post('data/:id')
  async updateTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDTO,
  ) {
    return await this.transaction.updateTransaction(req.user, id, dto);
  }

  @Post('query/page')
  @HttpCode(200)
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

  @Post('query/group-by')
  @HttpCode(200)
  async groupBy(
    @Request() req,
    @Body('filters') filters: TransactionFilterDTO,
    @Body('groupBy') groupBy: ['type' | 'accountId' | 'categoryId'],
  ) {
    return await this.transaction.groupBy(req.user, groupBy, filters);
  }

  @Delete('data/:id')
  async deleteTransaction(@Request() req, @Param('id') id: string) {
    return await this.transaction.deleteTransaction(req.user, id);
  }
}
