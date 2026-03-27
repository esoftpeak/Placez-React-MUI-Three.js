// @ts-nocheck
// ^^ due to OIDCProvider will be removed with 0Auth release
import React from 'react';
import ReactDOM from 'react-dom/client';

// Theming
import '@progress/kendo-theme-material/dist/all.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-toastify/dist/ReactToastify.min.css';

// Redux
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducers';
import enhancer, { sagaMiddleware } from './enhancers';
import sagas from './sagas';

// Authenticate
import { OidcProvider, loadUser } from 'redux-oidc';
import userManager from './auth/userManager';

// Logging
import {
  ApplicationInsights,
  ITelemetryItem,
  DistributedTracingModes,
} from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

import App from './App';

declare global {
  interface Window {
    env: any;
  }
}

if (import.meta.env.VITE_APP_INSIGHTS_ENABLED === 'true') {
  const browserHistory = createBrowserHistory({ basename: '' });
  const reactPlugin = new ReactPlugin();
  const appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: import.meta.env.VITE_APP_INSIGHTS_KEY,
      enableAutoRouteTracking: true,
      distributedTracingMode: DistributedTracingModes.W3C,
      disableFetchTracking: false,
      enableRequestHeaderTracking: true,
      enableCorsCorrelation: true,
      extensions: [reactPlugin],
      extensionConfig: {
        [reactPlugin.identifier]: { history: browserHistory },
      },
    },
  });
  appInsights.loadAppInsights();
  appInsights.trackPageView();
  appInsights.addTelemetryInitializer((item: ITelemetryItem) => {
    item.tags['ai.cloud.role'] = 'Placez-UI';
    item.tags['ai.cloud.roleInstance'] = 'Placez-UI-Client';
  });
}

export const store = createStore(reducer, enhancer);

loadUser(store, userManager);
sagaMiddleware.run(sagas);

userManager.events.addSilentRenewError((error) => {
  const loggedOut = error.message === 'login_required';
  if (loggedOut) {
    const event = new Event('loggedOut');
    window.dispatchEvent(event);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <OidcProvider store={store} userManager={userManager}>
      <App />
    </OidcProvider>
  </Provider>
);

if(import.meta.hot) {
  import.meta.hot.accept();
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready
    .then((registration) => {
      registration.unregister();
    })
    .catch((error) => {
      console.error(error.message);
    });
}
