import { Box, IconButton } from '@mui/material';
import { FormatAlignCenter, FormatAlignLeft, FormatAlignRight } from '@mui/icons-material'

type Props = {
  value: string;
  onChange: (value: string) => void;
}

function JustifyPicker(props: Props) {
  const {value, onChange} = props;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconButton value="left" aria-label="left aligned" color={props.value === 'left' ? 'primary' : 'inherit'} onClick={e => onChange('left')}>
        <FormatAlignLeft />
      </IconButton>
      <IconButton value="center" aria-label="center" color={props.value === 'center' ? 'primary' : 'inherit'} onClick={e => onChange('center')}>
        <FormatAlignCenter />
      </IconButton>
      <IconButton value="right" aria-label="right aligned" color={props.value === 'right' ? 'primary' : 'inherit'} onClick={e => onChange('right')}>
        <FormatAlignRight />
      </IconButton>
    </Box>
  );
}

export default JustifyPicker;
