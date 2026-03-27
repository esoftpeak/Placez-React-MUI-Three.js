import { all, takeLatest, put, call } from 'redux-saga/effects';
import { SagaReady } from '../reducers/lifecycle';

import {
  types,
  GetPlacesAction,
  CreatePlaceAction,
  UpdatePlaceAction,
  DeletePlaceAction,
  GetPlaceMetricsAction,
} from '../reducers/place';
import { CreateFloorPlan } from '../reducers/floorPlans';
import { types as uiTypes } from '../reducers/ui';

// Api
import { placezApi, MetricReport } from '../api';
import { getTimeDateRange, TimeRangeOption } from '../sharing/utils/DateHelper';
import {
  defaultFloorplan,
  defaultCorners,
  defaultWalls,
} from '../blue/DefaultFloorplan';
import { placeRoutes } from '../routes';

export default function* placeSaga() {
  yield all([
    takeLatest(types.GET_PLACES, getPlaces),
    takeLatest(types.GET_PLACE_METRICS, getPlaceMetrics),
    takeLatest(types.CREATE_PLACE, createPlace),
    takeLatest(types.UPDATE_PLACE, updatePlace),
    takeLatest(types.DELETE_PLACE, deletePlace),
  ]);
  yield put({ type: types.PLACE_API_READY });
  yield put({ type: types.GET_PLACES });
  yield put(SagaReady('place'));
}

function* getPlaces(action: GetPlacesAction) {
  try {
    const response = yield call(placezApi.getPlaces);
    yield put({ type: types.GET_PLACES_SUCCESS, places: response.parsedBody });
  } catch (error) {
    yield put({ type: types.GET_PLACES_FAILURE, error });
  }
}

function* createPlace(action: CreatePlaceAction) {
  try {
    const { place } = action;
    const response = yield call(placezApi.postPlace, place);

    const newFloorPlan = {
      ...defaultFloorplan,
      name: 'Floorplan Default',
      corners: defaultCorners,
      walls: defaultWalls,
      fixtures: [],
      sceneScans: [],
      placeId: Number(place.id),
      price: 1,
      priceRateInHours: 24,
    };
    newFloorPlan.isFromNewEvent = true;
    newFloorPlan.placeId = response.parsedBody.id;

    // This is temporary
    yield put(CreateFloorPlan(newFloorPlan, place.id));

    yield put({ type: types.CREATE_PLACE_SUCCESS, place: response.parsedBody });
    // yield put({ type: uiTypes.NAVIGATE, target: placeRoutes.edit.path.replace(':id', response.parsedBody.id) });
  } catch (error) {
    yield put({ type: types.CREATE_PLACE_FAILURE, error });
  }
}

function* updatePlace(action: UpdatePlaceAction) {
  try {
    const { place } = action;
    const response = yield call(placezApi.putPlace, place);
    yield put({ type: types.UPDATE_PLACE_SUCCESS, place: response.parsedBody });
  } catch (error) {
    yield put({ type: types.UPDATE_PLACE_FAILURE, error });
  }
}

function* deletePlace(action: DeletePlaceAction) {
  try {
    const { placeId } = action;
    const response = yield call(placezApi.deletePlace, placeId);
    yield put({ type: types.DELETE_PLACE_SUCCESS, placeId });
    yield put({ type: uiTypes.NAVIGATE, target: placeRoutes.main.path });
  } catch (error) {
    yield put({ type: types.DELETE_PLACE_FAILURE, error });
  }
}

function* getPlaceMetrics(action: GetPlaceMetricsAction) {
  try {
    const range = action.range
      ? action.range
      : getTimeDateRange(TimeRangeOption.ThisWeek);
    const response = yield call(
      placezApi.getPlaceMetrics,
      range.startDate,
      range.endDate,
      action.takeFirst
    );
    yield put({
      type: types.GET_PLACE_METRICS_SUCCESS,
      metrics: response.parsedBody as MetricReport,
    });
  } catch (error) {
    yield put({ type: types.GET_PLACE_METRICS_FAILURE, error });
  }
}
