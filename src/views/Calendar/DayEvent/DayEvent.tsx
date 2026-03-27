import { useMemo } from 'react';
import { Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import type { DayEventProps } from '.';
import { sceneStatuses } from '../../../api';
import SceneStatus from '../../../api/placez/selects/SceneStatus';
import { createStyles } from '@mui/styles';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../../components/Hooks/useLocalStorageState';
import { sceneRoutes } from '../../../routes';
import { format } from 'date-fns';

const styles = createStyles({
  container: {
    paddingX: 1,
    alignItems: 'center',
    borderLeft: 3,
    borderRadius: '0 5px 5px 0',
    '&:hover': {
      backgroundColor: 'grey.100',
    },
  },
});

export default function DayEvent(dayEvent: DayEventProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const scene = dayEvent.event;
  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );
  const formattedTime = useMemo(() => {
    const startTime = format(
      new Date(scene.startUtcDateTime),
      twentyFourHourTime ? 'H:mm' : 'h:mm a'
    );
    const endTime = format(
      new Date(scene.endUtcDateTime),
      twentyFourHourTime ? 'H:mm' : 'h:mm a'
    );

    return `${startTime} - ${endTime}`;
  }, [scene]);

  const statusColor =
    sceneStatuses?.[SceneStatus?.[scene?.status]]?.color ??
    theme?.palette?.primary?.main;

  const handleSceneClick = () => {
    navigate(sceneRoutes.edit.path.replace(':id', scene.id.toString()));
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={[styles.container, { borderLeftColor: statusColor }]}
      data-testid="calendar-day-event"
      onClick={() => handleSceneClick()}
    >
      {/* <Typography variant="titleSmall" color={statusColor}> */}
      <Typography color={statusColor}>{scene?.name}</Typography>
      {/* <Typography variant="titleXS">{formattedTime}</Typography> */}
      <Typography>{formattedTime}</Typography>
    </Stack>
  );
}
