import { Checkbox, FormControlLabel, Theme } from '@mui/material';

import { Slide } from '@mui/material';
import { makeStyles } from '@mui/styles';

// Models
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';
import formStyles from '../Styles/formStyles.css';
import { ControlledPlacezDatePicker } from '../PlacezUIComponents/PlacezDatePicker';
import { ControlledPlacezTimePicker } from '../PlacezUIComponents/PlacezTimePicker';
import {
  adjustForEndDate,
  adjustForEndTime,
  adjustForStartDate,
  adjustForStartTime,
} from '../../helpers/setTimeDate';
import { Controller, UseFormReturn } from 'react-hook-form';
import { PlacezLayoutPlan } from '../../api';
import { useSelector } from 'react-redux';
import { getFloorPlanById } from '../../reducers/floorPlans';
import { ReduxState } from '../../reducers';
import { placeById } from '../../reducers/place';

interface Props {
  hookForm: UseFormReturn<PlacezLayoutPlan, any, undefined>;
}

const SubEventForm = (props: Props) => {
  const {
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = props.hookForm;
  const styles = makeStyles<Theme>(formStyles);
  const classes = styles(props);

  const handleStartDateChange = (startUtcDateTimeString: string) => {
    const startUtcDateTime = new Date(startUtcDateTimeString);
    const endUtcDateTime = new Date(getValues('endUtcDateTime'));
    const timePeriod = adjustForStartDate(startUtcDateTime, endUtcDateTime);
    setValue('startUtcDateTime', timePeriod.startUtcDateTime);
    setValue('endUtcDateTime', timePeriod.endUtcDateTime);
  };

  const handleEndDateChange = (endUtcDateTimeString: string) => {
    const startUtcDateTime = new Date(getValues('startUtcDateTime'));
    const endUtcDateTime = new Date(endUtcDateTimeString);
    const timePeriod = adjustForEndDate(startUtcDateTime, endUtcDateTime);
    setValue('startUtcDateTime', timePeriod.startUtcDateTime);
    setValue('endUtcDateTime', timePeriod.endUtcDateTime);
  };

  const handleStartTimeChange = (startUtcDateTimeString: string) => {
    const startUtcDateTime = new Date(startUtcDateTimeString);
    const endUtcDateTime = new Date(getValues('endUtcDateTime'));
    const timePeriod = adjustForStartTime(startUtcDateTime, endUtcDateTime);
    setValue('startUtcDateTime', timePeriod.startUtcDateTime);
    setValue('endUtcDateTime', timePeriod.endUtcDateTime);
  };

  const handleEndTimeChange = (endUtcDateTimeString: string) => {
    const startUtcDateTime = new Date(getValues('startUtcDateTime'));
    const endUtcDateTime = new Date(endUtcDateTimeString);
    const timePeriod = adjustForEndTime(startUtcDateTime, endUtcDateTime);
    setValue('startUtcDateTime', timePeriod.startUtcDateTime);
    setValue('endUtcDateTime', timePeriod.endUtcDateTime);
  };

  const floorplanId = watch('floorPlanId');
  const floorplan = useSelector((state: ReduxState) =>
    getFloorPlanById(state, floorplanId)
  );
  const place = useSelector((state: ReduxState) => {
    return placeById(state, floorplan?.placeId);
  });

  return (
    <Slide direction="left" in={true} mountOnEnter unmountOnExit>
      <div className={classes.root}>
        <div className={classes.formThreeColGrid}>
          <PlacezTextField
            id="title"
            autoFocus
            {...register('name', { required: true })}
            label={'SubEvent Title *'}
            inputProps={{
              maxLength: 200,
            }}
            error={errors?.name?.message !== undefined}
            helperText={errors?.name?.message}
          />
          <ControlledPlacezDatePicker
            {...register('startUtcDateTime')}
            control={control}
            label="Start Date"
            onChangeFunction={handleStartDateChange}
            closeOnSelect
          />
          <ControlledPlacezTimePicker
            {...register('startUtcDateTime')}
            control={control}
            label="Start Time"
            onChangeFunction={handleStartTimeChange}
            closeOnSelect
          />
          <Controller
            control={control}
            name="isTemplate"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControlLabel
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginLeft: '0px',
                }}
                labelPlacement="start"
                control={<Checkbox />}
                label="Is Template"
                onChange={onChange}
                checked={value}
              />
            )}
          />
          <ControlledPlacezDatePicker
            {...register('endUtcDateTime')}
            control={control}
            label="End Date"
            onChangeFunction={handleEndDateChange}
            closeOnSelect
          />
          <ControlledPlacezTimePicker
            {...register('endUtcDateTime')}
            control={control}
            label="End Time"
            onChangeFunction={handleEndTimeChange}
            closeOnSelect
          />
          <PlacezTextField disabled label="Venue" value={place?.name || ''} />
          <PlacezTextField
            disabled
            label="Floorplan"
            value={floorplan?.name || ''}
          />
        </div>
      </div>
    </Slide>
  );
};

export default SubEventForm;
