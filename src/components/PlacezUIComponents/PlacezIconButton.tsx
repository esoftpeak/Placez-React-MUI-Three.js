import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

const PlacezIconButton = styled(IconButton)(({ theme }) => ({
  ...theme.PlacezBorderStyles,
  width: '32px',
  height: '32px',
  margin: '8px',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
}));

export default PlacezIconButton;
