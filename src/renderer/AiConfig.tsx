import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { MenuItem, Select, Stack, styled } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: 60,
  lineHeight: '60px',
}));

export default function AiConfig() {
  const [openAiKey, setOpenAiKey] = React.useState('');
  const [anthropicKey, setAnthropicKey] = React.useState('');

  const [openAiModel, setOpenAiModel] = React.useState('');
  const [anthropicModel, setAnthropicModel] = React.useState('');

  const [openAiModelList, setOpenAiModelList] = React.useState<string[]>([]);
  const [anthropicModelList, setAnthropicModelList] = React.useState<string[]>(
    [],
  );

  const [updateFlag, setUpdateFlag] = React.useState(false);

  // at startup
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
      await setterAlgo('anthropicKey', setAnthropicKey);
      let list = await setterAlgo('openAiModelList', setOpenAiModelList, [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
      ]);
      await setterAlgo('openAiModel', setOpenAiModel, list[0]);
      list = await setterAlgo('anthropicModelList', setAnthropicModelList, [
        'claude-3-5-sonnet-20240620',
        'claude-3-haiku-20240307',
        'claude-3-opus-20240229',
        'gpt-4',
      ]);
      await setterAlgo('anthropicModel', setAnthropicModel, list[0]);
    };
    getKeys();
  }, []);

  React.useEffect(() => {
    const saveKeys = async () => {
      const saverAlgo = async (name: string, value: any) =>
        window.electron.ipcRenderer.StoreSet('StudyBuddy.AI', name, value);
      await saverAlgo('openAiKey', openAiKey);
      await saverAlgo('anthropicKey', anthropicKey);
      await saverAlgo('openAiModelList', openAiModelList);
      await saverAlgo('anthropicModelList', anthropicModelList);
      await saverAlgo('openAiModel', openAiModel);
      await saverAlgo('anthropicModel', anthropicModel);
    };
    if (updateFlag) {
      saveKeys();
    }
  }, [updateFlag]);

  const onSubmit = () => {
    setUpdateFlag(true);
  };

  // const saveKeys = (event) => {
  //   setUpdateFlag(!updateFlag);
  //   event.preventDefault();
  // };

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
