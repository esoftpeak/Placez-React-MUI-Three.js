import { PlacezLayoutPlan } from '../api';

//TODO build from layouts time range
export const computeSceneDuration = (layouts: PlacezLayoutPlan[]): number => {
  const sceneDuration = layouts?.reduce(
    (acc, layout) => {
      if (acc.startUtcDateTime < layout.startUtcDateTime) {
        acc.startUtcDateTime = layout.startUtcDateTime;
      }
      return acc;
    },
    { startUtcDateTime: new Date(), endUtcDateTime: new Date() }
  );

  const start = new Date(sceneDuration?.startUtcDateTime).getTime();
  const end = new Date(sceneDuration?.endUtcDateTime).getTime();
  const duration = Math.ceil(Math.round((end - start) / (1000 * 60) / 15) / 4);
  return duration;
};
