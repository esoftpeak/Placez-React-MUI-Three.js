import { Route, MainRoute, RouteSection } from './Route';

import dashboard from './dashboard';
import scenes from './scenes';
import assets from './assets';
import clients from './clients';
import places from './places';

import mediaAssets from './mediaAssets';
import catalog from './catalog';
import calendar from './calendar';
import payments from './payments';

const routesToArray = (routes: RouteSection): Route[] => {
  return Object.keys(routes).map((key) => routes[key]);
};

export const mainRoutes: MainRoute[] = [
  dashboard.main as MainRoute,
  calendar.main as MainRoute,
  scenes.main as MainRoute,
  clients.main as MainRoute,
  places.main as MainRoute,
  assets.main as MainRoute,
  payments.main as MainRoute,
];

export const routes: Route[] = [
  ...routesToArray(dashboard),
  ...routesToArray(scenes),
  ...routesToArray(places),
  ...routesToArray(clients),
  ...routesToArray(assets),
  ...routesToArray(calendar),

  ...routesToArray(mediaAssets),
  ...routesToArray(catalog),
  ...routesToArray(payments),
];

export default routes;
