import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import { SpeechToTextInterface } from '@/voice/voice.interface';

@Controller('ai')
@UseGuards(AuthenticatedGuard)
export class AIController {
  constructor(
    private ai: AIService,
    private speechToText: SpeechToTextInterface,
  ) {}

  @Post('command')
  async command(@Request() req, @Body('text') text: string) {
    return {
      content: await this.ai.command(req.user, text),
    };
  }

  @Post('voice')
  async voice(@Request() req, @Body('voice') voice: string) {
    const data = Buffer.from(voice, 'base64');
    const text = await this.speechToText.speechToText(data);
    return {
      content: await this.ai.command(req.user, text),
    };
  }
}
