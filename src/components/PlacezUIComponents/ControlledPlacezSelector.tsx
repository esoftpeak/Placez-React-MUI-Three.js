import { Controller } from 'react-hook-form';
import PlacezSelector from './PlacezSelector';

interface BaseSelectOption {
  value: string | number;
  label: string;
}

interface PlacezSelectorProps {
  options: BaseSelectOption[];
  control: any;
  label: string;
  name: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  watch?: any;
}

export const ControlledPlacezSelector = ({
  options,
  control,
  label,
  name,
  required,
  error,
  helperText,
  watch,
}: PlacezSelectorProps) => {
  watch?.(name);

  const getOptionLabel = (value: string | number) => {
    const option = options.find(option => option.value === value);
    return option ? option.label : '';
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field: { onChange, value } }) => (
        <PlacezSelector
          options={options}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};
