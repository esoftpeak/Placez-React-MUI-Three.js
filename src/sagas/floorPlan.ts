import { all, takeLatest, put, call, select } from 'redux-saga/effects';
import {
  types,
  GetFloorPlansAction,
  CreateFloorPlanAction,
  UpdateFloorPlanAction,
  DeleteFloorPlanAction,
  UpdatePhotospheres,
  UpdatePhotosphere,
  UpdateFloorPlanSuccessAction,
} from '../reducers/floorPlans';
import { SagaReady } from '../reducers/lifecycle';

import { getFloorPlan, SetFloorPlan } from '../reducers/designer';

// Api
import { placezApi } from '../api';
import { Photosphere } from '../components/Blue/models/Photosphere';
import PlacezFixturePlan from '../api/placez/models/PlacezFixturePlan';

import { NeedSaveAction, SavingAction } from '../reducers/blue';
import { types as uiTypes, ToastMessage } from '../reducers/ui';
import { placeRoutes } from '../routes';

export default function* floorPlanSaga() {
  yield all([
    takeLatest(types.GET_FLOOR_PLANS, getFloorPlans),
    takeLatest(types.CREATE_FLOOR_PLAN, createFloorPlan),
    takeLatest(types.COPY_FLOOR_PLAN, copyFloorPlan),
    takeLatest(types.UPDATE_FLOOR_PLAN, updateFloorPlan),
    takeLatest(types.DELETE_FLOOR_PLAN, deleteFloorPlan),
    takeLatest(types.UPDATE_PHOTOSPHERES, updatePhotospheres),
    takeLatest(types.UPDATE_PHOTOSPHERE, updatePhotosphere),
    takeLatest(types.UPDATE_FLOOR_PLAN_SUCCESS, updateFloorPlanSuccess),
  ]);
  yield put(SagaReady('floorPlan'));
}

function* getFloorPlans(action: GetFloorPlansAction) {
  const { placeId } = action;
  try {
    if (placeId) {
      const response = yield call(placezApi.getPlaceFloorPlans, placeId);
      yield put({
        type: types.GET_FLOOR_PLANS_SUCCESS,
        floorPlans: response.parsedBody,
      });
    } else {
      const response = yield call(placezApi.getFloorPlans);
      yield put({
        type: types.GET_FLOOR_PLANS_SUCCESS,
        floorPlans: response.parsedBody,
      });
    }
  } catch (error) {
    yield put({ type: types.GET_FLOOR_PLANS_FAILURE, error });
  }
}

function* createFloorPlan(action: CreateFloorPlanAction) {
  try {
    const { floorPlan, newIdRef } = action;
    const response = yield call(placezApi.postFloorPlan, floorPlan);
    yield put({ type: types.GET_FLOOR_PLANS, placeId: newIdRef });
    if (floorPlan?.isFromNewEvent) {
      yield put({
        type: uiTypes.NAVIGATE,
        target: placeRoutes.editFloorPlan.path
          .replace(':id', floorPlan?.placeId?.toString() || '')
          .replace(':floorPlanId', response.parsedBody.id || ''),
      });
    } else {
      yield put({
        type: types.CREATE_FLOOR_PLAN_SUCCESS,
        floorPlan: response.parsedBody,
      });
    }
  } catch (error) {
    yield put({ type: types.CREATE_FLOOR_PLAN_FAILURE, error });
  }
}

function* copyFloorPlan(action: CreateFloorPlanAction) {
  try {
    const { floorPlan } = action;
    const response = yield call(placezApi.postFloorPlan, floorPlan);
    yield put({
      type: types.CREATE_FLOOR_PLAN_SUCCESS,
      floorPlan: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.CREATE_FLOOR_PLAN_FAILURE, error });
  }
}
function* updateFloorPlan(action: UpdateFloorPlanAction) {
  try {
    const { floorPlan } = action;
    const response = yield call(
      placezApi.putFloorPlan,
      floorPlan.id,
      floorPlan
    );
    yield put({
      type: types.UPDATE_FLOOR_PLAN_SUCCESS,
      floorPlan: response.parsedBody,
    });
  } catch (error) {
    // Show user-friendly error message
    const errorMessage =
      error?.parsedError?.message ||
      error?.message ||
      `Failed to update floor plan (${error?.status || 'Unknown error'})`;
    yield put(ToastMessage(`Error: ${errorMessage}`));

    yield put({ type: types.UPDATE_FLOOR_PLAN_FAILURE, error });
  }
}

function* deleteFloorPlan(action: DeleteFloorPlanAction) {
  try {
    const { floorPlanId } = action;
    yield call(placezApi.deleteFloorPlan, floorPlanId);
    yield put({ type: types.DELETE_FLOOR_PLAN_SUCCESS, floorPlanId });
  } catch (error) {
    yield put({ type: types.DELETE_FLOOR_PLAN_FAILURE, error });
  }
}
// TODO: need to depricate this
function* updatePhotospheres(action: UpdatePhotospheres) {
  const { photoSpheres } = action;
  const currentFloorPlan: PlacezFixturePlan = yield select(getFloorPlan);
  if (currentFloorPlan.fixtures) {
    currentFloorPlan.fixtures.forEach((asset) => {
      asset.gltf = undefined;
    });
  }
  const newFloorPlan = { ...currentFloorPlan, photoSpheres };

  try {
    const response = yield call(
      placezApi.putFloorPlan,
      newFloorPlan.id,
      newFloorPlan
    );
    yield put({
      type: types.UPDATE_FLOOR_PLAN_SUCCESS,
      floorPlan: response.parsedBody,
    });
  } catch (error) {
    // Show user-friendly error message
    const errorMessage =
      error?.parsedError?.message ||
      error?.message ||
      `Failed to update photospheres (${error?.status || 'Unknown error'})`;
    yield put(ToastMessage(`Error: ${errorMessage}`));
    yield put({ type: types.UPDATE_FLOOR_PLAN_FAILURE, error });
  }
}

// TODO: need to depricate this
function* updatePhotosphere(action: UpdatePhotosphere) {
  const { photoSphere } = action;
  const currentFloorPlan: PlacezFixturePlan = yield select(getFloorPlan);
  currentFloorPlan.fixtures.forEach((asset) => {
    asset.gltf = undefined;
  });

  const photoSpheres = currentFloorPlan.photoSpheres
    ? currentFloorPlan.photoSpheres
    : ([] as Photosphere[]);

  const newPhotospheres = photoSpheres.filter((returnableSphere) => {
    return returnableSphere.id !== photoSphere.id;
  });
  newPhotospheres.push(photoSphere);
  const newFloorPlan = { ...currentFloorPlan, photoSpheres: newPhotospheres };
  try {
    const response = yield call(
      placezApi.putFloorPlan,
      newFloorPlan.id,
      newFloorPlan
    );
    yield put({
      type: types.UPDATE_FLOOR_PLAN_SUCCESS,
      floorPlan: response.parsedBody,
    });
  } catch (error) {
    // Show user-friendly error message
    const errorMessage =
      error?.parsedError?.message ||
      error?.message ||
      `Failed to update photosphere (${error?.status || 'Unknown error'})`;
    yield put(ToastMessage(`Error: ${errorMessage}`));
    yield put({ type: types.UPDATE_FLOOR_PLAN_FAILURE, error });
  }
}

function* updateFloorPlanSuccess(action: UpdateFloorPlanSuccessAction) {
  yield put(SetFloorPlan(action.floorPlan));
  yield put(NeedSaveAction(false));
  yield put(SavingAction(false));
}
