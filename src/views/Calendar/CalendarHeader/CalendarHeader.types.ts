import { GrazeCalendarView } from '../Calendar';

export type CalendarHeaderProps = {
  view: GrazeCalendarView;
  onViewChange: (view: GrazeCalendarView) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  onToggleDrawer: () => void;
};
