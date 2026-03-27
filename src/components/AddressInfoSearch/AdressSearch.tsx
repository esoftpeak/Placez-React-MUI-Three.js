import { useCallback } from 'react';
import { Theme } from '@mui/material';

import { AddressAutocomplete } from '../Forms/AddressAutocomplete';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';
import { createStyles, makeStyles } from '@mui/styles';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    addressAutocomplete: {
      '& .pac-container': {
        zIndex: '1051 !important',
      },
      marginBottom: '0px !important',
    },
  })
);

interface AddressSearchProps {
  onAddressSelect: (PlacezAddress) => void;
}

const getGoogleAddressComponentByType = (
  addressComponents,
  googleAddresstype: string
) => {
  return addressComponents.find((field) =>
    field.types.includes(googleAddresstype)
  )?.short_name;
};

export const AddressSearch = (props: AddressSearchProps) => {
  const classes = styles();
  const mapsApi = useGoogleMapsApi();
  const { apiLoaded } = mapsApi;
  const { onAddressSelect } = props;

  const handleSelection = useCallback(
    (place: google.maps.places.PlaceResult) => {
      const { address_components: addressComponents, geometry } = place;
      console.log(addressComponents);

      if (addressComponents) {
        const postalCode = addressComponents.find((field) =>
          field.types.includes('postal_code')
        )?.short_name;

        // if (addressComponents[7]) {
        //   postalCode += `-${addressComponents[7]?.short_name}`;
        // }
        const streetNumber = getGoogleAddressComponentByType(
          addressComponents,
          'street_number'
        );
        const route = getGoogleAddressComponentByType(
          addressComponents,
          'route'
        );
        const line1 = `${streetNumber} ${route}`;
        const city = getGoogleAddressComponentByType(
          addressComponents,
          'locality'
        );
        const stateProvince = getGoogleAddressComponentByType(
          addressComponents,
          'administrative_area_level_1'
        );
        const country = getGoogleAddressComponentByType(
          addressComponents,
          'country'
        );
        const newAddress = {
          line1,
          line2: null,
          city,
          stateProvince,
          country,
          postalCode,
        };
        console.log('newAddress', newAddress);

        onAddressSelect(newAddress);
      }
    },
    []
  );

  return (
    <>
      {apiLoaded &&
        <AddressAutocomplete
          className={classes.addressAutocomplete}
          onSelected={handleSelection}
          addressTypes={['premise']}
        />
      }
    </>
  );
};
