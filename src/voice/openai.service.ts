import { Config } from '@/config';
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
  SpeechToTextInterface,
  TextToSpeechInterface,
} from './voice.interface';
import { Blob } from 'buffer';

@Injectable()
export class OpenAIVoiceService
  implements TextToSpeechInterface, SpeechToTextInterface
{
  private readonly logger = new Logger('OpenAIVoiceService');
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: Config.OPENAI_API_KEY,
    });
  }
  async textToSpeech(text: string): Promise<Buffer> {
    const res = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      response_format: 'opus',
      input: text,
    });
    return Buffer.from(await res.arrayBuffer());
  }
  async speechToText(audio: Buffer): Promise<string> {
    const blob = new Blob([audio]) as any;
    blob.name = 'voice.webm';
    blob.lastModified = 0;
    const res = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: blob,
    });
    this.logger.log(`STT result: ${res.text}`);
    return res.text;
  }
}
