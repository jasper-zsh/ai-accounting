import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { AccountingModule } from '@/accounting/accounting.module';
import { VoiceModule } from '@/voice/voice.module';

@Module({
  imports: [AccountingModule, VoiceModule],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
