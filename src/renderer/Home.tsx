import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import {
  HelpCenterTwoTone,
  Settings,
  SmartDisplayTwoTone,
  TranscribeOutlined,
} from '@mui/icons-material';
import GuiShowcase from './GuiShowcase';
import AiConfig from './AiConfig';
import Help from './Help';
import TranscriptManager from './TranscriptManager';

export default function ItDoesntMatter() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpenClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenuSelectClose = (newValue: number) => {
    setAnchorEl(null);
    setValue(newValue);
  };
  return (
    <Box width="100%" height="100%">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton
              onClick={handleMenuOpenClick}
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Study Buddy
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiMenuIcon-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleMenuSelectClose(0)}>
          <ListItemIcon>
            <TranscribeOutlined fontSize="small" />
          </ListItemIcon>
          Class Transcripts
        </MenuItem>
        <MenuItem onClick={() => handleMenuSelectClose(1)}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          AI Config
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMenuSelectClose(2)}>
          <ListItemIcon>
            <SmartDisplayTwoTone fontSize="small" />
          </ListItemIcon>
          Gui Showcase
        </MenuItem>
        <MenuItem onClick={() => handleMenuSelectClose(3)}>
          <ListItemIcon>
            <HelpCenterTwoTone fontSize="small" />
          </ListItemIcon>
          Help
        </MenuItem>
      </Menu>

      <Box sx={{ width: '100%' }}>
        <div
          role="tabpanel"
          hidden={value !== 0}
          id="pnl-0"
          aria-labelledby="tab-0"
        >
          {value === 0 && (
            <Box sx={{ p: 3 }}>
              {/* <Transcribe /> */}
              <TranscriptManager />
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
        <div
          role="tabpanel"
          hidden={value !== 3}
          id="pnl-3"
          aria-labelledby="tab-3"
        >
          {value === 3 && (
            <Box sx={{ p: 3 }}>
              <Help />
            </Box>
          )}
        </div>
      </Box>
    </Box>
  );
}
