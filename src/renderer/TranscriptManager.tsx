/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';

import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Table from '@mui/material/Table';
import TablePagination from '@mui/material/TablePagination';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Markdown from 'react-markdown';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import TextareaAutosize from './TextAreaAutoSize';
import { IChatServiceResponse } from '../main/backend/ChatService';
import Shared from '../shared';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import {
  CancelTwoTone,
  MusicNoteTwoTone,
  RecordVoiceOverTwoTone,
  StopCircleOutlined,
  TranscribeTwoTone,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

interface IInstance {
  id: string;
  file: string;
  note: string;
  transcript: string;
  AISummary: string;
  AIStudyGuide: string;
}

interface IActionConfiguration {
  getServiceCall: () => (p: string) => Promise<IChatServiceResponse>;
  propToSend: string;
  propToUpdate: string;
  getCloudMessage: () => string;
}
const StyledTableRow = styled(TableRow)(() => ({
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

type propertyTypes = 'note' | 'transcript' | 'AISummary' | 'AIStudyGuide';

export default function Component() {
  const [groqKey, setGroqKey] = React.useState<string | undefined>(undefined);

  const [instanceList, setInstanceList] = React.useState<IInstance[]>([]);
  const [sortedList, setSortedList] = React.useState<IInstance[]>([]);
  const [visibleList, setVisibleList] = React.useState<IInstance[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const [propertyTab, setPropertyTab] = React.useState<propertyTypes>('note');

  const [selectedInstance, setSelectedInstance] = React.useState<
    IInstance | undefined
  >();

  const [selectedInstanceText, setSelectedInstanceText] = React.useState<
    string | undefined
  >();
  const [dirty, setDirty] = React.useState<propertyTypes | undefined>();

  const [updateFlag, setUpdateFlag] = React.useState(0);

  const [markdown, setMarkdown] = React.useState(false);

  const [alertCloudActivity, setAlertCloudActivity] = React.useState<
    string | undefined
  >(undefined);
  const [aiResponseError, setAiResponseError] = React.useState<
    string | undefined
  >(undefined);

  const [requestAudioSession, setRequestAudioSession] = React.useState<
    string | undefined
  >(undefined);
  const [recordingState, setRecordingState] = React.useState<
    string | undefined
  >(undefined);
  const [mediaRecorder, setMediaRecorder] = React.useState<
    MediaRecorder | undefined
  >(undefined);
  // accumulates blobs of audio data as media recorder is recording
  const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);

  const [recordingMessage, setRecordingMessage] = React.useState<
    string | undefined
  >(undefined);

  // what audio chunks are converted to after recording is finished
  // this is the data that is sent to the backend and saved as an mp3 file,
  // which can then be uploaded to whisper ai for transcription
  const [arrayBuffer, setArrayBuffer] = React.useState<ArrayBuffer | undefined>(
    undefined,
  );

  const [addAudioFilePath, setAddAudioFilePath] = React.useState<
    string | undefined
  >(undefined);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: propertyTypes,
  ) => {
    setPropertyTab(newValue);
  };

  React.useEffect(() => {
    if (selectedInstance) {
      setDirty(undefined);
      switch (propertyTab) {
        case 'transcript':
          setSelectedInstanceText(selectedInstance.transcript);
          break;
        case 'AISummary':
          setSelectedInstanceText(selectedInstance.AISummary);
          break;
        case 'AIStudyGuide':
          setSelectedInstanceText(selectedInstance.AIStudyGuide);
          break;
        default: // note
          setSelectedInstanceText(selectedInstance.note);
      }
    }
  }, [propertyTab, selectedInstance]);

  // initial event
  React.useEffect(() => {
    const getList = async () => {
      const key = await window.electron.ipcRenderer.StoreGet(
        Shared.keys.STORE,
        Shared.keys.GROQ_KEY,
      );
      setGroqKey(key);
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

  // update visible list of records based on current page of table
  React.useEffect(() => {
    const start = page * rowsPerPage;
    const end = (page + 1) * rowsPerPage;
    const last = end > sortedList.length ? sortedList.length : end;
    setVisibleList(sortedList.slice(start, last));
  }, [sortedList, page, rowsPerPage]);

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

  const discardChangedProperty = () => {
    if (selectedInstance !== undefined && selectedInstanceText !== undefined) {
      const toRestore = instanceList.find((x) => x.id === selectedInstance.id);
      if (toRestore) {
        const oldText = (toRestore as any)[propertyTab] as string;
        setSelectedInstanceText(oldText);
        setDirty(undefined);
      }
    }
  };

  const saveChangedProperty = () => {
    if (selectedInstance !== undefined && selectedInstanceText !== undefined) {
      const toUpdate = instanceList.find((x) => x.id === selectedInstance.id);
      if (toUpdate) {
        (toUpdate as any)[propertyTab] = selectedInstanceText;
        setInstanceList([...instanceList]);
        setUpdateFlag(updateFlag + 1);
        setDirty(undefined);
      }
    }
  };

  const propertyTypeList: {
    [index: string]: { actionConfig: IActionConfiguration };
  } = {
    transcript: {
      actionConfig: {
        getServiceCall: () =>
          groqKey !== undefined
            ? window.electron.ipcRenderer.groqTranscribe
            : window.electron.ipcRenderer.transcribe,
        propToSend: 'file',
        propToUpdate: 'transcript',
        getCloudMessage: () =>
          `transcribing audio file remotely${groqKey ? ' using Groq' : ''}. Long audio files can take a while`,
      },
    },
    AISummary: {
      actionConfig: {
        getServiceCall: () => window.electron.ipcRenderer.transcriptSummary,
        propToSend: 'transcript',
        propToUpdate: 'AISummary',
        getCloudMessage: () => `generating summary`,
      },
    },
    AIStudyGuide: {
      actionConfig: {
        getServiceCall: () => window.electron.ipcRenderer.transcriptStudyGuide,
        propToSend: 'transcript',
        propToUpdate: 'AIStudyGuide',
        getCloudMessage: () => `generating study guide`,
      },
    },
  };

  const genericAiTranscriptProcessCall = (
    call: (p: string) => Promise<IChatServiceResponse>,
    propToSend: string,
    propToUpdate: string,
    instance: IInstance | undefined,
    cloudMessage: string,
  ) => {
    const asyncCall = async () => {
      if (instance !== undefined) {
        const response = await call((instance as any)[propToSend]);

        setAlertCloudActivity(undefined);
        if (response.status === 'FAILURE') {
          setAiResponseError(response.error);
        } else {
          const toUpdate = instanceList.find((x) => x.id === instance.id);
          if (toUpdate) {
            (toUpdate as any)[propToUpdate] = response.text;
            if (
              propertyTab === propToUpdate &&
              selectedInstance !== undefined &&
              toUpdate.id === selectedInstance.id
            ) {
              setSelectedInstanceText(response.text);
            }
            setInstanceList([...instanceList]);
            setUpdateFlag(updateFlag + 1);
          }
        }
      }
    };

    if (instance !== undefined) {
      setAlertCloudActivity(cloudMessage);
      asyncCall();
    }
  };

  const generateActionForProperty = () => {
    const cfg = propertyTypeList[propertyTab];

    if (cfg) {
      genericAiTranscriptProcessCall(
        cfg.actionConfig.getServiceCall(),
        cfg.actionConfig.propToSend,
        cfg.actionConfig.propToUpdate,
        selectedInstance,
        cfg.actionConfig.getCloudMessage(),
      );
    }
  };

  // user state request change
  React.useEffect(() => {
    const checkstate = async () => {
      if (recordingState === 'start') {
        setRecordingMessage('starting recording...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
      } else if (recordingState === 'stop') {
        if (mediaRecorder) {
          mediaRecorder.stop();
        }
      } else if (recordingState === 'cancel') {
        if (mediaRecorder) {
          mediaRecorder.stop();
          setRecordingMessage('Cleared');
        }
        setRequestAudioSession(undefined);
      }
    };
    checkstate();
  }, [recordingState]);

  // listen for media recorder data/end events
  React.useEffect(() => {
    if (mediaRecorder) {
      setAudioChunks([]);
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (recordingState === 'cancel') {
          setRecordingMessage('cleared: recording not saved.');
        } else {
          setRecordingMessage('recording stopped: saving file...');
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
      setRecordingMessage('Recording Audio...');
    }
  }, [mediaRecorder]);

  const setRequestManualTranscript = () => {
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
    setSelectedInstance(manualItem);
    setPropertyTab('transcript');
    setMarkdown(false);
  };
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
      setRecordingMessage(
        `Saved recording.  Start recording again or click "Transcribe" on new recording to transcribe to text`,
      );
      setArrayBuffer(undefined);
    };
    if (arrayBuffer) {
      saveFile();
      setMediaRecorder(undefined);
    }
  }, [arrayBuffer]);

  const handleRecordingState = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setRecordingState(newValue);
  };

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
      setSelectedInstance(manualItem);
      setPropertyTab('note');
    }

    setAddAudioFilePath(undefined);
  };

  return (
    <>
      <Grid container>
        <Grid item xs={3}>
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Tooltip arrow title="Open the audio recording dialog">
                          <Button
                            sx={{ marginRight: '10px' }}
                            variant="text"
                            color="info"
                            onClick={() => setRequestAudioSession('go')}
                          >
                            <MusicNoteTwoTone />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          arrow
                          title="Create a new record from manually entering a transcript"
                        >
                          <Button
                            sx={{ marginRight: '10px' }}
                            variant="text"
                            color="info"
                            onClick={() => setRequestManualTranscript()}
                          >
                            <TranscribeTwoTone />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          arrow
                          title="Create a new record from manually entering a transcript"
                        >
                          <Button
                            onClick={() =>
                              setAddAudioFilePath('paste audio file path')
                            }
                            variant="text"
                          >
                            <MusicNoteTwoTone />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleList.map((row) => {
                      return (
                        <StyledTableRow
                          hover
                          onClick={() => setSelectedInstance(row)}
                          role="checkbox"
                          // aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          selected={selectedInstance?.id === row.id}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            {row.file
                              .split('\\')
                              [
                                row.file.split('\\').length - 1
                              ].replaceAll('_', ' ')}
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
        {selectedInstance !== undefined && (
          <Grid item xs={9}>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={propertyTab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList
                    onChange={handleTabChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab label="Notes" value="note" />
                    <Tab label="Transcript" value="transcript" />
                    <Tab label="Summary" value="AISummary" />
                    <Tab label="Study Guide" value="AIStudyGuide" />
                  </TabList>
                </Box>

                <Grid padding={1} container>
                  <Grid item xs={1} />
                  <Grid padding={1} item xs={11}>
                    {markdown && (
                      <Button
                        sx={{ marginRight: '10px' }}
                        variant="outlined"
                        color="info"
                        onClick={() => setMarkdown(false)}
                      >
                        View/Edit Text
                      </Button>
                    )}
                    {!markdown && (
                      <Button
                        sx={{ marginRight: '10px' }}
                        variant="outlined"
                        color="info"
                        onClick={() => setMarkdown(true)}
                      >
                        View Markdown
                      </Button>
                    )}

                    {dirty !== undefined && (
                      <>
                        <Button
                          sx={{ marginRight: '10px' }}
                          variant="outlined"
                          color="primary"
                          onClick={() => saveChangedProperty()}
                        >
                          Save
                        </Button>
                        <Button
                          sx={{ marginRight: '10px' }}
                          variant="outlined"
                          color="warning"
                          onClick={() => discardChangedProperty()}
                        >
                          Discard changes
                        </Button>
                      </>
                    )}
                    {propertyTypeList[propertyTab] !== undefined && (
                      <Button
                        sx={{ marginRight: '10px' }}
                        variant="outlined"
                        color="warning"
                        onClick={() => generateActionForProperty()}
                      >
                        {selectedInstanceText &&
                          selectedInstanceText.length > 0 &&
                          'Regenerate'}
                        {(selectedInstanceText === undefined ||
                          selectedInstanceText.length === 0) &&
                          'Regenerate'}
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </TabContext>

              {(selectedInstanceText === undefined ||
                selectedInstanceText.length === 0) && (
                <Alert severity="info" variant="filled" sx={{ width: '100%' }}>
                  There is nothing here. Generate the content if available or
                  enter view/edit text mode and manually enter the content.
                </Alert>
              )}
              {/* markdown, setMarkdown */}
              {!markdown && (
                <TextareaAutosize
                  sx={{ margin: 1, maxHeight: '60vh' }}
                  value={selectedInstanceText || ''}
                  minRows={10}
                  maxRows={30}
                  onChange={(e) => {
                    setSelectedInstanceText(e.target.value);
                    setDirty(propertyTab);
                  }}
                />
              )}
              {markdown && selectedInstanceText && (
                <Box
                  sx={{
                    width: '95%',
                    marginLeft: 2,
                    maxWidth: '95%',
                    maxHeight: '60vh',
                    overflow: 'auto',
                  }}
                >
                  <Markdown>{selectedInstanceText}</Markdown>
                </Box>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
      <Snackbar open={alertCloudActivity !== undefined}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {alertCloudActivity}
          <LinearProgress color="secondary" />
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

      {/* Popup recording interface */}
      <Modal
        onClose={() => setRequestAudioSession(undefined)}
        open={requestAudioSession !== undefined}
      >
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
          <h4>{recordingMessage}</h4>
          {recordingState === 'start' && <LinearProgress color="secondary" />}
          <BottomNavigation
            showLabels
            value={recordingState}
            onChange={handleRecordingState}
          >
            <BottomNavigationAction
              label="Start Recording"
              value="start"
              icon={<RecordVoiceOverTwoTone />}
            />
            <BottomNavigationAction
              disabled={recordingState === 'start'}
              label="Stop Recording"
              value="stop"
              icon={<StopCircleOutlined />}
            />
            <BottomNavigationAction
              label="Cancel"
              value="cancel"
              icon={<CancelTwoTone />}
            />
          </BottomNavigation>
        </Box>
      </Modal>
      {/* modal for manually adding existing audio */}
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
            <Button onClick={() => applyAudioFilePath()}>Save</Button>
          </DialogActions>
        </Box>
      </Modal>
    </>
  );
}
