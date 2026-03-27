import { useCallback } from 'react';
import { Drawer, Theme } from '@mui/material';

import { CalendarDrawerEventsList } from '../CalendarDrawerEventsList';
import { MiniCalendar } from '../MiniCalendar';

import type { CalendarDrawerProps } from '.';
import { createStyles } from '@mui/styles';
import { layoutConstants } from '../../../Constants/layout';

const styles = createStyles({
  drawer: {
    width: layoutConstants.calendarDrawerWidth,
    flexShrink: 0,
    zIndex: (theme: Theme) => theme.zIndex.drawer - 1,
    '& .MuiDrawer-paper': {
      width: layoutConstants.calendarDrawerWidth,
      boxSizing: 'border-box',
    },
    '& .MuiDrawer-root': {
      position: 'absolute',
    },
    '& .MuiPaper-root': {
      position: 'absolute',
    },
  },
});

export default function CalendarDrawer({
  events,
  selectedDate,
  onDateChange,
  open,
}: CalendarDrawerProps) {

  return (
    <Drawer sx={styles.drawer} variant="persistent" anchor="left" open={open}>
      <MiniCalendar
        events={events}
        selectedDate={selectedDate}
        setSelectedDate={onDateChange}
      />
      <CalendarDrawerEventsList selectedDate={selectedDate} scenes={events} />
    </Drawer>
  );
}
