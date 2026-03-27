import {
  TimeRangeOption,
  DateRange,
  getTimeDateRange,
} from '../../sharing/utils/DateHelper';

interface RangeFilterOption {
  value: TimeRangeOption;
  label: string;
  range: DateRange;
}

export const dashboardTimeRangeOptions: RangeFilterOption[] = [
  {
    value: TimeRangeOption.LastWeek,
    label: 'Last Week',
    range: getTimeDateRange(TimeRangeOption.LastWeek),
  },
  {
    value: TimeRangeOption.ThisWeek,
    label: 'This Week',
    range: getTimeDateRange(TimeRangeOption.ThisWeek),
  },
  {
    value: TimeRangeOption.NextWeek,
    label: 'Next Week',
    range: getTimeDateRange(TimeRangeOption.NextWeek),
  },
  {
    value: TimeRangeOption.LastMonth,
    label: 'Last Month',
    range: getTimeDateRange(TimeRangeOption.LastMonth),
  },
  {
    value: TimeRangeOption.ThisMonth,
    label: 'This Month',
    range: getTimeDateRange(TimeRangeOption.ThisMonth),
  },
  {
    value: TimeRangeOption.NextMonth,
    label: 'Next Month',
    range: getTimeDateRange(TimeRangeOption.NextMonth),
  },
  {
    value: TimeRangeOption.AllTime,
    label: 'All Time',
    range: getTimeDateRange(TimeRangeOption.AllTime),
  },
];
