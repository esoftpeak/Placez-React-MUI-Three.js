import { SortDescriptor } from '@progress/kendo-data-query';
import { Scene } from '../api';

export const customOrderBy = (data: Scene[], sort: SortDescriptor[]): any[] => {
  if (!sort || !sort.length) return data;

  return [...data].sort((a, b) => {
    for (const sortItem of sort) {
      const field = sortItem.field;
      const dir = sortItem.dir === 'asc' ? 1 : -1;

      //  handling for date field
      if (field === 'date') {
        const dateA = new Date(a[field]).getTime();
        const dateB = new Date(b[field]).getTime();
        if (dateA !== dateB) {
          return (dateA - dateB) * dir;
        }
      } else {
        // Regular string/number comparison for other fields
        if (a[field] < b[field]) return -1 * dir;
        if (a[field] > b[field]) return 1 * dir;
      }
    }
    return 0;
  });
};
