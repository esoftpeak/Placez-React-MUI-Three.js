import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlacezLargeButton = styled(Button)(({ theme }) => ({
  // backgroundColor: 'blue !important',
  ...theme.PlacezBorderStyles,
  backgroundColor: theme.palette.background.paper,
  width: '250px',
  height: '250px',
  margin: '20px',
  ...theme.typography.titleMedium,
}));
PlacezLargeButton.defaultProps = {
  variant: 'outlined',
  color: 'inherit',
};

export default PlacezLargeButton;
