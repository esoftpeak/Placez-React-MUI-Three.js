import { DateRange } from "../../../sharing/utils/DateHelper"


export interface FilterItem<T> {
  id: number;
  name: string;
  select: (value: T, value2?: Date, value3?: Date) => boolean;
  range?: (value?: Date) => DateRange;
  previousRange?: (value?: Date) => DateRange;
}

export interface Filter<T> {
  name: string;
  items: FilterItem<T>[];
}

export interface FilterMap {
  [filterName: string]: number;
}

export const shouldFilter = <T>(
  filterMap: FilterMap,
  filters: Filter<T>[],
  itemToBeFiltered: T
): boolean => {
  if (!filterMap) {
    return true;
  }
  const keys = Object.keys(filterMap);
  let result = true;
  filters.forEach((filter: Filter<T>) => {
    if (keys.includes(filter.name)) {
      const selectedId = filterMap[filter.name];
      if (
        !(selectedId === undefined) &&
        !filter.items
          .filter((item) => item.id === selectedId)[0]
          .select(
            itemToBeFiltered,
            selectedId === 5
              ? new Date(filterMap?.customMonth)
              : new Date(filterMap?.customYear)
          )
      ) {
        result = false;
      }
    }
  });
  return result;
};

const DATE_FILTER_NAME = 'Date';

const getDefaultDateRange = (): DateRange => {
  const now = new Date();
  return {
    startDate: now,
    endDate: now,
  };
};

const getSelectedDateRange = (
  filterItem: FilterItem<any> | undefined,
  customMonth?: Date
): DateRange => {
  return filterItem?.range(customMonth) || getDefaultDateRange();
};

const getSelectedPreviousDateRange = (
  filterItem: FilterItem<any> | undefined,
  customMonth?: Date
): DateRange => {
  return filterItem?.previousRange(customMonth) || getDefaultDateRange();
};

export const getDateRange = <T>(
  filterMap: FilterMap,
  filters: Filter<T>[],
  items?: T[]
): DateRange => {
  const selectedDateFilter = filterMap[DATE_FILTER_NAME];

  if (!selectedDateFilter || filters.length === 0) {
    return items && items.length > 0
      ? getSortedDateRange(items)
      : getDefaultDateRange();  // Return default range if no items provided
  }

  const selectedFilterItem = filters[0].items.find(
    item => item.id === selectedDateFilter
  );

  // Return the selected range based on the filter, even without items
  return getSelectedDateRange(selectedFilterItem, new Date(filterMap?.customMonth));
};

export const getPreviousRange = <T>(
  filterMap: FilterMap,
  filters: Filter<T>[],
  items?: T[]
): DateRange => {
  const selectedDateFilter = filterMap[DATE_FILTER_NAME];

  if (!selectedDateFilter || filters.length === 0) {
    return items && items.length > 0
      ? getSortedDateRange(items)
      : getDefaultDateRange();  // Return default range if no items provided
  }

  const selectedFilterItem = filters[0].items.find(
    item => item.id === selectedDateFilter
  );

  // Return the previous range based on the filter, even without items
  return getSelectedPreviousDateRange(selectedFilterItem, new Date(filterMap?.customMonth));
};

const getSortedDateRange = <T>(items: T[]): DateRange => {
  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(a['startUtcDateTime']).getTime() -
      new Date(b['startUtcDateTime']).getTime()
  );
  return {
    startDate: new Date(sortedItems[0]['startUtcDateTime']),
    endDate: new Date(),
  };
};
