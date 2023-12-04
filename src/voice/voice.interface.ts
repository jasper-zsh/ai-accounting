export abstract class TextToSpeechInterface {
  abstract textToSpeech(text: string): Promise<Buffer>;
}

export abstract class SpeechToTextInterface {
  abstract speechToText(audio: Buffer): Promise<string>;
}
