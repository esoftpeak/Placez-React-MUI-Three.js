import { useSelector } from 'react-redux';

import { createStyles, Theme } from '@mui/material';

import { makeStyles } from '@mui/styles';

import { isNotEmpty } from '../Utils';
import { ReduxState } from '../../reducers';
import { Utils } from '../../blue/core/utils';
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
import { ControlledPlacezAutocomplete } from '../PlacezUIComponents/PlacezAutoComplete';
import formStyles from '../Styles/formStyles.css';
import { ControlledPlacezZipField } from '../PlacezUIComponents/PlacezZipField';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Place } from '../../api';
import { AddressSearch } from '../AddressInfoSearch/AdressSearch';
import { ControlledPlacezStateField } from '../PlacezUIComponents/PlacezStateField';

interface Props {
  hookForm: UseFormReturn<Place, any, undefined>;
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
      padding: '40px',
      alignItems: 'center',
    },
  })
);

const PlaceForm = (props: Props) => {
  const styles = makeStyles<Theme>(formStyles);
  const customStyles = useCustomStyles();
  const classes = { ...styles(props), ...customStyles };

  const {
    register,
    control,
    formState: { errors },
    setValue,
    trigger,
    getValues,
    watch,
  } = props.hookForm;

  const picklists = useSelector(
    (state: ReduxState) => state.settings.pickLists
  );
  const settingsReady = useSelector(
    (state: ReduxState) => state.settings.settingsReady
  );

  const onAddressSelect = (address) => {
    setValue('address', address);
    trigger();
  };

  const formValues = watch();
  watch('address');

  return (
    <div className={classes.root}>
      <div className={classes.formThreeColGrid}>
        <PlacezTextField
          id="title"
          autoFocus
          {...register('name', {
            required: 'Name is required',
          })}
          label={'Place Name'}
          inputProps={{
            maxLength: 200,
          }}
          error={errors?.name?.message !== undefined}
          helperText={errors?.name?.message}
        />
        <PlacezTextField
          id="contactRep"
          label="Contact Rep"
          {...register('contact')}
        />
        <PlacezTextField
          id="capacity"
          label="Capacity"
          type="number"
          {...register('capacity')}
        />
        <ControlledPlacezAutocomplete
          disabled={!settingsReady}
          control={control}
          label={'Place Type'}
          {...register('type')}
          options={isNotEmpty(picklists)
            .find((list) => {
              return list.name === 'PlaceType';
            })
            .picklistOptions.sort((a, b) => a.sortOrder - b.sortOrder)
            .map((placeType, index) => ({
              value: placeType.name,
              label: placeType.name,
            }))}
        />
        <Controller
          control={control}
          name="costMultiplier"
          render={({ field: { onChange, onBlur, value } }) => (
            <PlacezTextField
              style={
                {
                  // gridColumn: '2',
                }
              }
              className={classes.costMultiplier}
              id="Cost Multiplier"
              label="Cost Multiplier"
              type="number"
              value={value}
              onChange={(e) => {
                const value = Utils.roundDigits(parseFloat(e.target.value), 2);
                return onChange(value);
              }}
            />
          )}
        />
        <div style={{ gridColumn: '1 / span 3' }}>
          <AddressSearch onAddressSelect={onAddressSelect} />
        </div>
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
          {...register('address.country', {})}
          inputProps={{
            maxLength: 60,
          }}
          InputLabelProps={{ shrink: !!watch('address.country') }}
        />
        <PlacezTextField
          style={{ gridColumn: '1 / span 3' }}
          id="notes"
          label="Notes"
          multiline
          {...register('notes')}
        />
      </div>
    </div>
  );
};

export default PlaceForm;
