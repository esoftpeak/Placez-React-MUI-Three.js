import { Box, TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

const PlacezTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  flex: '1',
  margin: `${theme.spacing()}px ${theme.spacing()}px`,
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    display: 'none',
  },
}));
PlacezTextField.defaultProps = {
  variant: 'standard',
};

export default PlacezTextField;

type IconTextFieldProps = TextFieldProps & {
  icon: React.ReactNode;
};


export const IconTextField = (props: IconTextFieldProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'end' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', margin: '4px' }}>
        {props.icon}
      </Box>
      <PlacezTextField
        id="title"
        autoFocus
        {...props}
      />
    </Box>
  )
}


export type ControlledTextFieldProps<T extends FieldValues = FieldValues> =
  TextFieldProps & {
    control: Control<T>;
    name: Path<T>;
  };

export function ControlledPlacezTextField<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: ControlledTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          {...inputProps}
          value={value ?? ''}
          error={!!error}
          helperText={error ? error.message : ' '}
          onChange={onChange}
          data-testid="controlled-text-field"
        />
      )}
    />
  );
}
