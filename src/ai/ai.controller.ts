import {
  Body,
  Controller,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { SpeechToTextInterface } from '@/voice/voice.interface';
import { AccountService } from '@/accounting/account.service';
import { CategoryService } from '@/accounting/category.service';

@Controller('ai')
@UseGuards(AuthenticatedGuard)
export class AIController {
  private readonly logger = new Logger('AI');

  constructor(
    private ai: AIService,
    private speechToText: SpeechToTextInterface,
    private account: AccountService,
    private category: CategoryService,
  ) {}

  @Post('command')
  async command(@Request() req, @Body('text') text: string) {
    return await this.ai.command(req.user, text);
  }

  @Post('voice')
  async voice(@Request() req, @Body('voice') voice: string) {
    const data = Buffer.from(voice, 'base64');
    const accounts = await this.account.listAccounts(req.user);
    const categories = await this.category.listCategories(req.user);
    const prompt = `下面是一些常用词：${accounts
      .map((a) => a.name)
      .join(' ')} ${categories.map((c) => c.name).join(' ')}`;
    let start = Date.now();
    const text = await this.speechToText.speechToText(data, prompt);
    this.logger.log(`STT cost ${Date.now() - start}ms`);
    start = Date.now();
    const res = await this.ai.command(req.user, text);
    this.logger.log(`GPT cost ${Date.now() - start}ms`);
    return res;
  }
}
