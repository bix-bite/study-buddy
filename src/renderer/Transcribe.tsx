/* eslint-disable no-nested-ternary */
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
  DialogActions,
  TextareaAutosize as BaseTextareaAutosize,
  styled,
  Modal,
  Snackbar,
  Alert,
} from '@mui/material';

import MarkdownPreview from '@uiw/react-markdown-preview';
import { ArrowCircleUpTwoTone } from '@mui/icons-material';
import Shared from '../shared';

type states = 'Start' | 'Stop' | 'Clear';

interface IInstance {
  id: string;
  file: string;
  note: string;
  transcription: string;
  AISummary: string;
  AIStudyGuide: string;
}

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function Component() {
  const [instanceList, setInstanceList] = React.useState<IInstance[]>([]);
  const [sortedList, setSortedList] = React.useState<IInstance[]>([]);
  const [visibleList, setVisibleList] = React.useState<IInstance[]>([]);

  const [updateFlag, setUpdateFlag] = React.useState(0);

  const [alertNoKey, setAlertNoKey] = React.useState(false);
  const [addManual, setAddManual] = React.useState(false);

  const [alertCloudActivity, setAlertCloudActivity] = React.useState<
    string | undefined
  >(undefined);

  const [state, setState] = React.useState<states>('Clear');
  const [msg, setMessage] = React.useState<string>('');

  const [mediaRecorder, setMediaRecorder] = React.useState<
    MediaRecorder | undefined
  >(undefined);
  const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);
  const [arrayBuffer, setArrayBuffer] = React.useState<ArrayBuffer | undefined>(
    undefined,
  );

  const [markdown, setMarkdown] = React.useState(false);
  const [openAiKey, setOpenAiKey] = React.useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const [requestTranscription, setRequestTranscription] = React.useState<
    IInstance | undefined
  >(undefined);

  const [requestSummary, setRequestSummary] = React.useState<
    IInstance | undefined
  >(undefined);

  const [requestStudyGuide, setRequestStudyGuide] = React.useState<
    IInstance | undefined
  >(undefined);

  const [editingItem, setEditingItem] = React.useState<IInstance | undefined>(
    undefined,
  );

  const [editText, setEditText] = React.useState<
    { property: string; text: string } | undefined
  >(undefined);

  const maybeShorten = (
    text: string | undefined,
    max: number,
  ): string | undefined => {
    return text === undefined
      ? undefined
      : text.length > max
        ? `${text.substring(0, max - 3)}...`
        : text;
  };
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
      setInstanceList(retrieve || []);
    };
    getList();
  }, []);

  // sort list
  React.useEffect(() => {
    setSortedList(instanceList.sort((a, b) => b.id.localeCompare(a.id)));
  }, [instanceList]);

  // add manual transcript text
  React.useEffect(() => {
    if (addManual) {
      const manualItem: IInstance = {
        id: `${Shared.formattedNow()}_manual`,
        file: 'PASTED TRANSCRIPT',
        transcription: 'paste here',
        AIStudyGuide: '',
        AISummary: '',
        note: 'Manually imported transcript',
      };

      setInstanceList([...instanceList, manualItem]);
      setMarkdown(false);
      setEditingItem(manualItem);
      setEditText({
        property: 'transcription',
        text: manualItem.transcription,
      });
      setAddManual(false);
    }
  }, [addManual]);

  // update visible list of records based on current page of table
  React.useEffect(() => {
    const start = page * rowsPerPage;
    const end = (page + 1) * rowsPerPage;
    const last = end > sortedList.length ? sortedList.length : end;
    setVisibleList(sortedList.slice(start, last));
  }, [sortedList, page, rowsPerPage]);

  // transcribe on request
  React.useEffect(() => {
    const transcribe = async () => {
      if (requestTranscription) {
        const transcriptionText = await window.electron.ipcRenderer.transcribe(
          requestTranscription?.file,
          openAiKey,
        );
        const toUpdate = instanceList.find(
          (x) => x.id === requestTranscription.id,
        );
        if (toUpdate) {
          toUpdate.transcription = transcriptionText;
          setInstanceList([...instanceList]);
          setUpdateFlag(updateFlag + 1);
        }
      }
    };

    if (requestTranscription !== undefined) {
      if (openAiKey === undefined || openAiKey === '') {
        setAlertNoKey(true);
      } else {
        setAlertCloudActivity(
          'transcribing audio file remotely. Long audio files can take a while',
        );
        transcribe();
      }
    }
  }, [requestTranscription]);

  // summary on request
  React.useEffect(() => {
    const transcribe = async () => {
      setAlertCloudActivity('sending request');
      if (requestSummary) {
        const summaryText =
          await window.electron.ipcRenderer.transcriptionSummry(
            requestSummary?.transcription,
            openAiKey,
          );
        setAlertCloudActivity('applying response');
        const toUpdate = instanceList.find((x) => x.id === requestSummary.id);
        if (toUpdate) {
          toUpdate.AISummary = summaryText;
          setInstanceList([...instanceList]);
          setUpdateFlag(updateFlag + 1);
          setAlertCloudActivity(undefined);
        } else {
          setAlertCloudActivity(undefined);
        }
      }
    };

    if (requestSummary !== undefined) {
      if (openAiKey === undefined || openAiKey === '') {
        setAlertNoKey(true);
      } else {
        setAlertCloudActivity('Summarizing transcription.');
        transcribe();
      }
    }
  }, [requestSummary]);

  // study guide on request
  React.useEffect(() => {
    const transcribe = async () => {
      if (requestStudyGuide) {
        setAlertCloudActivity('sending request');
        const studyGuide =
          await window.electron.ipcRenderer.transcriptionStudyGuide(
            requestStudyGuide?.transcription,
            openAiKey,
          );
        setAlertCloudActivity('applying response');
        const toUpdate = instanceList.find(
          (x) => x.id === requestStudyGuide.id,
        );
        if (toUpdate) {
          toUpdate.AIStudyGuide = studyGuide;
          setInstanceList([...instanceList]);
          setUpdateFlag(updateFlag + 1);
          setAlertCloudActivity(undefined);
        } else {
          setAlertCloudActivity(undefined);
        }
      }
    };

    if (requestStudyGuide !== undefined) {
      if (openAiKey === undefined || openAiKey === '') {
        setAlertNoKey(true);
      } else {
        setAlertCloudActivity('creating study guide.');
        transcribe();
      }
    }
  }, [requestStudyGuide]);

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
          setMessage('cleared: recording not saved.');
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

      setInstanceList([
        ...instanceList,
        {
          id: Shared.formattedNow(),
          file: fileName,
          AISummary: '',
          note: '',
          transcription: '',
          AIStudyGuide: '',
        },
      ]);
      setUpdateFlag(updateFlag + 1);
      setMessage(
        `Saved recording.  Start recording again or click "Transcribe" on new recording to transcribe to text`,
      );
      setArrayBuffer(undefined);
    };
    if (arrayBuffer) {
      saveFile();
      setMediaRecorder(undefined);
    }
  }, [arrayBuffer]);

  // save instance list to file
  React.useEffect(() => {
    if (updateFlag > 0) {
      window.electron.ipcRenderer.StoreSet(
        'StudyBuddy.Transcriptions.AI',
        'TranscribeList',
        instanceList,
      );
    }
  }, [updateFlag]);

  const editProperty = (item: IInstance, prop: string) => {
    setEditingItem(item);
    setEditText({ property: prop, text: (item as any)[prop] });
  };

  const endEditProperty = (update: boolean) => {
    if (update && editingItem !== undefined && editText !== undefined) {
      const toUpdate = instanceList.find((x) => x.id === editingItem.id);
      if (toUpdate) {
        (toUpdate as any)[editText.property] = editText.text;
        setInstanceList([...instanceList]);
        setUpdateFlag(updateFlag + 1);
      }
    }
    setEditText(undefined);
  };

  return (
    <>
      <Stack spacing={2} direction="row">
        <Button
          disabled={mediaRecorder !== undefined}
          onClick={() => setState('Start')}
          variant="text"
        >
          Start Recording
        </Button>
        <Button
          disabled={mediaRecorder === undefined}
          onClick={() => setState('Stop')}
          variant="text"
        >
          Stop Recording
        </Button>
        <Button
          disabled={mediaRecorder === undefined}
          onClick={() => setState('Clear')}
          variant="text"
        >
          Clear
        </Button>

        <Button
          disabled={mediaRecorder !== undefined}
          onClick={() => setAddManual(true)}
          variant="text"
        >
          Add Manual Transcript
        </Button>
        {alertCloudActivity && <p>{alertCloudActivity}</p>}
      </Stack>
      <h4>{msg}</h4>
      <hr />
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <StyledTableRow>
                      <TableCell>File</TableCell>
                      <TableCell colSpan={2}>Note</TableCell>
                      <TableCell colSpan={2}>Transcription</TableCell>
                      <TableCell colSpan={2}>AI Summary</TableCell>
                      <TableCell colSpan={2}>Study Guide</TableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {visibleList.map((row) => {
                      return (
                        <StyledTableRow
                          hover
                          // onClick={(event) => handleClick(event, row.id)}
                          role="checkbox"
                          // aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          // selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            {
                              row.file.split('\\')[
                                row.file.split('\\').length - 1
                              ]
                            }
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              display="block"
                              gutterBottom
                            >
                              {maybeShorten(row.note, 40) || 'no note'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={(e) => editProperty(row, 'note')}
                              variant="outlined"
                              size="small"
                            >
                              edit
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              display="block"
                              gutterBottom
                            >
                              {maybeShorten(row.transcription, 40) || (
                                <Button
                                  onClick={(e) => setRequestTranscription(row)}
                                  variant="outlined"
                                >
                                  Transcribe
                                </Button>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={(e) => {
                                setMarkdown(false);
                                editProperty(row, 'transcription');
                              }}
                              size="small"
                            >
                              <ArrowCircleUpTwoTone />
                            </Button>
                          </TableCell>
                          <TableCell>
                            {maybeShorten(row.AISummary, 40) || (
                              <Button
                                onClick={(e) => setRequestSummary(row)}
                                variant="outlined"
                              >
                                Summarize
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={(e) => {
                                setMarkdown(row.AISummary?.length > 0);
                                editProperty(row, 'AISummary');
                              }}
                              size="small"
                            >
                              <ArrowCircleUpTwoTone />
                            </Button>
                          </TableCell>

                          <TableCell>
                            {maybeShorten(row.AIStudyGuide, 40) || (
                              <Button
                                onClick={(e) => setRequestStudyGuide(row)}
                                variant="outlined"
                              >
                                Create
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={(e) => {
                                setMarkdown(row.AIStudyGuide?.length > 0);
                                editProperty(row, 'AIStudyGuide');
                              }}
                              size="small"
                            >
                              <ArrowCircleUpTwoTone />
                            </Button>
                          </TableCell>
                        </StyledTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[3, 5, 8, 25]}
                component="div"
                count={instanceList.length}
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
      </Grid>
      <Modal open={editText !== undefined}>
        <Box
          sx={{
            position: 'relative',
            top: '10vh',
            height: '80vh',
            left: '10vw',
            width: '80vw',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: (theme) => theme.shadows[5],
            p: 4,
          }}
        >
          <h4>
            Edit {editText?.property}{' '}
            <Button onClick={() => setMarkdown(!markdown)}>
              Toggle Markdown
            </Button>
          </h4>

          {!markdown && (
            <TextareaAutosize
              value={editText?.text}
              minRows={10}
              maxRows={30}
              onChange={(e) =>
                setEditText({
                  property: editText?.property || '',
                  text: e.target.value,
                })
              }
            />
          )}
          {markdown && (
            <Box
              sx={{
                width: '95%',
                maxWidth: '95%',
                maxHeight: '80%',
                overflow: 'auto',
              }}
            >
              <MarkdownPreview
                source={editText?.text}
                style={{ padding: 16 }}
              />
            </Box>
          )}
          <DialogActions>
            {!markdown && (
              <>
                <Button onClick={() => endEditProperty(false)}>Cancel</Button>
                <Button onClick={() => endEditProperty(true)}>Save</Button>
              </>
            )}

            {markdown && (
              <Button onClick={() => endEditProperty(false)}>Close</Button>
            )}
          </DialogActions>
        </Box>
      </Modal>
      <Snackbar open={alertCloudActivity !== undefined} autoHideDuration={6000}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {alertCloudActivity}
        </Alert>
      </Snackbar>
      <Snackbar
        open={alertNoKey}
        autoHideDuration={6000}
        onClose={() => setAlertNoKey(false)}
      >
        <Alert
          onClose={() => setAlertNoKey(false)}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          No API key for Open AI configured. GO to AI Configuration tab and add
          a valid OpenAI API key first.
        </Alert>
      </Snackbar>
    </>
  );
}
