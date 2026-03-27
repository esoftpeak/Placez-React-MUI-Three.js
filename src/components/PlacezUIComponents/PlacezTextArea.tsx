import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlacezTextArea = styled(TextField)(({ theme }) => ({
  width: '100%',
  flex: '1',
  margin: `${theme.spacing()}px ${theme.spacing()}px`,
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    display: 'none',
  },
  ...theme.PlacezBorderStyles,
  backgroundColor: theme.palette.background.paper,
  padding: '4px'
}));
PlacezTextArea.defaultProps = {
  variant: 'standard',
  multiline: true,
  rows: 4,
  InputProps: {disableUnderline: true},
};

export default PlacezTextArea;
