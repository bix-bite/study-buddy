/* eslint-disable react/function-component-definition */
import * as React from 'react';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { IChatProps } from '../types/chatProps';

const ChatRight: React.FC<IChatProps> = ({ message, otherText }) => {
  const StyledPaper = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    marginBottom: '2px',
  }));
  return (
    <>
      <ListItem>
        <Grid container>
          <Grid item xs={11}>
            <StyledPaper elevation={3}>
              <Typography>{message}</Typography>
            </StyledPaper>
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

export default ChatRight;
