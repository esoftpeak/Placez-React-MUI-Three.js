import SceneStatus from '../selects/SceneStatus';
import Place from './Place';
import PlacezLayoutPlan from './PlacezLayoutPlan';
import PlacezNote from './PlacezNote'

export default interface SceneDetail {
  id: number;
  layouts: PlacezLayoutPlan[];
  name: string;
  estimatedGuestCount: number;
  guaranteedSpend: number;
  placeId?: number;
  status?: SceneStatus;
  clientId?: number;
  contact: string;

  setupStyle?: string;
  categories: number[]; // TODO Recommendation was theme
  manager: string;
  //TODO use Note[]
  notes?: PlacezNote[];
  thumbnailUrl?: string;
  costMultiplier?: number;
  // TODO REMOVE
  place: Place;
  floorPlans?: { id: string; name: string }[];
  startUtcDateTime?: Date;
  endUtcDateTime?: Date;
}
