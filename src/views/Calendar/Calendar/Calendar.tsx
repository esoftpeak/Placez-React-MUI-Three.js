import { Typography, styled } from '@mui/material';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enUS from 'date-fns/locale/en-US';
import {
  Calendar as ReactBigCalendar,
  dateFnsLocalizer,
} from 'react-big-calendar';
import { useNavigate } from 'react-router-dom';

import { DayEvent } from '../DayEvent';
import { MonthEvent } from '../MonthEvent';
import { WeekEvent } from '../WeekEvent';

import type { CalendarProps } from '.';
import { Scene } from '../../../api';
import { sceneRoutes } from '../../../routes';
import { BorderBottom, Height } from '@mui/icons-material'

export type GrazeCalendarView = 'month' | 'week' | 'day' | 'agenda';

// const { parseUtcToLocal } = DateService;

function AgendaEvent(agendaEvent: { event: Scene }) {
  const navigate = useNavigate();
  const scene = agendaEvent.event;
  const handleSceneClick = () => {
    navigate(sceneRoutes.edit.path.replace(':id', scene.id.toString()));
  };
  return (
    <Typography
      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
      onClick={() => handleSceneClick()}
    >
      {scene.name}
    </Typography>
  );
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const StyledCalendar = styled(ReactBigCalendar)(({ theme }) => ({
  /** Day of Week header */
  '& .rbc-header': {
    color: theme.palette.text.disabled,
    textTransform: 'uppercase',
    fontWeight: 'normal',
    paddingTop: '10px'
  },
  '& .rbc-month-header': {
    height: '39.67px',
  },
  '& .rbc-allday-cell': {
    display: 'none',
  },
  '& .rbc-time-slot': {
    border: 'none !important',
  },
  '& .rbc-time-header': {
    '& .rbc-header': {
      color: theme.palette.text.disabled,
      textTransform: 'uppercase',
      fontWeight: 'normal',
      BorderBottom: 'none !important',
    },
    border: 'none !important',
  },
  /** Today square of Month View */
  '& .rbc-today': {
    backgroundColor: theme.palette.background.paper,
  },
  '& .rbc-current .rbc-button-link': {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  /** Event */
  '& .rbc-event': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.shadow,
    border: 'none',
    '&:focus': {
      outline: 'none',
      backgroundColor: 'transparent',
    },
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  '& .rbc-event-content': {
  },
  /** Time of Event in Week and Day View */
  '& .rbc-event-label': {
    display: 'none',
  },
  /** "+ ...more" button in Month View */
  '& .rbc-show-more': {
    color: theme.palette.text.disabled,
    fontWeight: 'normal',
    marginTop: 10,
    marginLeft: 5,
    '&:hover': {
      color: theme.palette.background.shadow,
    },
  },
  // ** Agenda View */
  '& .rbc-agenda-view': {
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: '3px',
    overflow: 'auto',
    '& table.rbc-agenda-table': {
      border: 'none',
      'thead > tr > th': {
        padding: '20px 30px 5px',
        borderRight: '1px solid #ddd',
        borderBottom: 'none',
      },
      'tbody > tr > td': {
        padding: '20px 30px',
      },
      'tbody > tr': {
        borderTop: 'none',
        borderBottom: 'none',
      },
      '.rbc-agenda-time-cell': {
        borderLeft: '1px solid #ddd',
      },
    },
  },

  '& .rbc-day-bg': {
    backgroundColor: `${theme.palette.background.paper}`,
  },
  '& .rbc-off-range-bg': {
    backgroundColor: `${theme.palette.background.default}`,
  },
}));

export default function Calendar({
  events,
  view,
  setView,
  selectedDate,
  setSelectedDate,
  onDateChange,
}: CalendarProps) {
  const handleOnShowMore = (_events: any, date: Date) => {
    setSelectedDate(date);
    setView('day');
  };

  return (
    <StyledCalendar
      localizer={localizer}
      events={events}
      view={view}
      date={selectedDate}
      // startAccessor={(scene: Scene) => parseUtcToLocal(scene.startUtcDateTime, "isoDateTime")}
      // endAccessor={(scene: Scene) => parseUtcToLocal(scene.endUtcDateTime, "isoDateTime")}
      startAccessor={(scene: Scene) => new Date(scene.startUtcDateTime)}
      endAccessor={(scene: Scene) => new Date(scene.endUtcDateTime)}
      titleAccessor="name"
      components={{
        month: { event: MonthEvent },
        day: { event: DayEvent },
        week: { event: WeekEvent },
        agenda: { event: AgendaEvent },
      }}
      style={{ height: '100%' }}
      toolbar={false}
      onNavigate={onDateChange}
      onView={() => { }}
      onShowMore={handleOnShowMore}
    />
  );
}
