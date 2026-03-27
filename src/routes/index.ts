// @ts-nocheck
import { Route, MainRoute, IndexedPathParams } from './Route';

export { clients as clientRoutes } from './clients';
export { scenes as sceneRoutes } from './scenes';
export { places as placeRoutes } from './places';
export { dashboard as dashboardRoutes } from './dashboard';
export { mainRoutes, routes as default } from './routes';
export { settings as settingRoutes } from './settings';
export { payments as paymentRoutes } from './payments';

export type Route = Route;
export type MainRoute = MainRoute;
export type IndexedPathParams = IndexedPathParams;
