import { Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';

const PlacezSelect = styled(FormControl)(({ theme }) => ({
  width: '100%',
  flex: '1',
  margin: `${theme.spacing()}px ${theme.spacing()}px`,
}));

export interface BaseSelectOption {
  value: string | number;
  label: string;
}

interface PlacezSelectorProps {
  options: BaseSelectOption[];
  value: string | number;
  onChange: (event: any) => void;
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const PlacezSelector = ({
  options,
  value,
  onChange,
  label,
  required,
  error,
  helperText,
}: PlacezSelectorProps) => {
  return (
    <PlacezSelect variant="standard" error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        label={label}
        required={required}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </PlacezSelect>
  );
};

export default PlacezSelector;
