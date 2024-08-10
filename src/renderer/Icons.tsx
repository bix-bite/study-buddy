import React, { useState } from 'react';
import * as MuiIcons from '@mui/icons-material';
import { IconButton, Grid, Typography, Pagination } from '@mui/material';

export default function Icons() {
  const [page, setPage] = useState(1);
  const iconsPerPage = 12;

  // Convert the imported icons object to an array
  // eslint-disable-next-line prettier/prettier
  const iconNames = Object.keys(MuiIcons).filter((name) => name.endsWith('TwoTone'));

  // Calculate total pages
  const totalPages = Math.ceil(iconNames.length / iconsPerPage);

  // Get current page icons
  const currentIcons = iconNames.slice(
    (page - 1) * iconsPerPage,
    page * iconsPerPage,
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  return (
    <div>
      <Grid container spacing={2}>
        {currentIcons.map((iconName) => {
          const Icon = MuiIcons[iconName as keyof typeof MuiIcons];
          return (
            <Grid item key={iconName} xs={3} style={{ textAlign: 'center' }}>
              <IconButton>
                <Icon />
              </IconButton>
              <Typography variant="caption" display="block">
                {iconName.replace('TwoTone', '')}
              </Typography>
            </Grid>
          );
        })}
      </Grid>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      />
    </div>
  );
}
