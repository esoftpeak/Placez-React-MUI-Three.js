import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  children?: React.ReactNode;
  index: any;
  value: any;
  className?: string;
}

const TabPanel = (props: Props) => {
  const { children, value, index, className, ...other } = props;
  return (
    <Typography
      className={className}
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      <Box className={className} p={3}>
        {children}
      </Box>
    </Typography>
  );
};

export default TabPanel;
