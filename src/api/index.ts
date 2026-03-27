import PlacezApi from './placez/PlacezApi';
import PaymentsApi from './payments/PaymentsApi';

// TODO Migrate API and Models into NPM package
export * from './placez/models';
export * from './placez/selects';

export const placezApi = new PlacezApi(
  import.meta.env.VITE_APP_PLACEZ_API_URL || ''
);
export const paymentApi = new PaymentsApi(
  import.meta.env.VITE_APP_PAYMENTS_API_URL || ''
);
