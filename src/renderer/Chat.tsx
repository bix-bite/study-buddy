import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';

import ChatLeft from './ChatLeft';
import ChatRight from './ChatRight';

import styles from '../styles/chat.module.css';
import Shared from '../shared';

export default function Chat() {
  const [apiKeys, setApiKeys] = React.useState({
    openAiKey: '',
    anthropicKey: '',
  });

  const longMessage1 =
    'Hey, Iam Good! What about you ? Hey, Iam Good! What about you ? Hey, Iam Good! What about you ? Hey, Iam Good! What about you ? Hey, Iam Good! What about you ?';

  React.useEffect(() => {
    const getKeys = async () => {
      const openAiKey = await window.electron.ipcRenderer.StoreGet(
        Shared.keys.STORE,
        Shared.keys.OPENAI_KEY,
      );
      const anthropicKey = await window.electron.ipcRenderer.StoreGet(
        Shared.keys.STORE,
        Shared.keys.ANTHROPIC_KEY,
      );
      setApiKeys({ openAiKey, anthropicKey });
    };
    getKeys();
  }, []);

  return (
    <Grid container component={Paper} className={styles.chatSection}>

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
