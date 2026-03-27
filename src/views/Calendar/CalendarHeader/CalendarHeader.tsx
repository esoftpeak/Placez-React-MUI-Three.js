import {
  Menu as MenuIcon,
  KeyboardArrowLeft as PreviousArrowIcon,
  KeyboardArrowRight as NextArrowIcon,
  FilterAlt as FilterIcon,
  Settings,
} from '@mui/icons-material';
import {
  IconButton,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Box,
  Theme,
} from '@mui/material';

import { CalendarHeaderProps } from './CalendarHeader.types';

import { createStyles } from '@mui/styles';
import { GrazeCalendarView } from '../Calendar/Calendar';
import PlacezIconButton from '../../../components/PlacezUIComponents/PlacezIconButton';
import PlacezDatePicker from '../../../components/PlacezUIComponents/PlacezDatePicker';
import { timePeriods } from '../../../Constants/timePeriods';
import PlacezActionButton from '../../../components/PlacezUIComponents/PlacezActionButton';
import { add, sub, addDays, format } from 'date-fns';

const styles = createStyles({
  container: {
    pl: 0.5,
    pr: 2,
    py: 1,
    // backgroundColor: 'background.shadow',
    minHeight: '80px',
  },
  datePicker: {
    maxWidth: 200,
    padding: 0,
    '& .MuiInputBase-input': {
      fontSize: 'titleMedium.fontSize',
      fontWeight: 'medium',
    },
  },
  datePickerPopper: {
    '& .Mui-selected:focus': {
      color: 'background.paper',
      backgroundColor: 'primary.main',
    },
  },
  controlsButton: {
    bgcolor: 'background.paper',
  },
  toggleButtonGroup: (theme: Theme) => ({
    ...theme.PlacezBorderStyles,
    bgcolor: 'background.paper',
    marginLeft: '8px !important',
  }),
  toggleButton: (theme: Theme) => ({
    borderTop: 'none',
    borderBottom: 'none',
    '&:first-of-type': {
      borderLeft: 'none',
      borderTopLeftRadius: theme.PlacezBorderStyles.borderRadius,
      borderBottomLeftRadius: theme.PlacezBorderStyles.borderRadius,
    },
    '&:last-child': {
      borderRight: 'none',
      borderTopRightRadius: theme.PlacezBorderStyles.borderRadius,
      borderBottomRightRadius: theme.PlacezBorderStyles.borderRadius,
    },
    width: 80,
    padding: 0.5,
    color: 'text.primary',
    fontSize: 'titleSmall.fontSize',
    fontWeight: '600',
    textTransform: 'capitalize',
    '&.Mui-selected': { background: '#917b98' },
  }),
  toolbarDayViewDate: {
    pl: 2,
    pr: 2,
    mt: 2,
  },
});

export default function CalendarHeader({
  onDateChange,
  onViewChange,
  date,
  view,
  onToggleDrawer,
}: CalendarHeaderProps) {
  const handleCycleTimePeriod = (direction: 'next' | 'previous') => {
    if (direction === 'next') {
      const newDate = add(date, { [timePeriods?.[view]]: 1 });
      onDateChange(newDate);
    } else {
      const newDate = sub(date, { [timePeriods?.[view]]: 1 });
      onDateChange(newDate);
    }
  };

  const handleDatePickerChange = (newDate: Date) => {
    if (newDate) {
      onDateChange(newDate);
    }
  };

  const handleChangeView = (
    _event: React.MouseEvent<HTMLElement>,
    newView: GrazeCalendarView
  ) => {
    if (newView) {
      onViewChange(`${newView}`);
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formattedDayViewDate = format(date, 'EEE, MMMM d, yyyy');

  return (
    <Box>
      <Stack
        sx={styles.container}
        direction="row"
        justifyContent="space-between"
        flex={1}
      >
        <Stack direction="row" alignItems="center">
          <IconButton onClick={onToggleDrawer}>
            <MenuIcon sx={{ color: '#2B2826' }} />
          </IconButton>
          {/* <Typography variant="titleMedium" color="text.primary"> */}
          <Typography
            color="text.primary"
            sx={{ fontWeight: '400', fontSize: '2.125rem', color: '#2B2826' }}
          >
            Calendar
          </Typography>
        </Stack>

        {/** Date Selectors */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <PlacezActionButton
            sx={(theme: Theme) => ({
              minWidth: '60px',
              fontWeight: '700',
              color: theme.palette.text.primary,
            })}
            onClick={handleToday}
          >
            Today
          </PlacezActionButton>
          {/** Previous and Next buttons */}
          <Stack direction="row">
            <IconButton
              sx={{ p: 0 }}
              onClick={() => handleCycleTimePeriod('previous')}
            >
              <PreviousArrowIcon
                sx={{ fontSize: 'titleXL.fontSize', color: '#4A4A4A' }}
              />
            </IconButton>
            <IconButton sx={{ p: 0 }} onClick={() => handleCycleTimePeriod('next')}>
              <NextArrowIcon
                sx={{ fontSize: 'titleXL.fontSize', color: '#4A4A4A' }}
              />
            </IconButton>
          </Stack>
          {/** Date Picker */}
          <PlacezDatePicker
            value={date}
            onChange={handleDatePickerChange}
            format="MMM d yyyy"
            closeOnSelect
          />
        </Stack>

        {/** Controls */}
        <Stack direction="row" spacing={4} alignItems="center">
          {/** Filter, Add, and Settings buttons */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1.5}
          >
            <Tooltip title="Filtering Coming Soon">
              {/** Box is only necessary to fire Tooltip click event while Button is bisabled */}
              <Box>
                <PlacezIconButton disabled>
                  <FilterIcon sx={{ color: '#4A4A4A' }} />
                </PlacezIconButton>
              </Box>
            </Tooltip>
            <Tooltip title="Settings Coming Soon">
              {/** Box is only necessary to fire Tooltip click event while Button is bisabled */}
              <Box sx={{ marginLeft: '0px !important' }}>
                <PlacezIconButton disabled>
                  <Settings sx={{ color: '#4A4A4A' }} />
                </PlacezIconButton>
              </Box>
            </Tooltip>
          </Stack>
          {/** View toggle */}
          <ToggleButtonGroup
            sx={styles.toggleButtonGroup}
            onChange={handleChangeView}
            value={view}
            exclusive
          >
            <ToggleButton sx={styles.toggleButton} value="day">
              Day
            </ToggleButton>
            <ToggleButton sx={styles.toggleButton} value="week">
              Week
            </ToggleButton>
            <ToggleButton sx={styles.toggleButton} value="month">
              Month
            </ToggleButton>
            <ToggleButton sx={styles.toggleButton} value="agenda">
              Agenda
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </Box>
  );
}
