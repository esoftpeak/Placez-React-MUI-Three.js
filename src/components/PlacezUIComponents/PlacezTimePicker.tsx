import { DesktopTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Controller } from 'react-hook-form';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../Hooks/useLocalStorageState';

// Ensure PlacezTextField has the desired styles (e.g., no border)
// You can define these styles in the PlacezTextField component

const PlacezTimePicker = (props) => {
  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopTimePicker
        {...props}
        slotProps={{
          textField: { variant: 'standard' },
        }}
      />
    </LocalizationProvider>
  );
};

export default PlacezTimePicker;

type PlacezTimePickerProps = {
  control: any;
  label: string;
  name: string;
  required?: boolean;
  inputProps?: any;
  error?: boolean;
  helperText?: string;
  onChangeFunction: (v: any) => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
};

export const ControlledPlacezTimePicker = ({
  control,
  label,
  name,
  required,
  inputProps,
  error,
  helperText,
  onChangeFunction,
  closeOnSelect,
  disabled
}: PlacezTimePickerProps) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required,
    }}
    render={({ field: { onChange, value, ..._field } }) => (
      <PlacezTimePicker
        label={label}
        value={value ? new Date(value) : new Date()}
        onChange={onChangeFunction}
        closeOnSelect
        disabled={disabled}
      />
    )}
  />
);
