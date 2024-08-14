import * as React from 'react';
import { useWhisper } from '@chengsokdara/use-whisper';
import { OpenAI } from '@langchain/openai';
import { start } from 'repl';

interface TranscriptionProps {
  apiKey: string;
}

function TranscriptionComponent(props: TranscriptionProps) {
  const { apiKey } = props;
  const {
    recording,
    speaking,
    transcribing,
    transcript,
    pauseRecording,
    startRecording,
    stopRecording,
  } = useWhisper({
    apiKey: apiKey,
    removeSilence: true,
  });

  const [request, setRequest] = React.useState<{
    request: '' | 'run' | 'stop';
    counter: number;
  }>({ request: '', counter: 0 });
  const [state, setState] = React.useState<'idle' | 'recording'>('idle');
  const [transcriptSegments, setTranscriptSegments] = React.useState<string[]>(
    [],
  );

  React.useEffect(() => {
    if (transcript.text) {
      setTranscriptSegments([...transcriptSegments, transcript.text]);
    }
  }, [transcript.text]);

  React.useEffect(() => {
    const handle = async () => {
      if (request.request == '') {
        return;
      }
      if (state == 'recording') {
        stopRecording();
      }
      if (request.request === 'run') {
        startRecording();
        setState('recording');
      }
    };
    handle();
  }, [request]);

  return (
    <div>
      <p>State: {state}</p>
      <p>Transcribed Text: {transcriptSegments.join(' ')}</p>
      <button
        onClick={() =>
          setRequest({ request: 'run', counter: request.counter + 1 })
        }
      >
        Start/Transcribe/Continue
      </button>
      <button
        onClick={() =>
          setRequest({ request: 'stop', counter: request.counter + 1 })
        }
      >
        Stop
      </button>
    </div>
  );

  // const { transcript } = useWhisper({
  //   apiKey: apiKey, // YOUR_OPEN_AI_TOKEN
  //   streaming: true,
  //   timeSlice: 1_000, // 1 second
  //   whisperConfig: {
  //     language: 'en',
  //   },
  // })

  // return (
  //   <div>
  //     <h3>Transcript:</h3>
  //     <p>{transcript.text}</p>
  //   </div>
  // )
}

export default function Transcribe2() {
  const [openAiKey, setOpenAiKey] = React.useState('');
  React.useEffect(() => {
    const getKeys = async (): Promise<any> => {
      const setterAlgo = async (
        name: string,
        setter: (value: any) => void,
        defaultValue?: any,
      ) => {
        let retrieve = await window.electron.ipcRenderer.StoreGet(
          'StudyBuddy.AI',
          name,
        );
        setter(retrieve || defaultValue);
        return retrieve || defaultValue;
      };
      await setterAlgo('openAiKey', setOpenAiKey);
    };
    getKeys();
  }, []);

  if (openAiKey) {
    return <TranscriptionComponent apiKey={openAiKey} />;
  }
}
