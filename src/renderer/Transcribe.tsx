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
  styled,
  Modal,
  Snackbar,
  Alert,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';

// import MarkdownPreview from '@uiw/react-markdown-preview';
import Markdown from 'react-markdown';
import {
  ArrowCircleUpTwoTone,
  SummarizeTwoTone,
  CompressTwoTone,
  EditNoteTwoTone,
  NoteAltTwoTone,
  TranscribeTwoTone,
} from '@mui/icons-material';
import Shared from '../shared';
import { IChatServiceResponse } from '../main/backend/ChatService';
import TextareaAutosize from './TextAreaAutoSize';

type states = 'Start' | 'Stop' | 'Clear';

interface IInstance {
  id: string;
  file: string;
  note: string;
  transcript: string;
  AISummary: string;
  AIStudyGuide: string;
}

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
  const [addAudioFilePath, setAddAudioFilePath] = React.useState<
    string | undefined
  >(undefined);

  const [updateFlag, setUpdateFlag] = React.useState(0);

  const [alertNoKey, setAlertNoKey] = React.useState(false);
  const [addManual, setAddManual] = React.useState(false);
  const [aiResponseError, setAiResponseError] = React.useState<
    string | undefined
  >(undefined);
  const [alertCloudActivity, setAlertCloudActivity] = React.useState<
    string | undefined
  >(undefined);

  const [state, setState] = React.useState<states>('Clear');
  const [msg, setMessage] = React.useState<string>('');

  const [mediaRecorder, setMediaRecorder] = React.useState<
    MediaRecorder | undefined
  >(undefined);
  // accumulates blobs of audio data as media recorder is recording
  const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);

  // what audio chunks are converted to after recording is finished
  // this is the data that is sent to the backend and saved as an mp3 file,
  // which can then be uploaded to whisper ai for transcription
  const [arrayBuffer, setArrayBuffer] = React.useState<ArrayBuffer | undefined>(
    undefined,
  );

  // toggles if markdown or editable textbox is shown in popup view of a field
  const [markdown, setMarkdown] = React.useState(false);
  const [openAiKey, setOpenAiKey] = React.useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const [requestTranscript, setRequestTranscript] = React.useState<
    IInstance | undefined
  >(undefined);

  const [requestCompress, setRequestCompress] = React.useState<
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
        Shared.keys.STORE,
        Shared.keys.OPENAI_KEY,
      );
      setOpenAiKey(key);
      const retrieve = await window.electron.ipcRenderer.StoreGet(
        Shared.keys.TRANSCRIBE_STORE,
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
        transcript: 'paste here',
        AIStudyGuide: '',
        AISummary: '',
        note: 'Manually imported transcript',
      };

      setInstanceList([...instanceList, manualItem]);
      setMarkdown(false);
      setEditingItem(manualItem);
      setEditText({
        property: 'transcript',
        text: manualItem.transcript,
      });
      setAddManual(false);
    }
  }, [addManual]);

  const applyAudioFilePath = () => {
    if (addAudioFilePath !== undefined) {
      const manualItem: IInstance = {
        id: `${Shared.formattedNow()}_manual`,
        file: addAudioFilePath,
        transcript: '',
        AIStudyGuide: '',
        AISummary: '',
        note: 'Manually imported audio file',
      };

      setInstanceList([...instanceList, manualItem]);
    }

    setAddAudioFilePath(undefined);
  };

  // update visible list of records based on current page of table
  React.useEffect(() => {
    const start = page * rowsPerPage;
    const end = (page + 1) * rowsPerPage;
    const last = end > sortedList.length ? sortedList.length : end;
    setVisibleList(sortedList.slice(start, last));
  }, [sortedList, page, rowsPerPage]);

  const genericAiTranscriptProcessCall = (
    call: (p: string, openAiKey: string) => Promise<IChatServiceResponse>,
    propToSend: string,
    propToUpdate: string,
    instance: IInstance | undefined,
    cloudMessage: string,
  ) => {
    const asyncCall = async () => {
      if (instance !== undefined) {
        const response = await call((instance as any)[propToSend], openAiKey);

        setAlertCloudActivity(undefined);
        if (response.status === 'FAILURE') {
          setAiResponseError(response.error);
        } else {
          const toUpdate = instanceList.find((x) => x.id === instance.id);
          if (toUpdate) {
            (toUpdate as any)[propToUpdate] = response.text;
            setInstanceList([...instanceList]);
            setUpdateFlag(updateFlag + 1);
          }
        }
      }
    };

    if (instance !== undefined) {
      if (openAiKey === undefined || openAiKey === '') {
        setAlertNoKey(true);
      } else {
        setAlertCloudActivity(cloudMessage);
        asyncCall();
      }
    }
  };

  // compress on request
  // transcribe on request
  React.useEffect(() => {
    const asyncCall = async () => {
      if (
        requestCompress &&
        requestCompress.file &&
        requestCompress.file.endsWith('mp3')
      ) {
        const newFileName = await window.electron.ipcRenderer.compressAudio(
          requestCompress?.file,
        );

        const toUpdate = instanceList.find((x) => x.id === requestCompress.id);
        if (toUpdate) {
          toUpdate.file = newFileName;
          setInstanceList([...instanceList]);
          setUpdateFlag(updateFlag + 1);
          setAlertCloudActivity(undefined);
        }
      }
    };
    if (requestCompress !== undefined) {
      setAlertCloudActivity('Compressing.  Might take a while');
      asyncCall();
    }
  }, [requestCompress]);

  // transcribe on request
  React.useEffect(() => {
    genericAiTranscriptProcessCall(
      window.electron.ipcRenderer.transcribe,
      'file',
      'transcript',
      requestTranscript,
      'transcribing audio file remotely. Long audio files can take a while',
    );
  }, [requestTranscript]);

  // summary on request
  React.useEffect(() => {
    genericAiTranscriptProcessCall(
      window.electron.ipcRenderer.transcriptSummry,
      'transcript',
      'AISummary',
      requestSummary,
      'Summarizing transcript...',
    );
  }, [requestSummary]);

  // study guide on request
  React.useEffect(() => {
    genericAiTranscriptProcessCall(
      window.electron.ipcRenderer.transcriptStudyGuide,
      'transcript',
      'AIStudyGuide',
      requestStudyGuide,
      'Creating study guide...',
    );
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
          transcript: '',
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
        Shared.keys.TRANSCRIBE_STORE,
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
        <Button
          disabled={mediaRecorder !== undefined}
          onClick={() => setAddAudioFilePath('paste audio file path')}
          variant="text"
        >
          Add audio file path
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
                      <TableCell colSpan={2}>File</TableCell>
                      <TableCell colSpan={2}>Note</TableCell>
                      <TableCell>transcript</TableCell>
                      <TableCell>AI Summary</TableCell>
                      <TableCell>Study Guide</TableCell>
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
                            {row.file
                              .split('\\')
                              [
                                row.file.split('\\').length - 1
                              ].replaceAll('_', ' ')}
                          </TableCell>
                          <TableCell>
                            {row.file.endsWith('mp3') && (
                              <Tooltip
                                arrow
                                title="Compress audio to save file space before sending off for transcription"
                              >
                                <Button
                                  sx={{ marginLeft: '1px' }}
                                  onClick={() => setRequestCompress(row)}
                                  variant="outlined"
                                >
                                  <CompressTwoTone />
                                </Button>
                              </Tooltip>
                            )}
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
                            <Tooltip
                              arrow
                              title={
                                row.AIStudyGuide?.length > 0
                                  ? 'View or edit your note'
                                  : 'Add a note'
                              }
                            >
                              <Button
                                sx={{ marginLeft: '1px' }}
                                onClick={(e) => editProperty(row, 'note')}
                                variant="outlined"
                                size="small"
                              >
                                <EditNoteTwoTone />
                              </Button>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                alignItems: 'stretch',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography
                                variant="caption"
                                display="block"
                                gutterBottom
                              >
                                {maybeShorten(row.transcript, 40) || (
                                  <Tooltip
                                    arrow
                                    title="transcribe audio to text.  You will need an OpenAI api key saved in the AI CONFIGURATION TAB for this to work"
                                  >
                                    <Button
                                      sx={{ marginLeft: '1px' }}
                                      onClick={() => setRequestTranscript(row)}
                                      variant="outlined"
                                    >
                                      <TranscribeTwoTone />
                                    </Button>
                                  </Tooltip>
                                )}
                              </Typography>
                              <Tooltip
                                arrow
                                title={
                                  row.transcript?.length > 0
                                    ? 'View or edit transcript. Delete content to allow for transcription rerun.'
                                    : 'Manually add a transcript'
                                }
                              >
                                <Button
                                  sx={{ marginLeft: '1px' }}
                                  onClick={(e) => {
                                    setMarkdown(false);
                                    editProperty(row, 'transcript');
                                  }}
                                  size="small"
                                >
                                  <ArrowCircleUpTwoTone />
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                alignItems: 'stretch',
                                justifyContent: 'space-between',
                              }}
                            >
                              {maybeShorten(row.AISummary, 40) || (
                                <Tooltip
                                  arrow
                                  title="transcribe audio to text.  You will need an OpenAI or Anthropic api key saved, depending on the preferred LLM selection in the AI CONFIGURATION TAB for this to work"
                                >
                                  <span>
                                    <Button
                                      sx={{ marginLeft: '1px' }}
                                      disabled={
                                        row.transcript === undefined ||
                                        row.transcript.length === 0
                                      }
                                      onClick={(e) => setRequestSummary(row)}
                                      variant="outlined"
                                    >
                                      <SummarizeTwoTone />
                                    </Button>
                                  </span>
                                </Tooltip>
                              )}

                              <Tooltip
                                arrow
                                title={
                                  row.AISummary?.length > 0
                                    ? 'View or edit summary.  Delete content to allow for summary rerun.'
                                    : 'Manually add your own summary'
                                }
                              >
                                <Button
                                  sx={{ marginLeft: '1px' }}
                                  onClick={(e) => {
                                    setMarkdown(row.AISummary?.length > 0);
                                    editProperty(row, 'AISummary');
                                  }}
                                  size="small"
                                >
                                  <ArrowCircleUpTwoTone />
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                alignItems: 'stretch',
                                justifyContent: 'space-between',
                              }}
                            >
                              {maybeShorten(row.AIStudyGuide, 40) || (
                                <Tooltip
                                  arrow
                                  title="create study guide from transcript.  You will need an OpenAI or Anthropic api key saved, depending on the preferred LLM selection in the AI CONFIGURATION TAB for this to work"
                                >
                                  <span>
                                    <Button
                                      sx={{ marginLeft: '1px' }}
                                      disabled={
                                        row.transcript === undefined ||
                                        row.transcript.length === 0
                                      }
                                      onClick={(e) => setRequestStudyGuide(row)}
                                      variant="outlined"
                                    >
                                      <NoteAltTwoTone />
                                    </Button>
                                  </span>
                                </Tooltip>
                              )}

                              <Tooltip
                                arrow
                                title={
                                  row.AIStudyGuide?.length > 0
                                    ? 'View or edit study guide.  Delete content to allow for study rerun.'
                                    : 'Manually add your own study guide'
                                }
                              >
                                <Button
                                  sx={{ marginLeft: '1px' }}
                                  onClick={(e) => {
                                    setMarkdown(row.AIStudyGuide?.length > 0);
                                    editProperty(row, 'AIStudyGuide');
                                  }}
                                  size="small"
                                >
                                  <ArrowCircleUpTwoTone />
                                </Button>
                              </Tooltip>
                            </Box>
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
      <Modal open={addAudioFilePath !== undefined}>
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
          <FormControl sx={{ m: 1, minWidth: '90%' }}>
            <TextField
              sx={{ margin: '20px' }}
              fullWidth
              name="audioFIlePath"
              label="Audio file path:"
              value={addAudioFilePath}
              onChange={(e) => setAddAudioFilePath(e.target.value)}
              variant="standard"
            />
          </FormControl>
          <DialogActions>
            <Button onClick={() => setAddAudioFilePath(undefined)}>
              Cancel
            </Button>
            <Button onClick={() => applyAudioFilePath(true)}>Save</Button>
          </DialogActions>
        </Box>
      </Modal>
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
            <Button
              sx={{ marginLeft: '1px' }}
              onClick={() => setMarkdown(!markdown)}
            >
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
              <Markdown>{editText?.text}</Markdown>
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
      <Snackbar open={alertCloudActivity !== undefined}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {alertCloudActivity}
          <LinearProgress color="secondary" />
        </Alert>
      </Snackbar>
      <Snackbar
        open={alertNoKey}
        autoHideDuration={6000}
        onClose={() => setAlertNoKey(false)}
      >
        <Alert severity="warning" variant="filled" sx={{ width: '100%' }}>
          No API key for Open AI configured. GO to AI Configuration tab and add
          a valid OpenAI API key first.
        </Alert>
      </Snackbar>
      <Snackbar
        open={aiResponseError !== undefined}
        autoHideDuration={6000}
        onClose={() => setAiResponseError(undefined)}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          Error calling AI Cloud API:
          {`${aiResponseError}`}
        </Alert>
      </Snackbar>
    </>
  );
}
