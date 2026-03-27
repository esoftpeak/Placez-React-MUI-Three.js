import { all, take, call, fork, put, spawn, select } from 'redux-saga/effects';
import scene from './scene';
import lifecyle from './lifecycle';
import place from './place';
import client from './client';
import settings from './settings';
import dashboard from './dashboard';
import designer from './designer';
import globalState from './globalstate';
import layout from './layout';
import floorPlan from './floorPlan';
import asset from './asset';
import attendee from './attendee';
import chat from './chat';
import blue from './blue';
import material from './material';
import undoRedo from './undoRedo';
import label from './label';
import payment from './payment';
import ui from './ui';
import { USER_FOUND } from 'redux-oidc';
import { ReduxState } from '../reducers/index';
import {
  types as dashboardTypes,
  SetLocations,
  RefreshMetrics,
} from '../reducers/dashboard';
import { GetScenes } from '../reducers/scenes';
import { GetPlaces } from '../reducers/place';
import { userLocations } from '../sharing/utils/userHelpers';
import { ChangeLicenseTypeState, LicenseType } from '../reducers/globalState';

export default function* rootSaga() {
  yield take(USER_FOUND);
  yield call(setLicense);
  yield call(setLocations);
  yield call(loggedIn);

  while (true) {
    yield take(dashboardTypes.SET_CURRENT_LOCATION);

    yield all([put(GetScenes()), put(GetPlaces()), put(RefreshMetrics())]);
  }
}

export const sagas = {
  lifecyle,
  scene,
  place,
  client,
  dashboard,
  settings,
  designer,
  globalState,
  layout,
  floorPlan,
  asset,
  attendee,
  chat,
  blue,
  material,
  undoRedo,
  label,
  payment,
  ui,
};

export function* loggedIn() {
  yield all(
    Object.keys(sagas).map((key) =>
      spawn(function* () {
        while (true) {
          try {
            yield call(sagas[key]);
            break;
          } catch (e) {
            console.error(e);
          }
        }
      })
    )
  );
}

export function takeFirst(pattern: any, saga: any, ...args: any[]) {
  return fork(function* () {
    while (true) {
      const action = yield take(pattern);
      try {
        yield call(saga, ...args.concat(action));
      } catch (e) {
        console.error(e);
      }
    }
  });
}

const setLocations = function* () {
  const user = yield select((state: ReduxState) => state.oidc.user);
  const locations = userLocations(user);
  yield put(SetLocations(locations));
};

const setLicense = function* () {
  const user = yield select((state: ReduxState) => state.oidc.user);
  if (user.profile) {
    if (user.profile.subscription_plan_name === '') {
      yield put(ChangeLicenseTypeState(LicenseType.PlacezPro));
    } else {
      yield put(ChangeLicenseTypeState(user.profile.subscription_plan_name));
    }
  }
};
