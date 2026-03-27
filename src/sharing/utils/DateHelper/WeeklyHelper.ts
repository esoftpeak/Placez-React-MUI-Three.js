import { DateRange } from './DateRange';
import { TimeRangeOption } from './FriendlyDateRanges';

const date = new Date();

const lastWeek = (): DateRange => {
  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(date.getDate() - date.getDay() - 6);
  endDate.setDate(date.getDate() - date.getDay() + 1);
  return {
    startDate,
    endDate,
  };
};

const thisWeek = (): DateRange => {
  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(date.getDate() - date.getDay() + 1);
  endDate.setDate(date.getDate() - date.getDay() + 8);
  return {
    startDate,
    endDate,
  };
};

const nextWeek = (): DateRange => {
  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(date.getDate() - date.getDay() + 8);
  endDate.setDate(date.getDate() - date.getDay() + 15);
  return {
    startDate,
    endDate,
  };
};

const allWeeks = (): DateRange => {
  const startDate = new Date(0);
  startDate.setFullYear(2019);
  const endDate = new Date();
  endDate.setDate(date.getDate());
  return {
    startDate,
    endDate,
  };
};

const lastMonth = (): DateRange => {
  const startDate = new Date();
  const endDate = new Date();

  startDate.setMonth(date.getMonth() - 1);
  startDate.setDate(0);

  endDate.setDate(0);
  return {
    startDate,
    endDate,
  };
};

const thisMonth = (): DateRange => {
  const startDate = new Date();
  const endDate = new Date();

  startDate.setDate(0);

  endDate.setMonth(date.getMonth() + 1);
  endDate.setDate(0);
  return {
    startDate,
    endDate,
  };
};

const nextMonth = (): DateRange => {
  const startDate = new Date();
  const endDate = new Date();

  startDate.setMonth(date.getMonth() + 1);
  startDate.setDate(0);

  endDate.setMonth(date.getMonth() + 2);
  endDate.setDate(0);
  return {
    startDate,
    endDate,
  };
};

export function getTimeDateRange(option: TimeRangeOption): DateRange {
  switch (option) {
    case TimeRangeOption.LastWeek:
      return lastWeek();
    case TimeRangeOption.ThisWeek:
      return thisWeek();
    case TimeRangeOption.NextWeek:
      return nextWeek();
    case TimeRangeOption.AllTime:
      return allWeeks();
    case TimeRangeOption.LastMonth:
      return lastMonth();
    case TimeRangeOption.ThisMonth:
      return thisMonth();
    case TimeRangeOption.NextMonth:
      return nextMonth();
    default:
      return thisWeek();
  }
}
