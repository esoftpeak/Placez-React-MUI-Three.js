import { RouteSection } from './Route';

// Views
import ClientsPage from '../views/Clients/index';
import { PersonOutline } from '@mui/icons-material';

const baseUrl = '/clients';
export const clients: RouteSection = {
  main: {
    path: `${baseUrl}`,
    name: 'Client List',
    icon: PersonOutline,
    component: ClientsPage,
  },
};

export default clients;
