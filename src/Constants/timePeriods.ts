import { Duration } from 'date-fns';
import { GrazeCalendarView } from '../views/Calendar/Calendar/Calendar';

/**
 * Maps `GrazeCalendarView` options to the corresponding key of the `date-fns` `Duration` type
 */
export const timePeriods: Record<GrazeCalendarView, keyof Duration> = {
  month: 'months',
  week: 'weeks',
  day: 'days',
  agenda: 'months',
};
