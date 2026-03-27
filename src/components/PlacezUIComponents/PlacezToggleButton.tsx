import { ToggleButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlacezToggleButton = styled(ToggleButton)(({ theme }) => ({
  ...theme.PlacezBorderStyles,
  width: '38px',
  height: '38px',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
}));

export default PlacezToggleButton;
