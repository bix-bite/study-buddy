import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

type states = 'Start' | 'Stop' | 'Clear';
export default function Component() {
  const [state, setState] = React.useState<states>('Clear');
  const [msg, setMessage] = React.useState<string>('');
  const [transcription, setTranscription] = React.useState<string>('');

  let mediaRecorder: MediaRecorder;
  let audioChunks: Blob[] = [];

  const changeState = (newState: states) => {
    transition(newState);
  };

  async function transition(newState: states) {
    try {
      if (newState == 'Start') {
        setMessage('starting recording...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.onload = async () => {
            const res = reader.result as ArrayBuffer;
            const buffer = Buffer.from(res);
            const fileName = await window.electron.ipcRenderer.saveAudio(buffer);
          };
          reader.readAsArrayBuffer(audioBlob);

          audioChunks = []; // Clear the chunks for the next recording
        };

        mediaRecorder.start();

        setMessage('RECORDING AUDIO');
      } else if (newState == 'Stop') {
        setMessage('stopping recording...');
        mediaRecorder.stop();

        setMessage('transcribing');
        // const result = await window.electron.ipcRenderer.transcribe();
        setTranscription(' No Transcription content');
      } else if (newState = 'Clear') {
        if (state == 'Start') {
          // await window.electron.ipcRenderer.stopRecording();
        }
        setMessage('Cleared');
        setTranscription('');
      }
    } catch (error) {
      setMessage('Error');
      setTranscription(JSON.stringify(error));
    }
  }

  return (
    <>
      <Stack spacing={2} direction="row">
        <Button onClick={() => changeState('Start')} variant="text">Start Recording</Button>
        <Button onClick={() => changeState('Stop')} variant="text">Stop Recording</Button>
        <Button onClick={() => changeState('Clear')} variant="text">Clear</Button>
      </Stack>
      <h2>{msg}</h2>
      <hr />
      {transcription?.length > 0 && (
        <div>
          <h3>Transcription</h3>
          <h2>{transcription}</h2>
        </div>
      )}
    </>
  );
}
