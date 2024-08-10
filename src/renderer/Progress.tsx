import * as React from 'react';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import { Box, CircularProgress } from '@mui/material';

export default function Progress() {
  const [progress, setProgress] = React.useState(0);
  const [buffer, setBuffer] = React.useState(10);

  const progressRef = React.useRef(() => {});
  React.useEffect(() => {
    progressRef.current = () => {
      if (progress > 100) {
        setProgress(0);
        setBuffer(10);
      } else {
        const diff = Math.random() * 10;
        const diff2 = Math.random() * 10;
        setProgress(progress + diff);
        setBuffer(progress + diff + diff2);
      }
    };
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current();
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Stack sx={{ width: '100%', color: 'grey.500' }} spacing={2}>
        <LinearProgress color="secondary" />
        <LinearProgress color="success" />
        <LinearProgress color="inherit" />
      </Stack>
      <Box sx={{ py: '15px', width: '100%' }}>
        <LinearProgress
          variant="buffer"
          value={progress}
          valueBuffer={buffer}
        />
      </Box>
      <Stack spacing={2} direction="row">
        <CircularProgress color="secondary" variant="determinate" value={25} />
        <CircularProgress color="warning" variant="determinate" value={50} />
        <CircularProgress color="primary" variant="determinate" value={75} />
        <CircularProgress color="success" variant="determinate" value={100} />
        <CircularProgress variant="determinate" value={progress} />
      </Stack>
    </>
  );
}
