import { applyMiddleware, compose, Middleware, StoreEnhancer } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Environment } from '../sharing/environment';

export const sagaMiddleware = createSagaMiddleware();

const middlewareChain: Middleware[] = [sagaMiddleware];
if (import.meta.env.VITE_APP_ENVIRONMENT !== Environment.Production) {
  // const loggerMiddleware = createLogger();
  // middlewareChain.push(loggerMiddleware);
}

const actionSanitizer = (action) =>
  action.type === 'GET_ASSETS_SUCCESS' && action.assets
    ? { ...action, assets: '<<ASSET_DATA>>' }
    : action;

const stateSanitizer = (state) =>
  state.asset.bySku
    ? {
        ...state,
        asset: {
          ...state.asset,
          bySku: '<<ASSET_DATA_LARGE>>',
        },
        material: '<<MATERIAL_DATA_LARGE>>',
        attendee: {
          ...state.attendee,
          attendees: '<<ATTENDEE_DATA>>',
        },
      }
    : state;

const composeEnhancers =
  typeof window !== 'undefined' &&
  import.meta.env.VITE_APP_ENVIRONMENT !== Environment.Production &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionSanitizer,
        stateSanitizer,
      })
    : compose;

const enhancer: StoreEnhancer = composeEnhancers(
  applyMiddleware(...middlewareChain)
);

export default enhancer;
