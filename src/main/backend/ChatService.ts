import fs from 'fs';

import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import SimpleElectronStore from './SimpleElectronStore';
import Shared from '../../shared';

process.env.LANGCHAIN_TRACING_V2 = 'true';
process.env.LANGCHAIN_API_KEY =
  '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';
// Reduce tracing latency if you are not in a serverless environment
// process.env.LANGCHAIN_CALLBACKS_BACKGROUND=true

export interface IChatServiceResponse {
  status: 'SUCCESS' | 'FAILURE';
  text: string;
  error?: any;
}

export default class ChatService {
  dataStore: SimpleElectronStore;

  constructor() {
    this.dataStore = new SimpleElectronStore();
  }

  private static success(text: string): IChatServiceResponse {
    return {
      status: 'SUCCESS',
      text,
    };
  }

  private static err(errObj: any): IChatServiceResponse {
    return {
      status: 'FAILURE',
      text: '',
      error: errObj,
    };
  }

  private anthropicKey(): string {
    const anthropicKey = this.dataStore.get<string>(
      Shared.keys.STORE,
      Shared.keys.ANTHROPIC_KEY,
    );
    if (anthropicKey === undefined || anthropicKey.length === 0) {
      throw new Error('anthropic key not set. Unable to call API');
    }
    process.env.ANTHROPIC_API_KEY = anthropicKey;

    return anthropicKey;
  }

  private openAiKey(): string {
    const openAiKey = this.dataStore.get<string>(
      Shared.keys.STORE,
      Shared.keys.OPENAI_KEY,
    );
    if (openAiKey === undefined || openAiKey.length === 0) {
      throw new Error('Open AI key not set. Unable to call transcription API');
    }
    return openAiKey;
  }

  private openAiModelName(): string {
    return (
      this.dataStore.get<string>(Shared.keys.STORE, Shared.keys.OPENAI_MODEL) ||
      Shared.keys.DEFAULT_OPENAI_MODEL_LIST[0]
    );
  }

  private anthropicModelName(): string {
    return (
      this.dataStore.get<string>(
        Shared.keys.STORE,
        Shared.keys.ANTHROPIC_MODEL,
      ) || Shared.keys.DEFAULT_ANTHROPIC_MODEL_LIST[0]
    );
  }

  private openAiModel(): {
    model: BaseChatModel;
    modelName: string;
    key: string;
  } {
    const modelName = this.openAiModelName();
    const key = this.openAiKey();
    return {
      model: new ChatOpenAI({
        apiKey: key,
        model: this.openAiModelName(),
      }),
      modelName,
      key,
    };
  }

  private anthropicModel(): {
    model: BaseChatModel;
    modelName: string;
    key: string;
  } {
    const modelName = this.anthropicModelName();
    const key = this.anthropicKey();
    return {
      model: new ChatAnthropic({
        model: this.anthropicModelName(),
      }),
      modelName,
      key,
    };
  }

  private preferredModel(additionalLog?: string): BaseChatModel {
    const LLM =
      this.dataStore.get<string>(
        Shared.keys.STORE,
        Shared.keys.PREFERRED_LLM,
      ) || Shared.keys.DEFAULT_PREFERRED_LLM;

    const LLMInfo =
      LLM === 'Claude' ? this.anthropicModel() : this.openAiModel();

    const msgs: string[] = [
      ` using ${LLM} -> ${LLMInfo.modelName} -> ${LLMInfo.key}`,
    ];
    if (additionalLog) {
      msgs.push(additionalLog);
    }
    this.dataStore.sessionLog(msgs);
    return LLMInfo.model;
  }

  async transcribe(audioFile: string): Promise<IChatServiceResponse> {
    try {
      const openai = new OpenAI({
        apiKey: this.openAiKey(),
      });

      const transcript = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFile),
        model: 'whisper-1',
        language: 'en', // this is optional but helps the model
      });
      return ChatService.success(transcript.text);
    } catch (error) {
      return ChatService.err(error);
    }
  }

  async transcriptSummary(transcript: string): Promise<IChatServiceResponse> {
    try {
      const prompt =
        this.dataStore.get<string>(
          Shared.keys.STORE,
          Shared.keys.SUMMARY_PROMPT,
        ) || Shared.keys.DEFAULT_SUMMARY_PROMPT;
      const result = await this.preferredModel().invoke([
        new SystemMessage(prompt),
        new HumanMessage(transcript),
      ]);
      const parser = new StringOutputParser();
      const textResponse = await parser.invoke(result);

      return ChatService.success(textResponse);
    } catch (error) {
      return ChatService.err(error);
    }
  }

  async transcriptStudyGuide(
    transcript: string,
  ): Promise<IChatServiceResponse> {
    try {
      const prompt =
        this.dataStore.get<string>(
          Shared.keys.STORE,
          Shared.keys.STUDY_GUIDE_PROMPT,
        ) || Shared.keys.DEFAULT_STUDY_GUIDE_PROMPT;

      const result = await this.preferredModel().invoke([
        new SystemMessage(prompt),
        new HumanMessage(transcript),
      ]);
      const parser = new StringOutputParser();
      const textResponse = await parser.invoke(result);

      return ChatService.success(textResponse);
    } catch (error) {
      return ChatService.err(error);
    }
  }
}
