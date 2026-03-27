import { Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlacezTextField from './PlacezTextField';
import { Controller } from 'react-hook-form';

const PlacezAutoComplete = styled(Autocomplete)(({ theme }) => ({
  width: '100%',
  flex: '1',
  margin: `${theme.spacing()}px ${theme.spacing()}px`,
}));
PlacezAutoComplete.defaultProps = {
  renderInput: (inputProps) => <PlacezTextField {...inputProps} />,
};

export default PlacezAutoComplete;

interface BaseAutocompleteOption {
  value: string | number;
  label: string;
}

type AutocompleteOption<T = {}> = BaseAutocompleteOption & T;

interface PlacezAutoCompleteProps {
  options: AutocompleteOption[];
  renderOption?: any;
  control: any;
  label?: string;
  name: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  watch?: any;
  disabled?: boolean
}
export const ControlledPlacezAutocomplete = (
  props: PlacezAutoCompleteProps
) => {
  const {
    name,
    control,
    options,
    label,
    required,
    error,
    helperText,
    watch,
    renderOption,
    disabled
  } = props;

  const getOpObj = (options, option) => {
    if (option.label) return option
    if (typeof option === typeof options[0].value) return options.find(op => op.value === option)
    if (typeof option === 'string' && typeof options[0].value === 'number') return options.find(op => op.value.toString() === option)
    if (typeof option === 'number' && typeof options[0].value === 'string') return options.find(op => op.value === option.toString())
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required,
      }}
      render={({ field: { onChange, value } }) => {
        return (
        <PlacezAutoComplete
          options={options}
          value={value}
          disabled={disabled}
          onChange={(e, v: AutocompleteOption) => onChange(v?.value)}
          getOptionLabel={(option: any) => getOpObj(options, option)?.label}
          isOptionEqualToValue={(option: AutocompleteOption, value) =>  option.value === value}
          renderInput={(params) => {
            return (
              <PlacezTextField
                {...params}
                label={label}
                variant="standard"
                error={error}
                helperText={helperText}
              />
            );
          }}
          renderOption={renderOption}
        />
      )}}
    />
  );
};
