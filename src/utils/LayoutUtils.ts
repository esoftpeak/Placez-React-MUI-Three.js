import { differenceInHours } from 'date-fns'
import { PlacezLayoutPlan } from '../api';

export const getLayoutDurationInHours = (layout: PlacezLayoutPlan): number => {
  const duration = differenceInHours(layout.endUtcDateTime, layout.startUtcDateTime) ;
  return duration > 1 ? duration : 1;
};
