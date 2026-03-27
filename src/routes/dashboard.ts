import { RouteSection } from './Route';

// Icons
import { HomeIcon as DashboardIcon } from '../assets/icons';

// Views
import NewDashboard from '../views/NewDashboard/NewDashboard';

const baseUrl = '/';
export const dashboard: RouteSection = {
  main: {
    path: `${baseUrl}`,
    name: 'Dashboard',
    icon: DashboardIcon,
    component: NewDashboard,
  },
};

export default dashboard;
