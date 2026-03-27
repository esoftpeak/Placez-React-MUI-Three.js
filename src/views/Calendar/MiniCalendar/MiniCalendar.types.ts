import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Scene } from '../../../api';

export type MiniCalendarDayProps = PickersDayProps<Date> & {
  events?: Scene[];
  selectedDate?: Date;
};

export type MiniCalendarProps = {
  events: Scene[];
  selectedDate: Date;
  setSelectedDate: (newDate: Date | null) => void;
};
