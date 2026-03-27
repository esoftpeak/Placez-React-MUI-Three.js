import React from 'react';
import PlacezTextField from './PlacezTextField';
import { Controller } from 'react-hook-form';
import {
  StateAbbreviations,
  StateNameToAbbreviation,
} from '../../Constants/States';

type PlacezStateFieldProps = {
  control: any;
  label: string;
  name: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  watch?: any;
};

const formatState = (input: string): string => {
  // Normalize input to handle case-insensitivity
  const normalizedInput = input.trim().toLowerCase();

  // First, try to find a match assuming the input is a full state name
  const fullNameMatch = Object.keys(StateNameToAbbreviation).find(
    (stateName) => stateName.toLowerCase() === normalizedInput
  );

  if (fullNameMatch) {
    return StateNameToAbbreviation[fullNameMatch];
  }

  // If no full name match, check if it's already a valid abbreviation
  const abbreviationMatch = StateAbbreviations.find(
    (abbr) => abbr.toLowerCase() === normalizedInput
  );

  if (abbreviationMatch) {
    return abbreviationMatch; // Return the match in its original case
  }

  return input; // Return the original input if no match is found
};

export const ControlledPlacezStateField = ({
  control,
  label,
  name,
  required,
  error,
  helperText,
  watch,
}: PlacezStateFieldProps) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: required,
      validate: (val: string) => {
        return (
          StateAbbreviations.includes(val) ||
          val === undefined ||
          'Invalid State Abbreviation'
        );
      },
    }}
    render={({ field: { onChange, value } }) => (
      <PlacezTextField
        label={label}
        error={error}
        helperText={helperText}
        onChange={(e) => onChange(formatState(e.target.value))}
        value={value}
        InputLabelProps={{ shrink: !!watch(name) }}
      />
    )}
  />
);
