import { RouteSection } from './Route';

// Icons
import { PlacezLibraryIcon } from '../assets/icons';

// Views
import PlacePlanner from '../views/PlaceLibrary/PlacePlanner';
import VenueDetails from '../views/PlaceLibrary/VenueDetails';
import Venues from '../views/PlaceLibrary/VenuesPage/index';

const baseUrl = '/places';
export const places: RouteSection = {
  main: {
    path: `${baseUrl}`,
    name: 'Venues',
    icon: PlacezLibraryIcon,
    component: Venues,
  },
  edit: {
    path: `${baseUrl}/:id/VenueDetails`,
    name: 'Place Edit',
    component: VenueDetails,
  },
  editFloorPlan: {
    path: `${baseUrl}/:id/floorplan/:floorPlanId`,
    name: 'Place Planner',
    component: PlacePlanner,
  },
  newFloorPlan: {
    path: `${baseUrl}/:id/floorplan`,
    name: 'Place Planner',
    component: PlacePlanner,
  },
};

export default places;
