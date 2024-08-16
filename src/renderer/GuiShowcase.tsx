import * as React from 'react';
import { styled } from '@mui/material/styles';

import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Badge, { BadgeProps } from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import MailIcon from '@mui/icons-material/Mail';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import {
  AlertTitle,
  Button,
  Divider,
  Snackbar,
  SnackbarCloseReason,
  Typography,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Icons from './Icons';
import Lists from './Lists';
import Tables from './Tables';
import SimpleDialogDemo from './Dialog';
import Progress from './Progress';
import Papers from './Paper';
import Drawers from './Drawers';
import Menus from './Menu';

interface ChipData {
  key: number;
  label: string;
}

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const Item2 = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#112027' : '#ccc',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function GuiShowcase() {
  const [chipData, setChipData] = React.useState<readonly ChipData[]>([
    { key: 0, label: 'Angular' },
    { key: 1, label: 'jQuery' },
    { key: 2, label: 'Polymer' },
    { key: 3, label: 'React' },
    { key: 4, label: 'Vue.js' },
  ]);

  const [openBackdrop, setOpenBackdrop] = React.useState(false);
  const handleCloseBackdrop = () => {
    setOpenBackdrop(false);
  };
  const handleOpenBackdrop = () => {
    setOpenBackdrop(true);
  };

  const handleDelete = (chipToDelete: ChipData) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key),
    );
  };

  const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const handleClickSnackbar = () => {
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <div>
      <Alert severity="success">
        <AlertTitle>All the material UI components on offer</AlertTitle>
        There's nothing for you to do on this tab. It's just here for me to see
        the various UI components and keep a reference in the code to how they
        are configure.
      </Alert>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>Badges, Chips, Icons, and Lists</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid xs={8}>
                <Box sx={{ width: '100%' }}>
                  <Stack spacing={1}>
                    <Item2>
                      <Stack spacing={2} direction="row">
                        <Badge color="secondary" variant="dot">
                          <MailIcon />
                        </Badge>
                        <Badge badgeContent={4} color="secondary">
                          <MailIcon color="action" />
                        </Badge>
                        <Badge badgeContent={4} color="success">
                          <MailIcon color="action" />
                        </Badge>
                        <StyledBadge badgeContent={4} color="secondary">
                          <ShoppingCartIcon />
                        </StyledBadge>
                      </Stack>
                    </Item2>
                    <Item2>
                      <Paper
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          flexWrap: 'wrap',
                          listStyle: 'none',
                          p: 0.5,
                          m: 0,
                        }}
                        component="ul"
                      >
                        {chipData.map((data) => {
                          let icon;

                          if (data.label === 'React') {
                            icon = <TagFacesIcon />;
                          }

                          return (
                            <ListItem key={data.key}>
                              <Chip
                                icon={icon}
                                label={data.label}
                                onDelete={
                                  data.label === 'React'
                                    ? undefined
                                    : handleDelete(data)
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </Paper>
                    </Item2>
                    <Item2>
                      <Icons />
                    </Item2>
                  </Stack>
                </Box>
              </Grid>
              <Grid xs={4}>
                <Item>
                  <Lists />
                </Item>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography>Tooltips, Alerts, and Tables</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Item>
                  <Tooltip title="This is a tooltip" arrow>
                    <Button>Tooltip</Button>
                  </Tooltip>
                  <Stack sx={{ width: '100%' }} spacing={2}>
                    <Alert severity="success">This is a success Alert.</Alert>
                    <Alert severity="info">This is an info Alert.</Alert>
                    <Alert severity="warning">This is a warning Alert.</Alert>
                    <Alert severity="error">This is an error Alert.</Alert>
                  </Stack>
                </Item>
              </Grid>
              <Grid xs={8}>
                <Item>
                  <Tables />
                </Item>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography>Backdrop, Dialog, Progress</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid xs={4}>
                <div>
                  <Button onClick={handleOpenBackdrop}>Show backdrop</Button>
                  <Backdrop
                    sx={{
                      color: '#fff',
                      zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={openBackdrop}
                    onClick={handleCloseBackdrop}
                  >
                    <CircularProgress color="inherit" />
                  </Backdrop>
                  <Divider />
                  <SimpleDialogDemo />
                  <Divider />
                  <Button onClick={handleClickSnackbar}>Open Snackbar</Button>
                  <Snackbar
                    open={openSnackbar}
                    autoHideDuration={5000}
                    onClose={handleCloseSnackbar}
                    message="This Snackbar will be dismissed in 5 seconds."
                  />
                </div>
              </Grid>
              <Grid xs={8}>
                <Progress />
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography>Paper and cards</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Papers />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography>Menus</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Drawers />
          <Menus />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
