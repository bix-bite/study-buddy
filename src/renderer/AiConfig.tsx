/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import Grid from '@mui/material/Grid';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {
  MenuItem,
  Select,
  Stack,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import Shared from '../shared';
import TextareaAutosize from './TextAreaAutoSize';

export default function AiConfig() {
  const [openAiKey, setOpenAiKey] = React.useState('');
  const [anthropicKey, setAnthropicKey] = React.useState('');
  const [groqKey, setGroqKey] = React.useState('');

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
      await setterAlgo(Shared.keys.GROQ_KEY, setGroqKey);
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
      await saverAlgo(Shared.keys.GROQ_KEY, groqKey);
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
      <Grid p={3} item xs={4}>
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
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-helper-label">
              Open AI Model
            </InputLabel>
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
          </FormControl>
        </Stack>
      </Grid>
      <Grid p={3} item xs={4}>
        <Stack spacing={2}>
          <TextField
            sx={{ margin: '20px' }}
            fullWidth
            name="anthropicKey"
            label="Anthropic API Key:"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            variant="standard"
          />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-helper-label">
              Anthropic Model
            </InputLabel>
            <Select
              sx={{ margin: '20px' }}
              fullWidth
              labelId="anthropicModel"
              id="anthropicModel"
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
          </FormControl>
        </Stack>
      </Grid>
      <Grid p={3} item xs={4}>
        <Stack spacing={2}>
          <TextField
            sx={{ margin: '20px' }}
            fullWidth
            name="groqKey"
            label="Groq API Key:"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            variant="standard"
          />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-helper-label">
              Preferred LLM
            </InputLabel>
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
          </FormControl>
        </Stack>
      </Grid>
      <Grid p={3} item xs={6}>
        <Stack spacing={2}>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Typography paddingY={3} variant="h5">
              Summary Request Prompt
            </Typography>
            <Typography
              marginBottom={2}
              variant="caption"
              display="block"
              gutterBottom
            >
              Prompt message sent to LLM to create a summary of transcript text.
            </Typography>
            <TextareaAutosize
              value={summaryPrompt}
              minRows={2}
              maxRows={3}
              onChange={(e) => setSummaryPrompt(e.target.value)}
            />
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Typography paddingY={3} variant="h5">
              Study Guide Request Prompt
            </Typography>
            <Typography
              marginBottom={2}
              variant="caption"
              display="block"
              gutterBottom
            >
              Prompt message sent to LLM to create a study guide of transcript
              text.
            </Typography>
            <TextareaAutosize
              value={studyGuidePrompt}
              minRows={2}
              maxRows={3}
              onChange={(e) => SetstudyGuidePrompt(e.target.value)}
            />
          </FormControl>
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
