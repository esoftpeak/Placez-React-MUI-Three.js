import { useSelector } from 'react-redux';

import { Theme } from '@mui/material';

import { makeStyles } from '@mui/styles';

// Models
import { ReduxState } from '../../reducers';
import PlacezFixturePlan from '../../api/placez/models/PlacezFixturePlan';
import { ControlledPlacezAutocomplete } from '../PlacezUIComponents/PlacezAutoComplete';
import PlacezCurrency from '../PlacezUIComponents/PlacezCurrency';
import formStyles from '../Styles/formStyles.css';
import { Controller, UseFormReturn } from 'react-hook-form';
import { billingRate } from '../../blue/core/utils';
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
interface Props {
  hookForm?: UseFormReturn<PlacezFixturePlan, any, undefined>;
}

const FloorplanForm = (props: Props) => {
  const styles = makeStyles<Theme>(formStyles);
  const classes = styles(props);

  const {
    register,
    control,
    formState: { errors, dirtyFields },
    getValues,
    watch,
  } = props.hookForm;

  const places = useSelector((state: ReduxState) => state.place.places);

  return (
    <div className={classes.root}>
      <div className={classes.formTwoColGrid}>
        <PlacezTextField
          id="title"
          autoFocus
          {...register('name', {
            required: 'Floorplan Name is required',
          })}
          label={'Floorplan Name'}
          inputProps={{
            maxLength: 200,
          }}
          error={errors?.name?.message !== undefined}
          helperText={errors.name?.message}
        />

        <ControlledPlacezAutocomplete
          control={control}
          name="priceRateInHours"
          label={'Billing Rate'}
          options={billingRate.map((rate) => ({
            label: rate.label,
            value: rate.value,
          }))}
        />
        <Controller
          control={control}
          name="price"
          rules={{
            min: 0,
          }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <PlacezCurrency
              label={'Price'}
              value={value} onValueChange={(e) => onChange(e)} />
          )}
        />
        <ControlledPlacezAutocomplete
          control={control}
          label={'Venue'}
          {...register('placeId')}
          options={places.map((place) => ({
            label: place.name,
            value: place.id,
          }))}
          required
          error={
            errors?.placeId?.message !== undefined ||
            (getValues('id') && dirtyFields?.placeId)
          }
          helperText={
            errors?.placeId?.message
              ? errors?.placeId?.message
              : getValues('id') && dirtyFields?.placeId
                ? 'Caution! Floorplan will move to selected Venue'
                : ''
          }
        />
      </div>
    </div>
  );
};

export default FloorplanForm;
