import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import CurrencyInput from 'react-currency-input-field';
import React from 'react';

interface PlacezCurrencyProps
  extends React.ComponentProps<typeof CurrencyInput> {
  label?: string;
  inputProps?: {
    style?: React.CSSProperties;
    readOnly?: boolean;
  };
}

const PlacezCurrency = styled(CurrencyInput)<PlacezCurrencyProps>(
  ({ theme }) => ({
    width: '100%',
    flex: '1',
    margin: `${theme.spacing()}px ${theme.spacing()}px`,
    alignSelf: 'flex-end',
  })
);

const VariantStandardTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    textAlign: 'right',
  },
}));

VariantStandardTextField.defaultProps = {
  variant: 'standard',
};

PlacezCurrency.defaultProps = {
  prefix: '$',
  autoComplete: 'off', // Disable browser autocomplete if needed
  customInput: VariantStandardTextField,
};

export default PlacezCurrency;
