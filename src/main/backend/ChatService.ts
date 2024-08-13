// import { ChatAnthropic } from '@langchain/anthropic/';
// import { ChatOpenAI } from '@langchain/openai';
// import { HumanMessage, SystemMessage } from '@langchain/core/messages';

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
}
