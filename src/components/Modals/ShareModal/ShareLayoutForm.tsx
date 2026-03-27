import { Checkbox, FormControlLabel, Theme } from '@mui/material';

import { makeStyles } from '@mui/styles';
import formStyles from '../../Styles/formStyles.css'
import { Controller, UseFormReturn } from 'react-hook-form'
import { SharedUser } from '../../../api'
import PlacezTextField from '../../PlacezUIComponents/PlacezTextField'
import { GuestAccessClaims } from '../../../api/placez/models/GuestAccessClaims'
import { ControlledPlacezDatePicker } from '../../PlacezUIComponents/PlacezDatePicker'

interface Props {
  hookForm: UseFormReturn<SharedUser, any, undefined>;
}

const ShareLayoutForm = (props: Props) => {
  const styles = makeStyles<Theme>(formStyles);
  const {
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
    watch
  } = props.hookForm;
  const classes = styles(props);

  const mapPermissions = (guestAccessClaim: GuestAccessClaims): string => {
    switch (guestAccessClaim) {
      case GuestAccessClaims.UpdateLayout:
        return 'Allow Client to Edit Layout';
      case GuestAccessClaims.UpdateAttendee:
        return 'Allow Client to Edit Attendees';
      default:
        return '';
    }
  };

  const handleCheckboxChange = (claim, isChecked) => {
        const currentGuestAccess = watch('guestAccess');
        if (isChecked) {
            setValue('guestAccess', [...currentGuestAccess, claim]);
        } else {
            setValue('guestAccess', currentGuestAccess.filter((item) => item !== claim));
        }
    };

  const handleExpirationDateChange = (expirationUtcDateTime: string) => {
    setValue('expirationUtcDateTime', new Date(expirationUtcDateTime));
  };

  return (
      <>
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
        {Object.values(GuestAccessClaims).map((claim) => (
          <Controller
            key={claim}
            name="guestAccess"
            control={control}
            render={({ field }) => (
                <FormControlLabel
                    control={
                        <Checkbox
                            {...field}
                            checked={watch('guestAccess')?.includes(claim)}
                            onChange={(e) => handleCheckboxChange(claim, e.target.checked)}
                        />
                    }
                    label={mapPermissions(claim)}
                />
            )}
          />
        ))}
        <ControlledPlacezDatePicker
          {...register('expirationUtcDateTime')}
          control={control}
          label="Share Until"
          onChangeFunction={handleExpirationDateChange}
          closeOnSelect
        />
    </>
  );
};

export default ShareLayoutForm;
