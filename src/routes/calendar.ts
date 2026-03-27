import { RouteSection } from './Route';

// Icons

// Views
import CalendarPage from '../views/Calendar/CalendarPage';
import { CalendarIcon } from '@mui/x-date-pickers';

const baseUrl = '/calendar';
export const calendar: RouteSection = {
  main: {
    path: `${baseUrl}`,
    name: 'Calendar',
    icon: CalendarIcon,
    component: CalendarPage,
  },
};

export default calendar;
