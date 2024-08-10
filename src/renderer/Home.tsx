import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Transcribe from './Transcribe';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pnl-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
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
          <Tab label="Item Three" id="tab-2" aria-controls="pnl-2" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Transcribe></Transcribe>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Item 2
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item 3
      </CustomTabPanel>
    </Box>
  );
}
