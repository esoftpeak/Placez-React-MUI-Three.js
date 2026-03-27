export type GrazeCalendarView = 'month' | 'week' | 'day' | 'agenda';

export type CalendarProps = {
  events: any[];
  view: GrazeCalendarView;
  setView?: (newView: GrazeCalendarView) => void;
  selectedDate?: Date;
  setSelectedDate?: (newDate: Date) => void;
  onDateChange?: (newDate: Date) => void;
};
