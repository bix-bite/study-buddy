import OpenAI from 'openai';
import fs from 'fs';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
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

  async TranscriptionSummry(transcription: string): Promise<string> {
    const model = new ChatOpenAI({ apiKey: this.OpenAIKey, model: 'gpt-4o' });

    const messages = [
      new SystemMessage(
        'Create a detailed, organized record of the following audio transcription of a lecture.  ' +
          'Format your reply with markdown syntax.',
      ),
      new HumanMessage(transcription),
    ];

    const result = await model.invoke(messages);
    const parser = new StringOutputParser();
    const textResponse = await parser.invoke(result);
    return textResponse;
  }

  async TranscriptionStudyGuide(transcription: string): Promise<string> {
    const model = new ChatOpenAI({ apiKey: this.OpenAIKey, model: 'gpt-4o' });

    const messages = [
      new SystemMessage(
        'Create a comprehensive study guide based on the material provided in this transcription of a ' +
          'class lecture and areas I should research for further study to better understand the topics covered.  ' +
          'Format your reply with markdown syntax',
      ),
      new HumanMessage(transcription),
    ];

    const result = await model.invoke(messages);
    const parser = new StringOutputParser();
    const textResponse = await parser.invoke(result);
    return textResponse;
  }
}
