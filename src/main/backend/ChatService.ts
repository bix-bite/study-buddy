import OpenAI from 'openai';
import fs from 'fs';

process.env.LANGCHAIN_TRACING_V2 = 'true';
process.env.LANGCHAIN_API_KEY =
  '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';

// Reduce tracing latency if you are not in a serverless environment
// process.env.LANGCHAIN_CALLBACKS_BACKGROUND=true

export default class ChatService {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    public OpenAIKey: string,
    public AnthropicKey: string,
  ) {}

  async Transcribe(audioFile: string): Promise<string> {
    console.log(`ChatService Transcribe with key ${this.OpenAIKey}`);
    const openai = new OpenAI({
      apiKey: this.OpenAIKey,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile),
      model: 'whisper-1',
      language: 'en', // this is optional but helps the model
    });
    return transcription.text;
  }
}
