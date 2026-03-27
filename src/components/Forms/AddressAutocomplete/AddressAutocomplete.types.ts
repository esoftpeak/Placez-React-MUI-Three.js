import { TextFieldProps } from '@mui/material';

export type AddressAutocompleteProps = {
  onSelected: (place: google.maps.places.PlaceResult) => void;
  addressTypes?: string[];
} & TextFieldProps;
