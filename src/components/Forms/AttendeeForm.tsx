import { useSelector } from 'react-redux';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

// Models
import { ReduxState } from '../../reducers';
import formStyles from '../Styles/formStyles.css';
import { UseFormReturn } from 'react-hook-form';
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
import { Attendee } from '../../api'
import { ControlledPlacezPhoneNumberField } from '../PlacezUIComponents/PlacezPhoneNumberField'
interface Props {
  hookForm?: UseFormReturn<Attendee, any, undefined>;
}

const customStyles = makeStyles<Theme>((theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: '100%',
    margin: '0 auto',
  },

  formThreeColGrid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gridRowGap: '50px',
    gridColumnGap: '60px',
    padding: '50px',
    alignItems: 'center',
  },
}));

const AttendeeForm = (props: Props) => {
  const styles = makeStyles<Theme>(formStyles);
  const customClasses = customStyles(props);
  const classes = {
    ...styles(props),
    ...customClasses
  };

  const {
    register,
    control,
    formState: { errors, dirtyFields },
    getValues,
    watch,
  } = props.hookForm;

  const places = useSelector((state: ReduxState) => state.place.places);
  /*
  'allergies',
  'rsvp',
  */
  const data = getValues();

  return (
    <div className={classes.root}>
      <div className={classes.formThreeColGrid}>
        <PlacezTextField
          id="title"
          autoFocus
          {...register('firstName', {
            required: 'Name is required',
          })}
          label={'First Name'}
          inputProps={{
            maxLength: 200,
          }}
          error={errors?.firstName?.message !== undefined}
          helperText={errors.firstName?.message}
        />
        <PlacezTextField
          id="title"
          autoFocus
          {...register('lastName', {
            required: 'Name is required',
          })}
          label={'Last Name'}
          inputProps={{
            maxLength: 200,
          }}
          error={errors?.lastName?.message !== undefined}
          helperText={errors.lastName?.message}
        />
        <PlacezTextField
          id="title"
          autoFocus
          {...register('group')}
          label={'Group'}
          inputProps={{
            maxLength: 200,
          }}
        />
        <PlacezTextField
          id="meal"
          autoFocus
          {...register('meal')}
          label={'Meal'}
          inputProps={{
            maxLength: 200,
          }}
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
    </div>
  );
};

export default AttendeeForm;
