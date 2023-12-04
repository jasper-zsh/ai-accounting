import { Module } from '@nestjs/common';
import {
  SpeechToTextInterface,
  TextToSpeechInterface,
} from './voice.interface';
import { OpenAIVoiceService } from './openai.service';

@Module({
  providers: [
    {
      provide: TextToSpeechInterface,
      useClass: OpenAIVoiceService,
    },
    {
      provide: SpeechToTextInterface,
      useClass: OpenAIVoiceService,
    },
  ],
  exports: [TextToSpeechInterface, SpeechToTextInterface],
})
export class VoiceModule {}
