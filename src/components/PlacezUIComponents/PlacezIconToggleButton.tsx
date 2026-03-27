import { ToggleButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlacezIconToggleButton = styled(ToggleButton)(({ theme }) => ({
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: '4px',
  width: '32px',
  height: '32px',
  margin: '8px',
}));

export default PlacezIconToggleButton;
