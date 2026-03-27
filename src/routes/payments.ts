import { RouteSection } from './Route';

// Views
import { Payment } from '@mui/icons-material';
import PaymentsPage from '../views/Payments/PaymentsPage';

const baseUrl = '/payments';
export const payments: RouteSection = {
  main: {
    path: `${baseUrl}`,
    name: 'Payments',
    icon: Payment,
    component: PaymentsPage,
  },
};

export default payments;
