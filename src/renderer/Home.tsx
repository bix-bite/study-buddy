import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Transcribe from './Transcribe';
import GuiShowcase from './GuiShowcase';
import AiConfig from './AiConfig';

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
          <Tab label="AI Configuration" id="tab-1" aria-controls="pnl-1" />
          <Tab label="Gui Showcase" id="tab-2" aria-controls="pnl-2" />
        </Tabs>
      </Box>

      <div
        role="tabpanel"
        hidden={value !== 0}
        id="pnl-0"
        aria-labelledby="tab-0"
      >
        {value === 0 && (
          <Box sx={{ p: 3 }}>
            <Transcribe />
          </Box>
        )}
      </div>
      <div
        role="tabpanel"
        hidden={value !== 1}
        id="pnl-1"
        aria-labelledby="tab-1"
      >
        {value === 1 && (
          <Box sx={{ p: 3 }}>
            <AiConfig />
          </Box>
        )}
      </div>
      <div
        role="tabpanel"
        hidden={value !== 2}
        id="pnl-2"
        aria-labelledby="tab-2"
      >
        {value === 2 && (
          <Box sx={{ p: 3 }}>
            <GuiShowcase />
          </Box>
        )}
      </div>
    </Box>
  );
}
