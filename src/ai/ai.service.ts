import { AccountService } from '@/accounting/account.service';
import { CategoryService } from '@/accounting/category.service';
import { TransactionService } from '@/accounting/transaction.service';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import OpenAI from 'openai';
import { Config } from 'src/config';

@Injectable()
export class AIService {
  private readonly logger = new Logger('AIService');
  private readonly openai: OpenAI;

  constructor(
    private account: AccountService,
    private category: CategoryService,
    private transaction: TransactionService,
  ) {
    this.openai = new OpenAI({
      apiKey: Config.OPENAI_API_KEY,
    });
  }

  async command(user: User, text: string) {
    const accounts = await this.account.listAccounts(user);
    const categories = await this.category.listCategories(user);
    const res = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `选择匹配的分类和账户记录交易。如果没有匹配的分类，不需要设置categoryId。如果没有匹配的账户，不需要设置accountId。不能匹配的内容记录在备注中。
账户列表如下：
ID|名称
${accounts.map((a) => [a.id, a.name]).join('|')}
分类列表如下：
ID|名称
${categories.map((a) => [a.id, a.name]).join('|')}
  `,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'addTransactionToAccount',
            description: '向账户中记录一笔交易',
            parameters: {
              type: 'object',
              properties: {
                accountId: {
                  type: 'number',
                  description: '账户ID',
                },
                type: {
                  type: 'string',
                  enum: ['expense', 'income'],
                  description: '交易类型',
                },
                categoryId: {
                  type: 'number',
                  description: '交易分类',
                },
                amount: {
                  type: 'number',
                  description: '交易金额',
                },
                comment: {
                  type: 'string',
                  description: '备注',
                },
              },
              required: ['type', 'amount'],
            },
          },
        },
      ],
    });
    if (res.choices.length > 1) {
      this.logger.log(`Received more than 1 choices: ${res.choices}`);
    }
    const toolCalls = res.choices[0].message.tool_calls;
    if (toolCalls?.length > 1) {
      this.logger.log(`Received more than 1 tool calls: ${toolCalls}`);
    }
    if (toolCalls) {
      const args = JSON.parse(toolCalls[0].function.arguments);
      switch (toolCalls[0].function.name) {
        case 'addTransactionToAccount':
          return await this.transaction.createTransaction(user, args);
      }
    }
    this.logger.log(`Unrecognized command: ${res}`);
    return null;
  }
}
