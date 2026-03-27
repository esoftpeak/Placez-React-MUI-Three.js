import React from 'react';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Controller } from 'react-hook-form';

// Ensure PlacezTextField has the desired styles (e.g., no border)
// You can define these styles in the PlacezTextField component

export const PlacezDatePicker = (props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopDatePicker
        {...props}
        slotProps={{
          textField: { variant: 'standard' },
        }}
      />
    </LocalizationProvider>
  );
};

export default PlacezDatePicker;

type PlacezDatePickerProps = {
  control: any;
  label: string;
  name: string;
  required?: boolean;
  inputProps?: any;
  error?: boolean;
  helperText?: string;
  onChangeFunction: (v: string) => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
};

export const ControlledPlacezDatePicker = ({
  control,
  label,
  name,
  required,
  inputProps,
  error,
  helperText,
  closeOnSelect,
  onChangeFunction,
  disabled,
}: PlacezDatePickerProps) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required,
    }}
    render={({ field: { onChange, value, ..._field } }) => (
      <PlacezDatePicker
        label={label}
        value={value ? new Date(value) : new Date()}
        onChange={onChangeFunction}
        closeOnSelect
        disabled={disabled}
        {..._field}
      />
    )}
  />
);
