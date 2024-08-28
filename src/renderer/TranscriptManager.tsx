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
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import {
  CancelTwoTone,
  CompressTwoTone,
  FileOpenTwoTone,
  ImportExportTwoTone,
  MusicNoteTwoTone,
  RecordVoiceOverTwoTone,
  StopCircleOutlined,
  StreamTwoTone,
  TranscribeTwoTone,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import TextareaAutosize from './TextAreaAutoSize';
import { IChatServiceResponse } from '../main/backend/ChatService';
import Shared from '../shared';

interface IInstance {
  id: string;
  name: string;
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

type propertyTypes =
  | 'name'
  | 'file'
  | 'note'
  | 'transcript'
  | 'AISummary'
  | 'AIStudyGuide';

const combineText = (
  startText: string | undefined,
  endText: string | undefined,
): string => {
  const start = startText === undefined ? '' : startText;
  const end = endText === undefined ? '' : endText;

  return end.length > 0 && start.length > 0
    ? `${start}\n\n${end}`
    : `${start}${end}`;
};

const ModalBox = React.forwardRef(
  (props: { children: React.ReactNode }, ref) => (
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
      {props.children}
    </Box>
  ),
);

export default function Component() {
  const [groqKey, setGroqKey] = React.useState<string | undefined>(undefined);

  // list and table state
  const [instanceList, setInstanceList] = React.useState<IInstance[]>([]);
  const [sortedList, setSortedList] = React.useState<IInstance[]>([]);
  const [visibleList, setVisibleList] = React.useState<IInstance[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  // instance and property state
  const [selectedInstance, setSelectedInstance] = React.useState<
    IInstance | undefined
  >();
  const [propertyTab, setPropertyTab] = React.useState<propertyTypes>('note');
  const [selectedInstanceText, setSelectedInstanceText] = React.useState<
    string | undefined
  >();
  const [dirty, setDirty] = React.useState<propertyTypes | undefined>();
  const [updateFlag, setUpdateFlag] = React.useState(0);

  const [readonly, setReadonly] = React.useState(false);
  const [showCompress, setShowCompress] = React.useState(false);
  const [showOpenFile, setShowOpenFile] = React.useState(false);
  const [showNoExist, setShowNoExist] = React.useState(false);

  // live transcript related state
  const [streamChunk, setStreamChunk] = React.useState<string | undefined>();
  const [finalChunk, setFinalChunk] = React.useState<string | undefined>();
  const [streamingText, setStreamingText] = React.useState<
    string | undefined
  >();
  const [streamingTextDisplay, setStreamingTextDisplay] = React.useState<
    string | undefined
  >();
  const [requestLiveTranscription, setRequestLiveTranscription] =
    React.useState<string | undefined>(undefined);
  const [streamingState, setStreamingState] = React.useState<
    string | undefined
  >(undefined);
  const [streamingMessage, setStreamingMessage] = React.useState<
    string | undefined
  >(undefined);

  const [markdownDisplayFlag, setMarkdownDisplayFlag] = React.useState(true);
  const [alertCloudActivity, setAlertCloudActivity] = React.useState<
    string | undefined
  >(undefined);
  const [aiResponseError, setAiResponseError] = React.useState<
    string | undefined
  >(undefined);

  // audio recording state
  const [requestAudioSession, setRequestAudioSession] = React.useState<
    string | undefined
  >(undefined);
  const [recordingState, setRecordingState] = React.useState<
    string | undefined
  >(undefined);
  const [recordingMessage, setRecordingMessage] = React.useState<
    string | undefined
  >(undefined);
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

  // manual audio path state
  const [addAudioFilePath, setAddAudioFilePath] = React.useState<
    string | undefined
  >(undefined);

  const [requestCompress, setRequestCompress] = React.useState<
    IInstance | undefined
  >(undefined);

  const handlePropertyTabChange = (
    event: React.SyntheticEvent,
    newValue: propertyTypes,
  ) => {
    setPropertyTab(newValue);
  };

  // user requested to paste in their own transcript text.  Create a record, select it,
  // show it to user with transcript text box ready for them to paste in
  function createManualTranscriptEntry(
    file: string,
    transcript: string,
    noteText: string,
    name: string,
  ) {
    const manualItem: IInstance = {
      id: `${Shared.formattedNow()}_manual`,
      file,
      transcript,
      name,
      AIStudyGuide: '',
      AISummary: '',
      note: noteText,
    };

    setInstanceList([...instanceList, manualItem]);
    setMarkdownDisplayFlag(false);
    setSelectedInstance(manualItem);
    setPropertyTab('transcript');
    setMarkdownDisplayFlag(false);
    setUpdateFlag(updateFlag + 1);
  }

  const isFilePath = (text: string): bool => {
    // Check if the string has a file extension
    const fileExtensionPattern = /\.[0-9a-z]+$/i;

    // Check if the string has directory separators (assuming Unix and Windows paths)
    const hasDirectorySeparators = text.includes('/') || text.includes('\\');

    // Basic check: a string that contains directory separators and ends with a file extension
    return hasDirectorySeparators && fileExtensionPattern.test(text);
  };

  // load up editable property text of selected instance.  This is
  // what can be edited by user and what is displayed in mardkwon
  React.useEffect(() => {
    const asyncMethod = async () => {
      if (selectedInstance) {
        setDirty(undefined);
        setReadonly(false);
        setShowCompress(false);
        setShowOpenFile(false);
        setShowNoExist(false);
        switch (propertyTab) {
          case 'file':
            setSelectedInstanceText(selectedInstance.file);
            setReadonly(true);
            if (selectedInstance.file?.length > 0) {
              if (isFilePath(selectedInstance.file)) {
                const viable = await window.electron.ipcRenderer.fileExists(
                  selectedInstance.file,
                );

                if (viable) {
                  setShowOpenFile(true);
                } else {
                  setShowNoExist(true);
                }
              }
              if (selectedInstance.file.endsWith('mp3')) {
                setShowCompress(true);
              }
            }
            break;
          case 'name':
            setSelectedInstanceText(selectedInstance.name);
            break;
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
    };
    asyncMethod();
  }, [propertyTab, selectedInstance]);

  // initial event
  React.useEffect(() => {
    // initiilize listeners for live transcript events
    window.electron.ipcRenderer.onPartialTranscript((transcript) =>
      setStreamChunk(transcript),
    );
    window.electron.ipcRenderer.onFinalTranscript((transcript) =>
      setFinalChunk(transcript),
    );

    // get a few things from data store, mainly the transcript list that
    // is the basis of the whole compoennet. the Groq key is used to
    // determine which recorded transcription api to use.  Groq's whisper
    // api is faster and a little cheaper than Open AI, so if the key is
    // there, we wil use Groq for that feature.
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
      if (retrieve) {
        (retrieve as IInstance[]).forEach((instance) => {
          if (instance.name === undefined) {
            instance.name =
              instance.note?.length > 0 ? instance.note : instance.file;
            if (instance.name === undefined) {
              instance.name = '';
            }
          }
        });
      }
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

  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // some live transcript text has been received.  Update the display text
  React.useEffect(() => {
    const updated = combineText(streamingText, streamChunk);
    setStreamingTextDisplay(updated);
  }, [streamChunk]);

  React.useEffect(() => {
    scrollToBottom();
  }, [streamingTextDisplay]);

  // some final transcript text has been received.  Update the display text and
  // the overall text. The live transcript API returns 'final chunks' of text,
  // then starts listening and transcibing the next autio section, trying to
  // segment on pauses. We have to concatenate these final chunks as they are
  // produced to keep a record of the entire transcribed text in the streamingText
  // state.
  React.useEffect(() => {
    const updated = combineText(streamingText, finalChunk);
    setStreamingText(updated);
    setStreamingTextDisplay(updated);
  }, [finalChunk]);

  // User has changed some instance property text, but wants to discard.  We
  // read the original property value back into instance text, ovverriding their
  // changes
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

  // user has changed some instances property text and requested to save.  We
  // update the original property text and save to data store
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

  // Config object for each property of an instance and what to call to
  // get an AI update, what property it reads of an instance to send to
  // the AI, which property it writes the AI response to, and what message
  // to show the user while the AI is generating the content. Used by
  // genericAiTranscriptProcessCall() through generateActionForProperty
  // mapped to the name of each property tab
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

  // handles AI call and update of each property that can be filled in
  // by an AI request
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

  // calls the generic AI call based on configuration
  // for the current property being looked at by the user
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

  // user recording state
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
        setRequestAudioSession(undefined);
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

  // user choice to start/stop/cancel microphone recording
  const handleRecordingState = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setRecordingState(newValue);
  };

  // listen for media recorder data/end events, part of
  // process for recording audio from microphone
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

  // user request to paste in their own transcript and
  // create a new record instead of having one generated
  // from an audio recording
  const setRequestManualTranscript = () => {
    createManualTranscriptEntry(
      'PASTED TRANSCRIPT',
      'paste here',
      'Manually imported transcript',
      'Manually imported transcript',
    );
  };

  // save audio as array buffer to file. Last step after
  // recording audio through the microphone, generates a clean
  // new record ready to be transcribed, summarized, etc.
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
          name: fileName,
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

  // user choice to start/stop/cancel streaming transcription process
  const handleStreamingState = (newValue: string) => {
    setStreamingState(newValue);
  };

  // User has request a live transcript. Initialize all the
  // related state variables
  React.useEffect(() => {
    setStreamChunk(undefined);
    setStreamingText(undefined);
    setStreamingTextDisplay(undefined);
  }, [requestLiveTranscription]);

  // user streamed transcript state
  React.useEffect(() => {
    const checkstate = async () => {
      if (streamingState === 'start') {
        setStreamingMessage('Transcribing audio');
        const status = await window.electron.ipcRenderer.streamStart();
        setStreamingMessage(status);
      } else if (streamingState === 'stop') {
        setStreamingMessage('Transcription stopped.');
        await window.electron.ipcRenderer.streamStop();
      } else if (streamingState === 'cancel') {
        setStreamingMessage('');
        await window.electron.ipcRenderer.streamStop();
        setRequestLiveTranscription(undefined);
      }
    };
    checkstate();
  }, [streamingState]);

  React.useEffect(() => {
    if (requestLiveTranscription !== undefined) {
      setStreamingState(undefined);
    }
  }, [requestLiveTranscription]);

  const saveStreamingTranscript = () => {
    createManualTranscriptEntry(
      'streamed transcript',
      streamingTextDisplay || '',
      '',
      'streamed transcript',
    );
    setRequestLiveTranscription(undefined);
  };

  const applyAudioFilePath = () => {
    if (addAudioFilePath !== undefined) {
      createManualTranscriptEntry(
        addAudioFilePath,
        '',
        'Manually imported audio file',
        'Manually imported audio file',
      );
    }
    setAddAudioFilePath(undefined);
  };

  // compress on request
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
          if (selectedInstance?.id === toUpdate.id && propertyTab === 'file') {
            setSelectedInstanceText(toUpdate.file);
            setShowCompress(false);
          }
        }
      }
    };
    if (requestCompress !== undefined) {
      setAlertCloudActivity('Compressing.  Might take a while');
      asyncCall();
    }
  }, [requestCompress]);

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
                          title="Add an existing audio file of a lecture for transcription"
                        >
                          <Button
                            onClick={() =>
                              setAddAudioFilePath('paste audio file path')
                            }
                            variant="text"
                          >
                            <ImportExportTwoTone />
                          </Button>
                        </Tooltip>
                        <Tooltip
                          arrow
                          title="Initialize a live transcript session"
                        >
                          <Button
                            sx={{ marginRight: '10px' }}
                            variant="text"
                            color="info"
                            onClick={() => {
                              setStreamingMessage('');
                              setRequestLiveTranscription('go');
                            }}
                          >
                            <StreamTwoTone />
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
                          <TableCell>{row.name}</TableCell>
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
          <Grid paddingX="15px" item xs={9}>
            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={propertyTab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList
                    onChange={handlePropertyTabChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab label="Name" value="name" />
                    <Tab label="File" value="file" />
                    <Tab label="Notes" value="note" />
                    <Tab label="Transcript" value="transcript" />
                    <Tab label="Summary" value="AISummary" />
                    <Tab label="Study Guide" value="AIStudyGuide" />
                  </TabList>
                </Box>

                <Grid padding={1} container>
                  {showNoExist && (
                    <Alert
                      severity="warning"
                      variant="filled"
                      sx={{ width: '100%' }}
                    >
                      It looks like this file doesn&apos;t actually exist
                    </Alert>
                  )}
                  <Grid padding={1} item xs={12}>
                    {markdownDisplayFlag && !readonly && (
                      <Button
                        sx={{ marginRight: '10px' }}
                        variant="outlined"
                        color="info"
                        onClick={() => setMarkdownDisplayFlag(false)}
                      >
                        View/Edit Text
                      </Button>
                    )}
                    {!markdownDisplayFlag && !readonly && (
                      <Button
                        sx={{ marginRight: '10px' }}
                        variant="outlined"
                        color="info"
                        onClick={() => setMarkdownDisplayFlag(true)}
                      >
                        View Markdown
                      </Button>
                    )}

                    {showCompress && (
                      <Tooltip
                        arrow
                        title="Compress audio to save file space before sending off for transcription"
                      >
                        <Button
                          sx={{ marginX: '1em' }}
                          onClick={() => setRequestCompress(selectedInstance)}
                          variant="outlined"
                        >
                          <CompressTwoTone />
                        </Button>
                      </Tooltip>
                    )}
                    {showOpenFile && selectedInstanceText && (
                      <Tooltip arrow title="Open file">
                        <Button
                          sx={{ marginLeft: '1px' }}
                          onClick={() =>
                            window.electron.ipcRenderer.openFIle(
                              selectedInstanceText,
                            )
                          }
                          variant="outlined"
                        >
                          <FileOpenTwoTone />
                        </Button>
                      </Tooltip>
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
              {!markdownDisplayFlag && !readonly && (
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
              {readonly && (
                <Box
                  sx={{
                    width: '95%',
                    marginLeft: 2,
                    maxWidth: '95%',
                    overflow: 'auto',
                  }}
                >
                  <Markdown>{selectedInstanceText}</Markdown>
                </Box>
              )}

              {!readonly && markdownDisplayFlag && selectedInstanceText && (
                <Box
                  sx={{
                    width: '95%',
                    marginLeft: 2,
                    maxWidth: '95%',
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

      {/* Popup live transcription */}
      <Modal
        onClose={() => handleStreamingState('cancel')}
        open={requestLiveTranscription !== undefined}
      >
        <ModalBox>
          <h4>{streamingMessage}</h4>

          <Button onClick={() => handleStreamingState('start')}>
            <RecordVoiceOverTwoTone />
            <Box sx={{ marginLeft: 2 }}>Start</Box>
          </Button>

          {streamingState === 'start' && (
            <Button onClick={() => handleStreamingState('stop')}>
              <StopCircleOutlined />
              <Box sx={{ marginLeft: 2 }}>Stop</Box>
            </Button>
          )}

          <Button onClick={() => handleStreamingState('cancel')}>
            <CancelTwoTone />
            <Box sx={{ marginLeft: 2 }}>Cancel</Box>
          </Button>
          {streamingState === 'start' && <LinearProgress color="secondary" />}
          {streamingState === 'stop' &&
            streamingTextDisplay !== undefined &&
            streamingTextDisplay.length > 0 && (
              <Button onClick={() => saveStreamingTranscript()}>
                Save Transcript
              </Button>
            )}
          <Box
            sx={{
              width: '95%',
              marginLeft: 2,
              maxWidth: '95%',
              maxHeight: '50vh',
              overflow: 'auto',
            }}
          >
            <Markdown>{streamingTextDisplay || ''}</Markdown>
            <div ref={messagesEndRef} />
          </Box>
        </ModalBox>
      </Modal>

      {/* Popup recording interface */}
      <Modal
        onClose={() => setRequestAudioSession(undefined)}
        open={requestAudioSession !== undefined}
      >
        <ModalBox>
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
              disabled={recordingState !== 'start'}
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
        </ModalBox>
      </Modal>

      {/* popup for manually adding existing audio */}
      <Modal open={addAudioFilePath !== undefined}>
        <ModalBox>
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
        </ModalBox>
      </Modal>
    </>
  );
}
