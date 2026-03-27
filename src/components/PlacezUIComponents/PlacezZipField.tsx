import React, { useState } from 'react';
import PlacezTextField from './PlacezTextField';
import { Controller } from 'react-hook-form';
import { TextFieldProps } from '@mui/material'

const PlacezZipField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref) => {
  const [value, setValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const formattedValue = formatZipNumber(value);
    setValue(formattedValue);
    props.onChange?.({ target: { value: formattedValue } } as any);
  };

  const formatZipNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    // Slice and join to format as xxx-xxx-xxxx
    return digits.slice(0, 5);
  };

  return (
    <PlacezTextField
      {...props}
      ref={ref}
      label="Zip Code"
      value={value}
      onChange={handleChange}
      inputProps={{ maxLength: 12 }} // Max length including dashes
    />
  );
});

export default PlacezZipField;

type PlacezZipFieldProps = {
  control: any;
  label: string;
  name: string;
  error?: boolean;
  helperText?: string;
  watch?: any;
};

const formatZipNumber = (input: string): string => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');
  // Slice and join to format as xxx-xxx-xxxx
  return digits.slice(0, 5);
};

export const ControlledPlacezZipField = ({
  control,
  label,
  name,
  error,
  helperText,
  watch,
}: PlacezZipFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <PlacezTextField
        label={label}
        error={error}
        helperText={helperText}
        onChange={(e) => onChange(formatZipNumber(e.target.value))}
        value={value}
        InputLabelProps={{ shrink: !!watch(name) }}
      />
    )}
  />
);
