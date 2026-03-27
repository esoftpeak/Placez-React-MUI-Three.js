import { useSelector } from 'react-redux';

import { createStyles, Theme } from '@mui/material';

import { makeStyles } from '@mui/styles';

// Models
import { Client } from '../../api';
import { ReduxState } from '../../reducers';
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
import { ControlledPlacezPhoneNumberField } from '../PlacezUIComponents/PlacezPhoneNumberField';
import { ControlledPlacezAutocomplete } from '../PlacezUIComponents/PlacezAutoComplete';
import { ControlledPlacezZipField } from '../PlacezUIComponents/PlacezZipField';
import formStyles from '../Styles/formStyles.css';
import { UseFormReturn } from 'react-hook-form';
import { AddressSearch } from '../AddressInfoSearch/AdressSearch';
import { ControlledPlacezStateField } from '../PlacezUIComponents/PlacezStateField';
import { useEffect, useRef } from 'react';
import { store } from '../../index';
import { ToastMessage } from '../../reducers/ui';

import ClientSaveCardTable from '../Tables/ClientSaveCardTable'; 

interface Props {
  hookForm: UseFormReturn<Client, any, undefined>;
  client?: Client;
  handleCloseModal?: () => void;
}

const useCustomStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    formThreeColGrid: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridTemplateRows: '1fr 1fr 1fr',
      gridRowGap: '30px',
      gridColumnGap: '60px',
      padding: '35px',
      alignItems: 'center',
    },
    formTwoColGrid: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridRowGap: '30px',
      gridColumnGap: '60px',
      padding: '35px',
      alignItems: 'center',
    },
  })
);

const ClientForm = (props: Props) => {
  const styles = makeStyles<Theme>(formStyles);
  const customStyles = useCustomStyles();
  const classes = { ...styles(props), ...customStyles };

  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
    setError,
    trigger,
  } = props.hookForm;

  const picklists = useSelector(
    (state: ReduxState) => state.settings.pickLists
  );
  const clients = useSelector((state: ReduxState) => state.client.clients);
  const clientSaveError = useSelector(
    (state: ReduxState) => state.client.clientSaveError
  );
  const isSkipMount = useRef(true);

  useEffect(() => {
    if (clientSaveError) {
      const postalCode = clientSaveError?.errors?.['address.PostalCode'];
      const country = clientSaveError?.errors?.['address.Country'];

      if (postalCode) {
        setError(`address.postalCode`, { message: postalCode });
      }
      if (country) {
        setError(`address.country`, { message: country });
      }
      if (clientSaveError?.title)
        store.dispatch(ToastMessage(clientSaveError?.title));
    }
  }, [clientSaveError]);

  useEffect(() => {
    if (isSkipMount.current) {
      isSkipMount.current = false;
      return;
    }
    props?.handleCloseModal();
  }, [clients]);

  const onAddressSelect = (address) => {
    setValue('address', address);
    trigger();
  };

  watch('address');

  return (
    <div className={classes.root}>
      <form style={{ width: '100%' }}>
        <div className={classes.formTwoColGrid}>
          <PlacezTextField
            {...register('name', {
              required: 'Name is required',
            })}
            autoFocus
            inputProps={{
              maxLength: 200,
            }}
            label="Name"
            error={errors?.name?.message !== undefined}
            helperText={errors?.name?.message}
          />
          <ControlledPlacezAutocomplete
            control={control}
            label={'Client Type'}
            {...register('type')}
            options={picklists
              .find((list) => {
                return list.name === 'ClientType';
              })
              ?.picklistOptions.sort((a, b) => a.sortOrder - b.sortOrder)
              .map((clienttype, index) => ({
                value: clienttype.name,
                label: clienttype.name,
              }))}
          />
          <ControlledPlacezPhoneNumberField
            control={control}
            {...register('phone', {
              pattern: {
                value: /^\d{3}-\d{3}-\d{4}$/,
                message: 'Invalid Phone Number',
              },
              maxLength: 12,
            })}
            label="Phone Number"
            error={errors?.phone?.message !== undefined}
            helperText={errors?.phone?.message}
          />
          <PlacezTextField
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Invalid Email',
              },
              maxLength: 200,
            })}
            type="email"
            label="Email"
            error={errors?.email?.message !== undefined}
            helperText={errors?.email?.message}
          />
        </div>
        <div style={{ gridColumn: '1 / span 3', padding: '0px 35px' }}>
          <AddressSearch onAddressSelect={onAddressSelect} />
        </div>
        <div className={classes.formThreeColGrid}>
          <PlacezTextField
            id="address-1"
            {...register('address.line1', {})}
            label="Address Line 1"
            inputProps={{
              maxLength: 150,
            }}
            InputLabelProps={{ shrink: !!watch('address.line1') }}
          />
          <PlacezTextField
            id="address-2"
            label="Address Line 2"
            {...register('address.line2', {})}
            inputProps={{
              maxLength: 60,
            }}
            InputLabelProps={{ shrink: !!watch('address.line2') }}
          />
          <PlacezTextField
            id="city"
            label="City"
            {...register('address.city', {})}
            inputProps={{
              maxLength: 60,
            }}
            InputLabelProps={{ shrink: !!watch('address.city') }}
          />
          <ControlledPlacezStateField
            control={control}
            {...register('address.stateProvince')}
            label="State"
            error={errors?.address?.stateProvince?.message !== undefined}
            helperText={errors?.address?.stateProvince?.message}
            watch={watch}
          />
          <ControlledPlacezZipField
            control={control}
            {...register('address.postalCode', {
              required: 'The Zip Code is required',
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: 'Invalid Zip Code',
              },
            })}
            label="Zip"
            error={errors?.address?.postalCode?.message !== undefined}
            helperText={errors?.address?.postalCode?.message}
            watch={watch}
          />
          <PlacezTextField
            id="country"
            label="Country"
            {...register('address.country', {
              required: 'The Country is required',
            })}
            inputProps={{
              maxLength: 60,
            }}
            InputLabelProps={{ shrink: !!watch('address.country') }}
            error={errors?.address?.country?.message !== undefined}
            helperText={errors?.address?.country?.message}
          />
          <PlacezTextField
            style={{
              gridColumn: '1 / span 3',
            }}
            className={classes.notes}
            multiline
            id="notes"
            {...register('notes')}
            label="Notes"
          />
        </div>
        <ClientSaveCardTable client={props?.client} /> 
      </form>
    </div>
  );
};

export default ClientForm;
