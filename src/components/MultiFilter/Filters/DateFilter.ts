import { Filter, FilterItem } from './Filter';
import { Scene } from '../../../api';
import {
  endOfYesterday,
  isSameMonth,
  isSameYear,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  lastDayOfMonth,
  lastDayOfWeek,
  lastDayOfYear,
  min,
  startOfMonth,
  startOfWeek,
  startOfYear,
  startOfYesterday,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

const filterItems: FilterItem<Scene>[] = [
  {
    id: 1,
    name: 'Today',
    select: (scene) => isToday(new Date(scene.startUtcDateTime)),
    previousRange: (customMonth: Date) => {
      return {
        startDate: startOfYesterday(),
        endDate: endOfYesterday(),
      };
    },
    range: (customMonth: Date) => {
      return {
        startDate: new Date(),
        endDate: new Date(),
      };
    },
  },
  {
    id: 2,
    name: 'This Week',
    select: (scene) => isThisWeek(new Date(scene.startUtcDateTime)),
    range: (customMonth: Date) => {
      return {
        startDate: startOfWeek(new Date()),
        endDate: min([lastDayOfWeek(new Date()), new Date()]),
      };
    },
    previousRange: (customMonth: Date) => {
      return {
        startDate: subWeeks(startOfWeek(new Date()), 1),
        endDate: startOfWeek(new Date()),
      };
    },
  },
  {
    id: 3,
    name: 'This Month',
    select: (scene) => isThisMonth(new Date(scene.startUtcDateTime)),
    range: (customMonth: Date) => {
      return {
        startDate: startOfMonth(new Date()),
        endDate: min([lastDayOfMonth(new Date()), new Date()]),
      };
    },
    previousRange: (customMonth: Date) => {
      return {
        startDate: subMonths(startOfMonth(new Date()), 1),
        endDate: startOfMonth(new Date()),
      };
    },
  },
  {
    id: 4,
    name: 'This Year',
    select: (scene) => isThisYear(new Date(scene.startUtcDateTime)),
    range: (customMonth: Date) => {
      return {
        startDate: startOfYear(new Date()),
        endDate: min([lastDayOfYear(new Date()), new Date()]),
      };
    },
    previousRange: (customMonth: Date) => {
      return {
        startDate: subYears(startOfYear(new Date()), 1),
        endDate: startOfYear(new Date()),
      };
    },
  },
  {
    id: 5,
    name: 'Select Month',
    select: (scene, customMonth: Date) =>
      isSameMonth(new Date(scene.startUtcDateTime), customMonth),
    range: (customMonth: Date) => {
      return {
        startDate: startOfMonth(customMonth),
        endDate: min([lastDayOfMonth(customMonth), new Date()]),
      };
    },
    previousRange: (customMonth: Date) => {
      return {
        startDate: subMonths(customMonth, 1),
        endDate: startOfMonth(customMonth),
      };
    },
  },
  {
    id: 6,
    name: 'Select Year',
    select: (scene, customYear: Date) => {
      return isSameYear(new Date(scene.startUtcDateTime), customYear);
    },
    range: (customMonth: Date) => {
      return {
        startDate: startOfYear(customMonth),
        endDate: min([lastDayOfYear(customMonth), new Date()]),
      };
    },
    previousRange: (customMonth: Date) => {
      return {
        startDate: subYears(customMonth, 1),
        endDate: startOfYear(customMonth),
      };
    },
  },
];

export class DateFilter implements Filter<Scene> {
  name = 'Date';
  items = filterItems;
}
