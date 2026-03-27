import { RouteSection } from './Route';

// Views
import Scenes from '../views/Scene/EventPage';
import LayoutPlanner from '../views/Scene/LayoutPlanner';
import EventDetails from '../views/Scene/EventDetails';
import { EventsIcon } from '../assets/icons'

const baseUrl = '/Events';

export const scenes: RouteSection = {
  main: {
    path: `${baseUrl}`,
    name: 'Events',
    component: Scenes,
    icon: EventsIcon,
  },
  edit: {
    path: `${baseUrl}/:id/EventDetails`,
    name: 'Edit Scene',
    component: EventDetails,
  },
  planner: {
    path: `${baseUrl}/:id/planner/:planId`,
    name: 'Scene Planner',
    component: LayoutPlanner,
  },
};

export default scenes;
