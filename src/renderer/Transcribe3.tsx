import React, { useState, useEffect, useRef } from 'react';
import { WhisperApi } from 'whisper-api';

const WHISPER_API_KEY = 'your-whisper-api-key';

interface TranscriptionProps {
  apiKey: string;
}


function AudioTranscription(props: TranscriptionProps) {
  const { apiKey } = props;
  const [transcription, setTranscription] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioChunksRef = useRef<Blob[]>([]);
  const whisper = new WhisperApi(apiKey);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  let mediaRecorder: MediaRecorder;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          sendAudioForTranscription(event.data);
        }
      };

      mediaRecorder.start(1000); // Record in chunks of 1 second
    } catch (error) {
      console.error('Error accessing audio stream:', error);
    }
  };

  const stopRecording = () => {
    const stream = (mediaRecorder as any).stream;
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      const transcriptionResponse = await whisper.transcribe({
        file: audioBlob,
        fileName: 'audio_chunk.wav',
        language: 'en', // Specify language if needed
      });
      setTranscription((prev) => prev + transcriptionResponse.text + ' ');
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div>
      <h1>Audio Transcription</h1>
      <button onClick={toggleRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div>
        <h2>Transcription:</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default function Transcribe3() {
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
    return <AudioTranscription apiKey={openAiKey} />;
  }
}
