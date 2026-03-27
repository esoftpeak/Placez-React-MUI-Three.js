import { useCallback, useState } from 'react';
import { Box, CircularProgress, Stack, styled } from '@mui/material';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDrawer } from './CalendarDrawer';
import Calendar from './Calendar/Calendar';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { GrazeCalendarView } from './Calendar/Calendar.types';
import findInSearchableFeilds from '../../sharing/utils/findInSearchableFeilds';
import { getScenes } from '../../reducers/scenes'

const layoutConstants = {
  calendarDrawerWidth: 300,
  bodyHeight: 'calc(100vh - 64px)',
};

const CalendarContainer = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'drawerOpen',
})<{
  drawerOpen: boolean;
}>(({ theme, drawerOpen }) => ({
  /** zIndex higher than CalendarDrawer required to keep all mouse events on Calendar */
  zIndex: 980,
  flexGrow: 1,
  padding: theme.spacing(2),
  overflow: 'hidden',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // marginLeft: `-${layoutConstants.calendarDrawerWidth}px`,
  marginLeft: `-${layoutConstants.calendarDrawerWidth}px`,
  ...(drawerOpen && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

export default function CalendarPage() {
  const [calendarView, setCalendarView] = useState<GrazeCalendarView>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  // const { data: scenesData = [], isLoading: ordersLoading } = useGetAllOrdersQuery({
  //   queryParams: {},
  // });
  const scenes = useSelector(getScenes);
  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((curr) => !curr);
  }, []);

  return (
    <Stack height={layoutConstants.bodyHeight}>
      {scenes === undefined ? (
        <Stack
          sx={{ height: '100%' }}
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <Box flexShrink={1}>
            <CalendarHeader
              view={calendarView}
              date={calendarDate}
              onDateChange={setCalendarDate}
              onViewChange={setCalendarView}
              onToggleDrawer={toggleDrawer}
            />
          </Box>
          <Stack
            direction="row"
            flexGrow={1}
            position="relative"
            overflow="hidden"
          >
            <CalendarDrawer
              open={drawerOpen}
              events={scenes}
              selectedDate={calendarDate}
              onDateChange={setCalendarDate}
            />
            <CalendarContainer drawerOpen={drawerOpen}>
              <Calendar
                events={scenes
                  ?.filter((scene) =>
                    globalFilter
                      ? findInSearchableFeilds(scene, globalFilter)
                      : true
                  )
                  ?.map((scene) => {
                    return {
                      ...scene,
                    };
                  })}
                view={calendarView}
                setView={setCalendarView}
                selectedDate={calendarDate}
                setSelectedDate={setCalendarDate}
                onDateChange={setCalendarDate}
              />
            </CalendarContainer>
          </Stack>
        </>
      )}
    </Stack>
  );
}
