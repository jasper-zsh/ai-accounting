import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDTO } from './dto/account.dto';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { Prisma } from '@prisma/client';

@UseGuards(AuthenticatedGuard)
@Controller('accounts')
export class AccountController {
  constructor(private account: AccountService) {}

  @Post()
  async createAccount(@Request() req, @Body() dto: CreateAccountDTO) {
    return await this.account.createAccount(req.user, dto);
  }

  @Get()
  async listAccounts(@Request() req) {
    return await this.account.listAccounts(req.user);
  }

  @Post(':id')
  async updateAccount(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: Prisma.AccountUpdateInput,
  ) {
    return await this.account.updateAccount(req.user, id, input);
  }
}
