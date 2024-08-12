import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import ChatLeft from './ChatLeft';
import ChatRight from './ChatRight';

import styles from '../styles/chat.module.css';

export default function Chat() {
  const [apiKeys, setApiKeys] = React.useState({
    openAiKey: '',
    anthropicKey: '',
  });

  const handleChange = (event) => {
    const { name } = event.target;
    const { value } = event.target;
    setApiKeys((values) => ({ ...values, [name]: value }));
  };

  const saveKeys = (event) => {
    window.electron.ipcRenderer.StoreSet(
      'StudyBuddy.AI',
      'openAiKey',
      apiKeys.openAiKey,
    );
    window.electron.ipcRenderer.StoreSet(
      'StudyBuddy.AI',
      'anthropicKey',
      apiKeys.anthropicKey,
    );
    event.preventDefault();
  };

  const longMessage1 =
    'Hey, Iam Good! What about you ? Hey, Iam Good! What about you ? Hey, Iam Good! What about you ? Hey, Iam Good! What about you ? Hey, Iam Good! What about you ?';

  React.useEffect(() => {
    const getKeys = async () => {
      const openAiKey = await window.electron.ipcRenderer.StoreGet(
        'StudyBuddy.AI',
        'openAiKey',
      );
      const anthropicKey = await window.electron.ipcRenderer.StoreGet(
        'StudyBuddy.AI',
        'anthropicKey',
      );
      setApiKeys({ openAiKey, anthropicKey });
    };
    getKeys();
  }, []);
  return (
    <Grid container component={Paper} className={styles.chatSection}>
      <Grid item xs={12}>
        <TextField
          name="openAiKey"
          value={apiKeys.openAiKey || ''}
          onChange={handleChange}
          label="Open AI API key:"
          variant="standard"
        />
        <TextField
          name="anthropicKey"
          value={apiKeys.anthropicKey || ''}
          onChange={handleChange}
          label="Anthropic API key:"
          variant="standard"
        />
        <Button onClick={saveKeys} variant="outlined">
          submit
        </Button>
      </Grid>
      <Grid item xs={12}>
        <List className={styles.messageArea}>
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft
            message="Hey, Iam Good! What about you ?"
            otherText="09:31"
          />
          <ChatRight
            message="Cool. i am good, let's catch up!"
            otherText="09:32"
          />
          <ChatRight message="Hey man, What's up ?" otherText="09:30" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
          <ChatLeft message={longMessage1} otherText="09:31" />
          <ChatRight message={longMessage1} otherText="09:32" />
        </List>
      </Grid>
    </Grid>
  );
}
