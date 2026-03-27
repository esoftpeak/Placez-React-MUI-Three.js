import React, { useState } from 'react';
import PlacezTextField from './PlacezTextField';
import { Controller } from 'react-hook-form';

const PlacezPhoneNumberField = (props) => {
  const [value, setValue] = useState(props.value || '');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const formattedValue = formatPhoneNumber(value);
    setValue(formattedValue);
    props.onChange({ target: { value: formattedValue } });
  };

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    // Slice and join to format as xxx-xxx-xxxx
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)]
      .filter(Boolean)
      .join('-');
  };

  return (
    <PlacezTextField
      {...props}
      label="Phone Number"
      value={value}
      onChange={handleChange}
      inputProps={{ maxLength: 12 }} // Max length including dashes
    />
  );
};

export default PlacezPhoneNumberField;

type PlacezPhoneNumberFieldProps = {
  control: any;
  label: string;
  name: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
};

export const ControlledPlacezPhoneNumberField = ({
  control,
  label,
  name,
  required,
  error,
  helperText,
}: PlacezPhoneNumberFieldProps) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required,
    }}
    render={({ field: { ..._field } }) => (
      <PlacezPhoneNumberField
        label={label}
        error={error}
        helperText={helperText}
        {..._field}
      />
    )}
  />
);
