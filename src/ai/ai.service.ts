import { AccountService } from '@/accounting/account.service';
import { CategoryService } from '@/accounting/category.service';
import { TransactionService } from '@/accounting/transaction.service';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
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
    let round = 1;
    const ctx: ChatCompletionMessageParam[] = [];
    const accounts = await this.account.listAccounts(user);
    const categories = await this.category.listCategories(user);
    const startMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: `[账户列表]
${accounts.map((a) => [a.id, a.name]).join('|')}
[分类列表]
${categories.map((a) => [a.id, a.name]).join('|')}
[指令]
${text}`,
    };
    while (round < 5) {
      this.logger.log(`Text: ${text} Round: ${round}`);
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `你是一个记账助手，负责帮我整理账本。我的记账指令中包含一些交易的信息，帮我记录到账户中。遵守以下规则：
从列表中选择匹配的账户和分类记账。
如果没找到匹配的账户，就留空账户ID。
如果没找到匹配的分类，就留空分类ID。
交易的概要需要记录在备注中。
支出的金额记录为负数，收入的金额记录为正数。
我会按照以下格式提供账户列表、分类列表和记账指令：

[账户列表]
1|中国银行信用卡
2|招商银行储蓄卡
[分类列表]
1|早午晚餐
2|私家车费用
[指令]
中行加油三百八十二块五

如果你已经理解了接下来的工作方式，请告诉我你已经准备好了。`,
        },
        startMessage,
        ...ctx,
      ];
      const res = await this.openai.chat.completions.create({
        model: 'gpt-4',
        temperature: 0,
        messages,
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
                    type: 'integer',
                    description: '账户ID',
                  },
                  categoryId: {
                    type: 'integer',
                    description: '交易分类',
                  },
                  type: {
                    type: 'string',
                    enum: ['expense', 'income'],
                    description: '交易类型',
                  },
                  amount: {
                    type: 'number',
                    description: '交易金额',
                  },
                  comment: {
                    type: 'string',
                    description: '交易备注',
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
      ctx.push(res.choices[0].message);
      switch (res.choices[0].finish_reason) {
        case 'stop':
          return res.choices[0].message.content;
        case 'tool_calls':
          const toolCalls = res.choices[0].message.tool_calls;
          if (toolCalls?.length > 1) {
            this.logger.log(`Received more than 1 tool calls: ${toolCalls}`);
          }
          if (toolCalls) {
            const args = JSON.parse(toolCalls[0].function.arguments);
            this.logger.log(
              `Call ${toolCalls[0].function.name} ${toolCalls[0].function.arguments}`,
            );
            switch (toolCalls[0].function.name) {
              case 'addTransactionToAccount':
                args.amount *= 100;
                const res = await this.transaction.createTransaction(
                  user,
                  args,
                );
                ctx.push({
                  role: 'tool',
                  content: `${!!res}`,
                  tool_call_id: toolCalls[0].id,
                });
                return res;
                break;
              case 'createAccount':
                const account = await this.account.createAccount(user, {
                  name: args.name,
                });
                ctx.push({
                  role: 'tool',
                  content: JSON.stringify({
                    id: account.id,
                    name: account.name,
                  }),
                  tool_call_id: toolCalls[0].id,
                });
                break;
            }
          }
          round += 1;
          break;
        default:
          this.logger.log(`Unrecognized command: ${res}`);
          return null;
      }
    }
    return null;
  }
}
