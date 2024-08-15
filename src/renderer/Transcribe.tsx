/* eslint-disable react-hooks/exhaustive-deps */
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
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
} from '@mui/material';
import Shared from '../shared';

type states = 'Start' | 'Stop' | 'Clear';

interface ITranscribeInstance {
  id: string;
  file: string;
  note: string;
  transcription: string;
  AISummary: string;
}

export default function Component() {
  const [updateFlag, setUpdateFlag] = React.useState(0);

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

  const [openAiKey, setOpenAiKey] = React.useState('');
  const [pageCount, setPageCount] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [visibleList, setVisibleList] = React.useState<ITranscribeInstance[]>(
    [],
  );

  const [requestTranscription, setRequestTranscription] = React.useState<
    ITranscribeInstance | undefined
  >(undefined);

  const [editingItem, setEditingItem] = React.useState<
    ITranscribeInstance | undefined
  >(undefined);

  const [editText, setEditText] = React.useState<string>('');

  const [openNotesDialog, setOpenNotesDialog] = React.useState(false);

  // initial event
  React.useEffect(() => {
    const getList = async () => {
      const key = await window.electron.ipcRenderer.StoreGet(
        'StudyBuddy.AI',
        'openAiKey',
      );
      setOpenAiKey(key);
      const retrieve = await window.electron.ipcRenderer.StoreGet(
        'StudyBuddy.Transcriptions.AI',
        'TranscribeList',
      );
      setTranscribeInstanceList(retrieve || []);
    };
    getList();
  }, []);

  React.useEffect(() => {
    const transcribe = async () => {
      if (requestTranscription) {
        const transcriptionText = await window.electron.ipcRenderer.transcribe(
          requestTranscription?.file,
          openAiKey,
        );

        const toUpdate = transcribeInstanceList.find(
          (x) => x.id === requestTranscription.id,
        );
        if (toUpdate) {
          toUpdate.transcription = transcriptionText;
          setTranscribeInstanceList([...transcribeInstanceList]);
          setUpdateFlag(updateFlag + 1);
        }
      }
    };

    if (requestTranscription !== undefined) {
      transcribe();
    }
  }, [requestTranscription]);

  React.useEffect(() => {
    const count = Math.floor(transcribeInstanceList.length / rowsPerPage) + 1;
    setPageCount(count);
    const start = page * rowsPerPage;
    const end = (page + 1) * rowsPerPage;
    setVisibleList(
      transcribeInstanceList.slice(
        start,
        end > transcribeInstanceList.length
          ? transcribeInstanceList.length
          : end,
      ),
    );
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
          setMessage('cleared');
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
        {
          id: Shared.formattedNow(),
          file: fileName,
          AISummary: '',
          note: '',
          transcription: '',
        },
      ]);
      setUpdateFlag(updateFlag + 1);
      setMessage(
        `saved recording.  Ready to start recording again.  Click "Transcribe" on new recording to transcribe`,
      );
      setArrayBuffer(undefined);
    };
    if (arrayBuffer) {
      saveFile();
      setMediaRecorder(undefined);
    }
  }, [arrayBuffer]);

  React.useEffect(() => {
    if (updateFlag > 0) {
      window.electron.ipcRenderer.StoreSet(
        'StudyBuddy.Transcriptions.AI',
        'TranscribeList',
        transcribeInstanceList,
      );
    }
  }, [updateFlag]);

  const handleClickOpenNoteDialog = (item: ITranscribeInstance) => {
    setEditingItem(item);
    setEditText(item.note);
    setOpenNotesDialog(true);
  };

  const handleCloseNoteDialog = (update: boolean) => {
    setOpenNotesDialog(false);
    if (!update || editingItem === undefined) {
      return;
    }
    const toUpdate = transcribeInstanceList.find(
      (x) => x.id === editingItem.id,
    );
    if (toUpdate) {
      toUpdate.note = editText;
      setTranscribeInstanceList([...transcribeInstanceList]);
      setUpdateFlag(updateFlag + 1);
    }
  };

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
        <Grid item xs={8}>
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>File</TableCell>
                      <TableCell colSpan={2}>Note</TableCell>
                      <TableCell>Transcription</TableCell>
                      <TableCell>AI Summary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleList.map((row, index) => {
                      return (
                        <TableRow
                          hover
                          // onClick={(event) => handleClick(event, row.id)}
                          role="checkbox"
                          // aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          // selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell align="right">
                            {
                              row.file.split('\\')[
                                row.file.split('\\').length - 1
                              ]
                            }
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="caption"
                              display="block"
                              gutterBottom
                            >
                              {row.note || 'no note'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={(e) => handleClickOpenNoteDialog(row)}
                              variant="outlined"
                              size="small"
                            >
                              edit
                            </Button>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="caption"
                              display="block"
                              gutterBottom
                            >
                              {row.transcription || (
                                <Button
                                  onClick={(e) => setRequestTranscription(row)}
                                  variant="outlined"
                                >
                                  Transcribe
                                </Button>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {row.AISummary || 'no summary'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[3, 5, 10, 25]}
                component="div"
                count={transcribeInstanceList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) =>
                  setRowsPerPage(Number(e.target.value))
                }
              />
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={4} />
      </Grid>
      <Dialog
        open={openNotesDialog}
        onClose={handleCloseNoteDialog}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const { email } = formJson;
            console.log(email);
            handleCloseNoteDialog();
          },
        }}
      >
        <DialogTitle>Notes</DialogTitle>
        <DialogContent>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => handleCloseNoteDialog(false)}>Cancel</Button>
          <Button onClick={(e) => handleCloseNoteDialog(true)}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
