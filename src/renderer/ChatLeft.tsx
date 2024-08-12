/* eslint-disable react/function-component-definition */
import * as React from 'react';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { IChatProps } from '../types/chatProps';

const ChatLeft: React.FC<IChatProps> = ({ message, otherText }) => {
  return (
    <>
      <ListItem>
        <Grid container>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <ListItemText primary={message} />
          </Grid>
          <Grid item xs={1}>
            <ListItemText secondary={otherText} />
          </Grid>
        </Grid>
      </ListItem>
      <Divider />
    </>
  );
};

export default ChatLeft;
