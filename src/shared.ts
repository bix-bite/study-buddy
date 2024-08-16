export default class Shared {
  static formattedNow(): string {
    const now = new Date();

    const padStart = (value: number) => value.toString().padStart(2, '0');

    return (
      `${now.getFullYear()}${padStart(now.getMonth())}${padStart(now.getDate())}_` +
      `${padStart(now.getHours())}${padStart(now.getMinutes())}${padStart(now.getSeconds())}_` +
      `${now.getMilliseconds()}`
    );
  }

  static keys = {
    STORE: 'StudyBuddy.AI',
    TRANSCRIBE_STORE: 'StudyBuddy.Transcripts.AI',
    OPENAI_KEY: 'openAiKey',
    ANTHROPIC_KEY: 'anthropicKey',
    OPENAI_MODEL_LIST: 'openAiModelList',
    ANTHROPIC_MODEL_LIST: 'anthropicModelList',
    OPENAI_MODEL: 'openAiModel',
    ANTHROPIC_MODEL: 'anthropicModel',
    LLM_LIST: 'LLMList',
    PREFERRED_LLM: 'PreferredLLM',
    SUMMARY_PROMPT: 'SummaryPrompt',
    STUDY_GUIDE_PROMPT: 'StudyGuidePrompt',
    DEFAULT_ANTHROPIC_MODEL_LIST: [
      'claude-3-5-sonnet-20240620',
      'claude-3-haiku-20240307',
      'claude-3-opus-20240229',
      'gpt-4',
    ],
    DEFAULT_OPENAI_MODEL_LIST: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
    ],
    DEFAULT_STUDY_GUIDE_PROMPT:
      'Create a comprehensive study guide based on the material provided in this transcript of a ' +
      'class lecture and areas I should research for further study to better understand the topics covered.  ' +
      'Format your reply with markdown syntax',
    DEFAULT_SUMMARY_PROMPT:
      'Create a detailed, organized record of the following audio transcript of a lecture.  ' +
      'Format your reply with markdown syntax.',
    DEFAULT_LLM_LIST: ['OpenAI', 'Claude'],
    DEFAULT_PREFERRED_LLM: 'OpenAI',
  };
}
