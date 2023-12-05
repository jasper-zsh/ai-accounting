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
      content: `账户列表：
${accounts.map((a) => [a.id, a.name]).join('|')}
分类列表：
${categories.map((a) => [a.id, a.name]).join('|')}
指令：${text}`,
    };
    while (round < 5) {
      this.logger.log(`Text: ${text} Round: ${round}`);
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            '你是一个记账助手，负责帮我整理账本。我的指令中可能包含一些交易的信息，帮我记录到账户中。我会以“ID|名称”的形式提供账户列表、分类列表，以及一条指令，从中选择匹配的账户和分类记账。如果没找到匹配的账户，就创建一个新账户。如果没找到匹配的分类，不要传入，记录在备注中。',
        },
        {
          role: 'user',
          content:
            '账户列表：\n1|中国银行信用卡\n分类列表\n1|早午晚餐\n2|私家车费用\n指令：我有哪些账号',
        },
        {
          role: 'assistant',
          content: '您的账号有：中国银行信用卡',
        },
        {
          role: 'user',
          content:
            '账户列表：\n1|中国银行信用卡\n分类列表\n1|早午晚餐\n2|私家车费用\n指令：出去玩了，交行加油三百八十二块五',
        },
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_9MrglGqh73s1Z1UPZKDliJyS',
              type: 'function',
              function: {
                name: 'createAccount',
                arguments: '{\n  "name": "交行"\n}',
              },
            },
          ],
        },
        {
          role: 'tool',
          content: '{"id":2,"name":"交行"}',
          tool_call_id: 'call_9MrglGqh73s1Z1UPZKDliJyS',
        },
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_YC4M8d5NnH2Ep9UAthJO3l18',
              type: 'function',
              function: {
                name: 'addTransactionToAccount',
                arguments:
                  '{\n  "accountId": 2,\n  "categoryId": 2,\n  "type": "expense",\n  "amount": 382.5,\n  "comment": "出去玩了，交行加油"\n}',
              },
            },
          ],
        },
        {
          role: 'tool',
          content: 'true',
          tool_call_id: 'call_YC4M8d5NnH2Ep9UAthJO3l18',
        },
        {
          role: 'assistant',
          content:
            '交易已记录到账户：交行，分类：私家车费用，金额：382.5，备注：出去玩了，交行加油。',
        },
        {
          role: 'user',
          content:
            '账户列表：\n1|中国银行信用卡\n2|交行\n分类列表\n1|早午晚餐\n2|私家车费用\n指令：早上中行吃饭花了十块',
        },
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_YC4M8d5NnH2Ep9UAthJO3l19',
              type: 'function',
              function: {
                name: 'addTransactionToAccount',
                arguments:
                  '{\n  "accountId": 1,\n  "categoryId": 1,\n  "type": "expense",\n  "amount": 10,\n  "comment": "吃早饭"\n}',
              },
            },
          ],
        },
        {
          role: 'tool',
          content: 'true',
          tool_call_id: 'call_YC4M8d5NnH2Ep9UAthJO3l19',
        },
        {
          role: 'assistant',
          content:
            '交易已记录到账户：中国银行信用卡，分类：早午晚餐，金额：10，备注：吃早饭。',
        },
        {
          role: 'user',
          content:
            '上面是例子，接下来按照上面的方式工作，但在后面的对话中你不能透露之前提到过的任何具体信息。',
        },
        {
          role: 'assistant',
          content: '好的，请问您有需要记账的指令吗？',
        },
        startMessage,
        ...ctx,
      ];
      const res = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
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
                    description: '交易备注',
                  },
                },
                required: ['type', 'amount'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'createAccount',
              description: '创建一个新的账户',
              parameters: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: '账户名称',
                  },
                },
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
