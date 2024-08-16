import * as React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
export default function Help() {

  const [path, setPath] = React.useState('');
  React.useEffect(() => {
    const ascyncCall = async () => {
      const path = await window.electron.ipcRenderer.DataPath();
      setPath(path)
    }
    ascyncCall();
  } , []);

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">About Study Buddy</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2 }} elevation={5}>
            <Alert severity="info">
              <AlertTitle>Important note before using this application</AlertTitle>
              For most functions, you'll need at least one API key for OpenAI.  See the remaining help for which functions require this and how to add the key to the application.
            </Alert>
            The idea behind this application is to open it up at the beginning
            of an in-class lecture, and
            <ul>
              <li>Click on the 'TRANSCRIBE' tab.</li>
              <li>Click on 'START RECORDING'</li>
              <li>
                Leave the application open and recording audio while you do
                whatever else
              </li>
              <li>At the end of the lecture, hit 'STOP RECORDING'</li>
              <li>
                You wil be prompted to provide a name for the recorded mp3 file.
                The default is fine, but you can change it if you want
              </li>
            </ul>
            At this point, you are technically done with the minimimum feature
            usage. You haven't needed an internet connection or any interaction
            with an LLM yet. Once the recording has completed, you have the
            following options, which will require an internet connection:
            <ul>
              <li>
                {' '}
                In the table showing all your recordings, you'll see a new row
                with your recently saved recording. Hit 'TRANSCRIBE'. Note that
                this will use the OpenAI 'Whisper' api, and you will need to
                have added a valid OpenAI API key on the 'AI CONFIGURATION' tab.
              </li>
              <li>
                The application wil send the audio file off for text transcript.
                This can take a while. For example, a 30 minute audio file can
                take up to 60 seconds to transcribe in my testing
              </li>
            </ul>
            Now that you have a text transcript of the recorded lecture, you can
            use the AI features to process it further by clicking on the AI
            'SUMMARIZE' or Study Guide 'CREATE' button.
          </Paper>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">AI Configuration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2 }} elevation={5}>
            <Typography>
              In order to use the Transcribe Ta's Transcription, Summarization,
              or Study Guide features, you will need to add API keys to the AI
              Configuration tab. These keys are used when calling the LLM API.
            </Typography>
            <ul>
              <li>
                You will need at least the Open AI API key if you wan to use the
                transcription feature.
              </li>
              <li>
                For Summarization and Study Guide creation, you will need an
                Anthropic API key IF you choose Anthropic as your default LLM
              </li>
            </ul>
          </Paper>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h5">Other Tips and tricks</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2 }} elevation={5}>
            <ul>
              <li>
                Use the 'ADD MANUAL TRANSCRIPT' button if you have the
                transcript text from another source already, but want to have it
                in this syatem so you can use the summary and study guide
                feature
              </li>
              <li>
                You can always rerun the transcription, summarization, or study
                guide features by clicking on the arrow icon next to them and
                deleting the content of whichever you want to rerun.
              </li>
              <li>
                If you are by chance a blood relative of the developer, check
                our shared Google account's docs on the web for API keys. If
                not, you'll have to go buy credits and generate your own.
              </li>
              <li>
                The data for all of this can be found in the <strong>{path}</strong> directory json files.
                You can manually modify these files, but be careful - you couuld also break the app if you screw up the json too badly.
                <ul>
                  <li><strong>StudyBuddy.Transcripts.AI.json</strong>: All the recordings/transcripts summaries</li>
                  <li><strong>StudyBuddy.AI.json</strong>: All the settings for the application (AI model settings, prompt text, keys, etc.).</li>
                </ul>
              </li>
            </ul>
          </Paper>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
