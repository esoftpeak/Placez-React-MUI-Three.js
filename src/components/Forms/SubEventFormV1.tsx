import {
  Box,
  createStyles,
  FormLabel,
  Grid,
  Theme,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
} from '@mui/material';

import { Slide } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';

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
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { getFloorPlansByPlaceId } from '../../reducers/floorPlans';

const useCustomStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'nowrap',
      width: '100%',
      margin: '0 auto',
    },
    fieldContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: theme.spacing(),
      paddingBottom: 0,
      minHeight: '46px',
    },
    fieldHeadingLight: {
      fontWeight: '400 !important',
      fontSize: '12px !important',
      color: theme.palette.text.secondary,
    },
    labelInputLight: {
      margin: theme.spacing(2),
      width: 164,
      outline: 'none',
    },
    formThreeColGrid: {
      width: '93%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gridRowGap: '20px',
      gridColumnGap: '60px',
      padding: '20px',
      alignItems: 'center',
    },
    venueListContainer: {
      display: 'flex',
      position: 'relative',
      height: '100%',
    },
    verticalDivider: {
      position: 'absolute',
      right: 0,
      height: '100%',
    },

    tableContainer: {
      boxShadow: 'none',
      marginTop: theme.spacing(2),
      maxHeight: '300px',
      overflow: 'auto',
      backgroundColor: theme.palette.background.paper,
    },

    tableHeaderRow: {
      '& .MuiTableCell-root': {
        border: 'none',
        padding: '8px 16px',
        color: theme.palette.text.secondary,
        fontSize: '12px',
        backgroundColor: theme.palette.background.paper,
      },
    },

    tableHeaderCell: {
      fontWeight: '400',
      color: theme.palette.text.secondary,
      fontSize: '10px',
      border: 'none',
      backgroundColor: theme.palette.background.paper,
      padding: '8px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },

    tableRow: {
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
      },
      border: 'none',
    },

    tableCell: {
      border: 'none',
      padding: '8px 16px',
      color: theme.palette.text.primary,
      backgroundColor: 'inherit',
    },

    venueSelectionHeader: {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? theme.palette.background.paper
          : '#f5f0f7',
      padding: '8px 16px',
      fontSize: '18px',
      color: theme.palette.text.primary,
      fontWeight: 500,
      width: '100%',
    },
    venueItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    venueItemActive: {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
    venueItemInactive: {
      color: theme.palette.text.secondary,
      fontWeight: 400,
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },

    sectionTitle: {
      fontSize: 18,
      display: 'flex',
      padding: '5px',
      paddingLeft: '32px',
      alignItems: 'flex-end',
      width: '100%',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? theme.palette.background.paper
          : '#e9e8e8',
      color: theme.palette.primary.main,
      marginTop: '10px',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  })
);

interface Props {
  hookForm: UseFormReturn<PlacezLayoutPlan, any, undefined>;
  activeType: string;
  setActiveType: (type: string) => void;
  handleVenueRowClick: (venue: PlacezLayoutPlan) => void;
  selectedVenue: {
    id: number;
    name: string;
    type: string;
  };
  activeStep: number;
  isVenueError: string;
}

const SubEventFormV1 = (props: Props) => {
  const {
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = props.hookForm;

  const styles = makeStyles<Theme>(formStyles);
  const customStyles = useCustomStyles(props);
  const classes = { ...styles(props), ...customStyles };
  const theme = useTheme();
  const {
    activeType,
    setActiveType,
    handleVenueRowClick,
    selectedVenue,
    activeStep,
    isVenueError,
  } = props;

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

  const places = useSelector((state: ReduxState) => state.place.places);
  const setupStyleOption = useSelector(
    (state: ReduxState) =>
      state.settings.pickLists?.find((pickList) => pickList.name === 'SetupStyle')
        ?.picklistOptions
  );

  const groupedPlaces = useMemo(() => {
    if (!places.length) return {};

    return places.reduce((groups, place) => {
      const type = place.type || 'Unspecified';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(place);
      return groups;
    }, {});
  }, [places]);

  const types = useMemo(() => {
    return Object.keys(groupedPlaces).sort();
  }, [groupedPlaces]);

  useEffect(() => {
    if (types?.length && !activeType) setActiveType(types[0]);
  }, [types]);

  const activePlaces = useMemo(() => {
    if (groupedPlaces?.[activeType]?.length > 0) {
      return groupedPlaces[activeType];
    }
    return [];
  }, [groupedPlaces, activeType]);

  const isDisabled = activeStep == 2;

  const floorplans = useSelector((state: ReduxState) =>
    getFloorPlansByPlaceId(state, selectedVenue?.id)
  );

  const detail = getValues();

  useEffect(() => {
    if (floorplans?.length > 0) {
      setValue('floorPlanId', floorplans[0].id);
    }
  }, [detail.floorPlanId, floorplans]);

  return (
    <Slide direction="left" in={true} mountOnEnter unmountOnExit>
      <div className={classes.root}>
        <div className={classes.formThreeColGrid}>
          <Box className={classes.fieldGroup}>
            <FormLabel className={classes.fieldHeadingLight}>SubEvent Title *</FormLabel>
            <PlacezTextField
              id="title"
              autoFocus
              {...register('name', { required: true })}
              inputProps={{
                maxLength: 200,
              }}
              error={errors?.name?.message !== undefined}
              helperText={errors?.name?.message}
              disabled={isDisabled}
            />
          </Box>

          <ControlledPlacezDatePicker
            {...register('startUtcDateTime')}
            control={control}
            label="Start Date"
            onChangeFunction={handleStartDateChange}
            closeOnSelect
            disabled={isDisabled}
          />

          <ControlledPlacezTimePicker
            {...register('startUtcDateTime')}
            control={control}
            label="Start Time"
            onChangeFunction={handleStartTimeChange}
            closeOnSelect
            disabled={isDisabled}
          />

          <Box className={classes.fieldGroup}>
            <FormLabel className={classes.fieldHeadingLight}>Setup Style</FormLabel>
            <Controller
              name="setupStyle"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  sx={{ width: '100%', textAlign: 'start' }}
                  id="placeSelect"
                  variant="standard"
                  disabled={isDisabled}
                >
                  {setupStyleOption?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Box>

          <ControlledPlacezDatePicker
            {...register('endUtcDateTime')}
            control={control}
            label="End Date"
            onChangeFunction={handleEndDateChange}
            closeOnSelect
            disabled={isDisabled}
          />

          <ControlledPlacezTimePicker
            {...register('endUtcDateTime')}
            control={control}
            label="End Time"
            onChangeFunction={handleEndTimeChange}
            closeOnSelect
            disabled={isDisabled}
          />
        </div>

        {activeStep === 1 && (
          <>
            <Box className={classes.sectionTitle}>Venue Selection</Box>
            {isVenueError && <Box sx={{ color: 'red', fontSize: 12 }}>{isVenueError}</Box>}

            <Grid container spacing={0}>
              <Grid item xs={2.5}>
                <Box
                  className={classes.venueListContainer}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    ml: 4,
                    position: 'relative',
                    height: '100%',
                    pr: 2,
                    mt: 1,
                  }}
                >
                  {types.map((type) => (
                    <Box
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`${classes.venueItem} ${activeType === type ? classes.venueItemActive : classes.venueItemInactive
                        }`}
                    >
                      {type}
                    </Box>
                  ))}

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      position: 'absolute',
                      right: 0,
                      height: '85%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderRightWidth: 1,
                      borderColor: theme.palette.divider,
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={9.5}>
                <Box sx={{ ml: 2 }}>
                  <TableContainer
                    component={Paper}
                    className={classes.tableContainer}
                    sx={{
                      boxShadow: 'none',
                      maxHeight: '200px',
                      overflow: 'auto',
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow className={classes.tableHeaderRow}>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Capacity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Price Rate</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {activePlaces.map((row, index) => (
                          <TableRow
                            key={index}
                            className={classes.tableRow}
                            hover
                            sx={{
                              '& td': { borderBottom: 'none' },
                              backgroundColor:
                                selectedVenue?.id === row.id
                                  ? theme.palette.mode === 'dark'
                                    ? 'rgba(92, 35, 111, 0.28)'
                                    : '#e4dfe6'
                                  : theme.palette.background.paper,
                            }}
                            onClick={() => {
                              handleVenueRowClick(row);
                            }}
                          >
                            <TableCell className={classes.tableCell}>{row.name}</TableCell>
                            <TableCell className={classes.tableCell}>{row.type}</TableCell>
                            <TableCell className={classes.tableCell}>{row.capacity}</TableCell>
                            <TableCell className={classes.tableCell}>{row.cost}</TableCell>
                            <TableCell className={classes.tableCell}>{row.priceRate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </div>
    </Slide>
  );
};

export default SubEventFormV1;
