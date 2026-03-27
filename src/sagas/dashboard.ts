import { put, all, takeLatest, race, take, call } from 'redux-saga/effects';
import {
  types as dashboardTypes,
  RefreshMetricsAction,
  UpdateDashboardDateOptionAction,
} from '../reducers/dashboard';
import { SagaReady } from '../reducers/lifecycle';

import { types as sceneTypes } from '../reducers/scenes';
import { types as placeTypes } from '../reducers/place';
import { getTimeDateRange } from '../sharing/utils/DateHelper';

export default function* dashboardSaga() {
  yield all([
    take(sceneTypes.SCENE_API_READY),
    take(placeTypes.PLACE_API_READY),
  ]);
  yield put({ type: dashboardTypes.REFRESH_METRICS_COMPLETE });
  yield all([
    takeLatest(dashboardTypes.REFRESH_METRICS, refreshMetrics),
    takeLatest(
      dashboardTypes.UPDATE_DASHBOARD_DATE_OPTION,
      updateDashboardDateOption
    ),
  ]);
  yield put(SagaReady('dashboard'));
}

function* updateDashboardDateOption(action: UpdateDashboardDateOptionAction) {
  yield put({
    type: dashboardTypes.REFRESH_METRICS,
    range: getTimeDateRange(action.dateOption),
  });
}

function* refreshMetrics(action: RefreshMetricsAction) {
  yield all([
    call(refreshSceneMetrics, action),
    call(refreshPlaceMetrics, action),
  ]);
  yield put({ type: dashboardTypes.REFRESH_METRICS_COMPLETE });
}

function* refreshSceneMetrics(action: RefreshMetricsAction) {
  yield put({ type: sceneTypes.GET_SCENE_METRICS, range: action.range });

  yield race([
    take(sceneTypes.GET_SCENE_METRICS_SUCCESS),
    take(sceneTypes.GET_SCENE_METRICS_FAILURE),
  ]);
}

function* refreshPlaceMetrics(action: RefreshMetricsAction) {
  yield put({
    type: placeTypes.GET_PLACE_METRICS,
    range: action.range,
    takeFirst: 5,
  });
  yield race([
    take(placeTypes.GET_PLACE_METRICS_SUCCESS),
    take(placeTypes.GET_PLACE_METRICS_FAILURE),
  ]);
}
