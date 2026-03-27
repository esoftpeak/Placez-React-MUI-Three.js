import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlacezGridButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.secondary.main}`,
  width: '250px',
  height: '250px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  borderRadius: '4px',
  padding: '0px !important',
  root: {
    padding: '0px',
  },
}));

export default PlacezGridButton;
