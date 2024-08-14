import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type states = 'Start' | 'Stop' | 'Clear';

interface ITranscribeInstance {
  file: string;
  note: string;
  transcription: string;
  AISummary: string;
}

export default function Component() {
  const [updateFlag, setUpdateFlag] = React.useState(false);

  const [state, setState] = React.useState<states>('Clear');
  const [msg, setMessage] = React.useState<string>('');

  const [mediaRecorder, setMediaRecorder] = React.useState<
    MediaRecorder | undefined
  >(undefined);
  const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);
  const [arrayBuffer, setArrayBuffer] = React.useState<ArrayBuffer | undefined>(
    undefined,
  );

  const [transcribeInstanceList, setTranscribeInstanceList] = React.useState<
    ITranscribeInstance[]
  >([]);

  const [pageCount, setPageCount] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [visibleList, setVisibleList] = React.useState<
  ITranscribeInstance[]
>([]);

  const [transcription, setTranscription] = React.useState<string>('');

    //initial event
    React.useEffect(() => {
      const getList = async () => {
        let retrieve = await window.electron.ipcRenderer.StoreGet(
          'StudyBuddy.Transcriptions.AI',
          'TranscribeList',
        );
        setTranscribeInstanceList(retrieve || []);
      };
      getList();
    }, []);

  React.useEffect(() => {
      const pageCount = Math.floor(transcribeInstanceList.length / rowsPerPage) + 1;
      setPageCount(pageCount);
      const start = page * rowsPerPage;
      const end = (page + 1) * rowsPerPage;
      setVisibleList(transcribeInstanceList.slice(start, end > transcribeInstanceList.length ?  transcribeInstanceList.length : end));
  }, [transcribeInstanceList, page, rowsPerPage]);

  // user state request change
  React.useEffect(() => {
    const checkstate = async () => {
      if (state === 'Start') {
        setMessage('starting recording...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
      } else if (state === 'Stop') {
        if (mediaRecorder) {
          mediaRecorder.stop();
        }
      } else if (state === 'Clear') {
        if (mediaRecorder) {
          mediaRecorder.stop();
          setMessage('Cleared');
        }
      }
    };
    checkstate();
  }, [state]);

  // listen for media recorder data/end events
  React.useEffect(() => {
    if (mediaRecorder) {
      setAudioChunks([]);
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (state === 'Clear') {
        } else {
          setMessage('recording stopped: saving file...');
          const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg-3' });
          const reader = new FileReader();
          reader.onload = async () => {
            setArrayBuffer(reader.result as ArrayBuffer);
          };
          reader.readAsArrayBuffer(audioBlob);
        }

        setAudioChunks([]); // Clear the chunks for the next recording
      };
      mediaRecorder.start();
      setMessage('Recording Audio...');
    }
  }, [mediaRecorder]);

  // save audio as array buffer to file
  React.useEffect(() => {
    const saveFile = async () => {
      const fileName = await window.electron.ipcRenderer.saveAudio(
        arrayBuffer as ArrayBuffer,
      );

      setTranscribeInstanceList([
        ...transcribeInstanceList,
        { file: fileName, AISummary: '', note: '', transcription: '' },
      ]);
      setUpdateFlag(true);
      setMessage(`saved file: ${fileName}`);
      setArrayBuffer(undefined);
    };
    if (arrayBuffer) {
      saveFile();
      setMediaRecorder(undefined);
    }
  }, [arrayBuffer]);

  React.useEffect(() => {
    if (updateFlag) {
      window.electron.ipcRenderer.StoreSet(
        'StudyBuddy.Transcriptions.AI',
        'TranscribeList',
        transcribeInstanceList,
      );
    }
  }, [updateFlag]);

  return (
    <>
      <Stack spacing={2} direction="row">
        <Button onClick={() => setState('Start')} variant="text">
          Start Recording
        </Button>
        <Button
          disabled={!mediaRecorder}
          onClick={() => setState('Stop')}
          variant="text"
        >
          Stop Recording
        </Button>
        <Button onClick={() => setState('Clear')} variant="text">
          Clear
        </Button>
      </Stack>
      <h2>{msg}</h2>
      <hr />
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
              <TableContainer>
                <Table size='small' >
                  <TableBody>
                    {visibleList.map((row, index) => {
                      return (
                        <TableRow
                          hover
                          // onClick={(event) => handleClick(event, row.id)}
                          role="checkbox"
                          // aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.file}
                          // selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell align="right">{row.file}</TableCell>
                          <TableCell align="right">{row.note || 'no note'}</TableCell>
                          <TableCell align="right">{row.transcription || 'no transcript'}</TableCell>
                          <TableCell align="right">{row.AISummary || 'no summary'}</TableCell>
                        </TableRow>
                      );
                    })}

                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={transcribeInstanceList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
              />
            </Paper>
          </Box>
        </Grid>
      </Grid>
      {transcription?.length > 0 && (
        <div>
          <h3>Transcription</h3>
          <h2>{transcription}</h2>
        </div>
      )}
    </>
  );
}
