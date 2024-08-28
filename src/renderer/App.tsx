import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './Home';

// Testing IPC handler
window.electron.ipcRenderer
  .sendMessage('ipc-example', ['ping'])
  .then((arg) => {
    return console.log(arg);
  })
  .catch((error) => console.log(error));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
}
