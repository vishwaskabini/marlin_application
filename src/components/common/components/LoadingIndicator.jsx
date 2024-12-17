import React from 'react';
import { CircularProgress, Backdrop, Typography } from '@mui/material';

const LoadingIndicator = ({isLoading}) => {
  if (!isLoading) return null;
  return (
    <Backdrop open={isLoading} sx={{zIndex: (theme) => theme.zIndex.drawer + 1, display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff'}}>      
      <CircularProgress color="inherit" />
      <Typography color='#fff' sx={{marginTop: 2}}>Loading...Please wait ..!</Typography>
    </Backdrop>
  );
};

export default LoadingIndicator;