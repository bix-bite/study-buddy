import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Transcribe from './Transcribe';
import GuiShowcase from './GuiShowcase';
import Chat from './Chat';
import AiConfig from './AiConfig';
import Transcribe2 from './transcribe2';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pnl-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ItDoesntMatter() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Transcribe" id="tab-0" aria-controls="pnl-0" />
          <Tab label="Chat" id="tab-1" aria-controls="pnl-1" />
          <Tab label="Gui Showcase" id="tab-2" aria-controls="pnl-2" />
          <Tab label="AI Configuration" id="tab-2" aria-controls="pnl-2" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        {/* <Transcribe /> */}
        <Transcribe2 />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Chat />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <GuiShowcase />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <AiConfig />
      </CustomTabPanel>
    </Box>
  );
}
