import { useMemo } from 'react';
import { Stack, Theme, Typography, useTheme } from '@mui/material';

import { sceneStatuses } from '../../../api';
import SceneStatus from '../../../api/placez/selects/SceneStatus';
import { createStyles, makeStyles } from '@mui/styles';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../../components/Hooks/useLocalStorageState';
import { useNavigate } from 'react-router';
import { sceneRoutes } from '../../../routes';
import { MonthEventProps } from './MonthEvent.types';
import { format } from 'date-fns';


const styles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      paddingX: 1,
      paddingY: 0.5,
      borderLeft: 2,
      borderRadius: '0 5px 5px 0',
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
  })
);1

export default function MonthEvent(monthEvent: MonthEventProps) {
  const scene = monthEvent.event;
  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );
  const theme = useTheme();

  const startTime = useMemo(
    // () => reformatUtcToLocal(event.requestedDateTime, "isoDateTime", "twelveHourTime"),
    // () => format(scene?.startUtcDateTime, twentyFourHourTime ? "H:mm" : "h:mm A"),
    () => {
      const time = format(new Date(scene?.startUtcDateTime), 'MMM');
      return time;
    },
    [scene]
  );
  const statusColor =
    sceneStatuses?.[SceneStatus?.[scene?.status]]?.color ??
    theme.palette.primary.main;
  const navigate = useNavigate();

  const handleSceneClick = () => {
    navigate(sceneRoutes.edit.path.replace(':id', scene.id.toString()));
  };

  const classes = styles(monthEvent);

  return (
    <Stack
      direction="row"
      spacing={1}
      className={classes.container}
      style={{borderLeftColor: statusColor }}
      data-testid="calendar-month-event"
      onClick={() => handleSceneClick()}
    >
      <Typography color="text.disabled">{startTime}</Typography>
      <Typography color={statusColor}>{scene?.name}</Typography>
    </Stack>
  );
}
