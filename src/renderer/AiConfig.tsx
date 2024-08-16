/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {
  MenuItem,
  Select,
  Stack,
  styled,
  TextareaAutosize as BaseTextareaAutosize,
} from '@mui/material';
import Shared from '../shared';

const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const TextareaAutosize = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: 90%;
  max-width: 95%;
  max-height: 80%;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

export default function AiConfig() {
  const [openAiKey, setOpenAiKey] = React.useState('');
  const [anthropicKey, setAnthropicKey] = React.useState('');

  const [openAiModel, setOpenAiModel] = React.useState('');
  const [anthropicModel, setAnthropicModel] = React.useState('');

  const [openAiModelList, setOpenAiModelList] = React.useState<string[]>([]);
  const [anthropicModelList, setAnthropicModelList] = React.useState<string[]>(
    [],
  );

  const [llmList, setLlmList] = React.useState<string[]>([]);
  const [preferredLLM, setPreferredLLM] = React.useState('');

  const [summaryPrompt, setSummaryPrompt] = React.useState('');
  const [studyGuidePrompt, SetstudyGuidePrompt] = React.useState('');

  const [updateFlag, setUpdateFlag] = React.useState(false);

  // at startup
  React.useEffect(() => {
    const getKeys = async (): Promise<any> => {
      const setterAlgo = async (
        name: string,
        setter: (value: any) => void,
        defaultValue?: any,
      ) => {
        const retrieve = await window.electron.ipcRenderer.StoreGet(
          Shared.keys.STORE,
          name,
        );
        setter(retrieve || defaultValue);
        return retrieve || defaultValue;
      };

      await setterAlgo(
        Shared.keys.STUDY_GUIDE_PROMPT,
        SetstudyGuidePrompt,
        Shared.keys.DEFAULT_STUDY_GUIDE_PROMPT,
      );
      await setterAlgo(
        Shared.keys.SUMMARY_PROMPT,
        setSummaryPrompt,
        Shared.keys.DEFAULT_SUMMARY_PROMPT,
      );

      await setterAlgo(Shared.keys.OPENAI_KEY, setOpenAiKey);
      await setterAlgo(Shared.keys.ANTHROPIC_KEY, setAnthropicKey);
      let list = await setterAlgo(
        Shared.keys.OPENAI_MODEL_LIST,
        setOpenAiModelList,
        Shared.keys.DEFAULT_OPENAI_MODEL_LIST,
      );
      await setterAlgo(Shared.keys.OPENAI_MODEL, setOpenAiModel, list[0]);
      list = await setterAlgo(
        Shared.keys.ANTHROPIC_MODEL_LIST,
        setAnthropicModelList,
        Shared.keys.DEFAULT_ANTHROPIC_MODEL_LIST,
      );
      await setterAlgo(Shared.keys.ANTHROPIC_MODEL, setAnthropicModel, list[0]);

      await setterAlgo(
        Shared.keys.LLM_LIST,
        setLlmList,
        Shared.keys.DEFAULT_LLM_LIST,
      );

      await setterAlgo(
        Shared.keys.PREFERRED_LLM,
        setPreferredLLM,
        Shared.keys.DEFAULT_PREFERRED_LLM,
      );
    };
    getKeys();
  }, []);

  React.useEffect(() => {
    const saveKeys = async () => {
      const saverAlgo = async (name: string, value: any) =>
        window.electron.ipcRenderer.StoreSet('StudyBuddy.AI', name, value);
      await saverAlgo(Shared.keys.OPENAI_KEY, openAiKey);
      await saverAlgo(Shared.keys.ANTHROPIC_KEY, anthropicKey);
      await saverAlgo(Shared.keys.OPENAI_MODEL_LIST, openAiModelList);
      await saverAlgo(Shared.keys.ANTHROPIC_MODEL_LIST, anthropicModelList);
      await saverAlgo(Shared.keys.OPENAI_MODEL, openAiModel);
      await saverAlgo(Shared.keys.ANTHROPIC_MODEL, anthropicModel);
      await saverAlgo(Shared.keys.LLM_LIST, llmList);
      await saverAlgo(Shared.keys.PREFERRED_LLM, preferredLLM);
      await saverAlgo(Shared.keys.STUDY_GUIDE_PROMPT, studyGuidePrompt);
      await saverAlgo(Shared.keys.SUMMARY_PROMPT, summaryPrompt);
    };
    if (updateFlag) {
      saveKeys();
    }
  }, [updateFlag]);

  const onSubmit = () => {
    setUpdateFlag(true);
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Stack spacing={2}>
          <TextField
            sx={{ margin: '20px' }}
            fullWidth
            name="openAiKey"
            label="Open AI API key:"
            value={openAiKey}
            onChange={(e) => setOpenAiKey(e.target.value)}
            variant="standard"
          />
          <Select
            sx={{ margin: '20px' }}
            fullWidth
            labelId="openAiModel"
            id="openAiModel"
            value={openAiModel}
            label="Open AI Model"
            onChange={(e) => setOpenAiModel(e.target.value)}
          >
            {openAiModelList.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
          <TextField
            sx={{ margin: '20px' }}
            fullWidth
            name="anthropicKey"
            label="Anthropic API Key:"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            variant="standard"
          />
          <Select
            sx={{ margin: '20px' }}
            fullWidth
            labelId="anthropicKey"
            id="anthropicKey"
            value={anthropicModel}
            label="Anthropic Model"
            onChange={(e) => setAnthropicModel(e.target.value)}
          >
            {anthropicModelList.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
          <Select
            sx={{ margin: '20px' }}
            fullWidth
            labelId="preferredLLM"
            id="preferredLLM"
            value={preferredLLM}
            label="preferred LLM"
            onChange={(e) => setPreferredLLM(e.target.value)}
          >
            {llmList.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
          <TextareaAutosize
            value={summaryPrompt}
            minRows={1}
            maxRows={3}
            onChange={(e) => setSummaryPrompt(e.target.value)}
          />
          <TextareaAutosize
            value={studyGuidePrompt}
            minRows={1}
            maxRows={3}
            onChange={(e) => SetstudyGuidePrompt(e.target.value)}
          />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Button onClick={onSubmit} variant="outlined">
          submit
        </Button>
      </Grid>
    </Grid>
  );
}
