import { InputAdornment, Theme } from '@mui/material';
import { usePlacesWidget } from 'react-google-autocomplete';

import type { AddressAutocompleteProps } from '.';
import { createStyles, makeStyles } from '@mui/styles';
import PlacezTextField from '../../PlacezUIComponents/PlacezTextField';
import { Search } from '@mui/icons-material';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    addressAutocomplete: {
      '& .pac-container': {
        zIndex: '1051 !important',
      },
      backgroundColor: 'blue !important',
    },
  })
);

export default function AddressAutocomplete({
  onSelected,
  addressTypes,
  ...rest
}: AddressAutocompleteProps) {
  const { ref } = usePlacesWidget({
    onPlaceSelected: (place) => onSelected(place),
    options: {
      types: addressTypes,
    },
  });

  const classes = styles();

  return (
    <PlacezTextField
      label="Full Address"
      className={classes.addressAutocomplete}
      inputRef={ref}
      {...rest}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
    />
  );
}
