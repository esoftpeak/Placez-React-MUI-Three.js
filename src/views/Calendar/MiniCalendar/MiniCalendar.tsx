import { Badge, Theme } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

import type { MiniCalendarDayProps, MiniCalendarProps } from '.';
import { createStyles, makeStyles } from '@mui/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isSameDay, isSameMonth } from 'date-fns';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    badge: {
      /** Badge Dot */
      '& .MuiBadge-badge': {
        backgroundColor: '#ccc',
        bottom: 5,
        right: '50%',
      },
      '& .MuiPickersDay-root': {
        width: 28,
        height: 28,
        marginInline: '6px',
      },
    },
    dateCalendar: {
      width: '300px',
      height: '240px !important',
      /** Header */
      '& .MuiDateCalendar-root': {
        height: '240px',
        maxHeight: '240px',
      },
      '& .MuiPickersCalendarHeader-root': {
        padding: 0,
        marginTop: 1,
        marginBottom: 0,
        paddingLeft: 1,
        color: theme.palette.primary.main,
      },
      /** Header Icons */
      '& .MuiSvgIcon-root': {
        color: theme.palette.primary.main,
      },
      /** Month Container */
      '& .MuiDayCalendar-monthContainer': {
        borderY: 1,
        borderColor: '#ccc',
        borderTopColor: 'transparent',
      },
      /** Required so that calendar doesn't scroll */
      '& .MuiPickersSlideTransition-root': {
        minHeight: '160px',
      },
      /** Week Row Container */
      '& .MuiDayCalendar-weekContainer': {
        margin: 0,
        borderTop: 1,
        borderColor: '#ccc',
      },
      /** Day Container */
      '& .MuiBadge-root': {
        paddingTop: 0.25,
        paddingBottom: 1.5,
      },
      /** Day Button */
      '& .MuiButtonBase-root': {
        '&.Mui-selected': {
          color: theme.palette.background.paper,
        },
        '&.MuiPickersDay-today': {
          borderColor: theme.palette.primary.main,
        },
      },
    },
  })
);

function MiniCalendarDay({
  selectedDate,
  events,
  day,
  ...restProps
}: MiniCalendarDayProps) {
  const hasEvent = events?.some((event) => {
    return isSameDay(new Date(event.startUtcDateTime), day);
  });
  const isCurrMonth = selectedDate ? isSameMonth(selectedDate, day) : false;
  const classes = styles();

  return (
    <Badge
      key={day.toString()}
      invisible={!hasEvent}
      variant="dot"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      className={classes.badge}
    >
      <PickersDay
        {...(restProps as any)}
        day={day}
        sx={{ color: isCurrMonth ? 'text.primary' : 'text.disabled' }}
      />
    </Badge>
  );
}

export default function MiniCalendar({
  events,
  selectedDate,
  setSelectedDate,
}: MiniCalendarProps) {
  const classes = styles();

  // Handle date selection changes
  const handleDateChange = (newDate: Date | null) => {
    if (newDate && !isSameDay(newDate, selectedDate)) {
      setSelectedDate(newDate);
    }
  };

  // Handle month change specifically
  const handleMonthChange = (newDate: Date | null) => {
    if (newDate && !isSameMonth(newDate, selectedDate)) {
      setSelectedDate(newDate);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateCalendar
        value={selectedDate}
        views={['year', 'month', 'day']}
        showDaysOutsideCurrentMonth
        slots={{
          day: MiniCalendarDay,
        }}
        slotProps={{
          day: {
            events,
            selectedDate,
          } as any,
        }}
        onChange={handleDateChange}
        onMonthChange={handleMonthChange}
        className={classes.dateCalendar}
      />
    </LocalizationProvider>
  );
}
