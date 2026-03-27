import { useMemo, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Stack,
  Box,
  Theme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { CalendarDrawerEventsListProps } from '.';
import { useDispatch } from 'react-redux';
import { SelectScene } from '../../../reducers/scenes';
import { sceneStatuses } from '../../../api';
import SceneStatus from '../../../api/placez/selects/SceneStatus';
import { createStyles } from '@mui/styles';
import { format, isSameDay } from 'date-fns';
import { formatTime } from '../../../Constants/timeFormat';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../../components/Hooks/useLocalStorageState';

const styles = createStyles({
  header: (theme: Theme) => ({
    padding: 1,
    textAlign: 'center',
    backgroundColor: theme.palette.background.shadow,
  }),
  list: {
    overflowY: 'auto',
  },
  listItem: {
    paddingRight: 0,
    paddingLeft: 1,
  },
  listItemButton: {
    borderLeft: 2,
  },
  eventTitle: {
    fontWeight: 'medium',
  },
});

export default function CalendarDrawerEventsList({
  scenes,
  selectedDate,
}: CalendarDrawerEventsListProps) {
  const navigate = useNavigate();

  const selectedDayEvents = useMemo(() => {
    return scenes.filter((event) =>
      isSameDay(new Date(event.startUtcDateTime), selectedDate)
    );
  }, [scenes, selectedDate]);

  const handleOrderClick = useCallback(
    (id: number) => navigate(`/orders/${id}`),
    []
  );
  const dispatch = useDispatch();

  const handleSceneClick = useCallback((id: number) => {
    dispatch(SelectScene(id));
    navigate(`Events/${id}/EventDetails`);
  }, []);
  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );

  return (
    <Stack overflow="auto">
      <Box sx={styles.header}>
        {/* <Typography variant="titleSmall" fontWeight="bold"> */}
        <Typography fontWeight="bold">
          {/** Formats date like "Wed Jun 1st 2023" */}
          {format(selectedDate, 'EEE MMM d yyyy')}
        </Typography>
      </Box>
      <List sx={styles.list} disablePadding>
        {selectedDayEvents?.map((ea) => (
          <ListItem key={ea.id} divider sx={styles.listItem}>
            <ListItemButton
              sx={[
                styles.listItemButton,
                {
                  borderColor:
                    sceneStatuses?.[SceneStatus?.[ea?.status]]?.color,
                },
              ]}
              onClick={() => handleSceneClick(ea.id)}
            >
              <ListItemText
                primaryTypographyProps={{ sx: styles.eventTitle }}
                primary={ea.name}
              />
              <Stack alignItems="flex-end">
                <Typography color="text.secondary">
                  {format(
                    new Date(ea.startUtcDateTime),
                    formatTime(twentyFourHourTime)
                  )}
                </Typography>
                <Typography color="text.disabled">
                  {format(
                    new Date(ea.endUtcDateTime),
                    formatTime(twentyFourHourTime)
                  )}
                </Typography>
              </Stack>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
