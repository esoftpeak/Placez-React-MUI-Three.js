import { Scene } from '../../../api';

export type CalendarDrawerProps = {
  events: Scene[];
  open: boolean;
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
};
