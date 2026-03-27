import { all, takeLatest, put, call, select } from 'redux-saga/effects';
import {
  types,
  GetSceneLayoutsAction,
  CreateLayoutAction,
  UpdateLayoutAction,
  DeleteLayoutAction,
  UpdateLayoutsAction,
  UpdateLayoutSuccessAction,
  getLayouts,
} from '../reducers/layouts';
import { types as designerTypes, SetLayout } from '../reducers/designer';
import { SagaReady } from '../reducers/lifecycle';
import { NeedSaveAction, SavingAction } from '../reducers/blue';
import { types as uiTypes } from '../reducers/ui';

// Api
import { placezApi, PlacezFixturePlan, PlacezLayoutPlan } from '../api';
import { ReduxState } from '../reducers';
import { buildSceneLineItems } from '../utils/InvoiceUtils';
import { computeSceneDuration } from '../utils/SceneUtils';
import { rollUpPrice } from '../components/Tables/InvoiceTable';
import { isAfter, isBefore } from 'date-fns';

import { types as assetTypes } from '../reducers/asset';
import { GetScene } from '../reducers/scenes';
import { sceneRoutes } from '../routes';

export default function* layoutSaga() {
  yield all([
    takeLatest(types.GET_SCENE_LAYOUTS, getSceneLayouts),
    takeLatest(types.CREATE_LAYOUT, createLayout),
    takeLatest(types.UPDATE_LAYOUT, updateLayout),
    takeLatest(types.UPDATE_LAYOUTS, updateLayouts),
    takeLatest(types.DELETE_LAYOUT, deleteLayout),
    takeLatest(types.UPDATE_LAYOUT_SUCCESS, updateLayoutSuccess),
    takeLatest(types.GET_TEMPLATES, getTemplates),
    takeLatest(types.UPDATE_LAYOUTS_SUCCESS, updateInvoices),
    takeLatest(types.GET_SCENE_LAYOUTS_SUCCESS, updateInvoices),
    takeLatest(assetTypes.GET_ASSETS_SUCCESS, updateInvoices),
  ]);
  yield put(SagaReady('layout'));
}

function* getSceneLayouts(action: GetSceneLayoutsAction) {
  try {
    const { sceneId } = action;
    const response = yield call(placezApi.getSceneLayouts, sceneId);
    yield put({
      type: types.GET_SCENE_LAYOUTS_SUCCESS,
      layouts: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.GET_SCENE_LAYOUTS_FAILURE, error });
  }
}

function* createLayout(action: CreateLayoutAction) {
  try {
    const { layout } = action;
    const response = yield call(placezApi.postLayout, layout);
    yield put({
      type: types.CREATE_LAYOUT_SUCCESS,
      layout: response.parsedBody,
    });
    if (typeof layout?.isCloseModalAndNavigateToScene === 'function') {
      layout.isCloseModalAndNavigateToScene();
      yield put({
        type: uiTypes.NAVIGATE,
        target: sceneRoutes.edit.path.replace(':id', String(layout.sceneId)),
      });
    }
    yield put({
      type: designerTypes.GET_DESIGNER_LAYOUT_SUCCESS,
      layout: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.CREATE_LAYOUT_FAILURE, error });
  }
}

function* updateLayout(action: UpdateLayoutAction) {
  try {
    const { layout } = action;
    const response = yield call(placezApi.putLayout, layout);
    yield put({
      type: types.UPDATE_LAYOUT_SUCCESS,
      layout: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.UPDATE_LAYOUT_FAILURE, error });
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Failed To Save' });
  }
}

function* updateLayouts(action: UpdateLayoutsAction) {
  try {
    const { layouts } = action;
    const response = yield call(placezApi.putLayouts, layouts);
    yield put({
      type: types.UPDATE_LAYOUTS_SUCCESS,
      layouts: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.UPDATE_LAYOUT_FAILURE, error });
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Failed To Save' });
  }
}

function* deleteLayout(action: DeleteLayoutAction) {
  try {
    const { layoutId } = action;
    const response = yield call(placezApi.deleteLayout, layoutId);
    yield put({ type: types.DELETE_LAYOUT_SUCCESS, layoutId });
  } catch (error) {
    yield put({ type: types.DELETE_LAYOUT_FAILURE, error });
  }
}

function* getTemplates() {
  try {
    const response = yield call(placezApi.getTemplates);
    yield put({
      type: types.GET_TEMPLATES_SUCCESS,
      templates: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.GET_TEMPLATES_FAILURE, error });
  }
}

function* updateLayoutSuccess(action: UpdateLayoutSuccessAction) {
  try {
    yield put(SetLayout(action.layout));
    yield put(NeedSaveAction(false));
    yield put(SavingAction(false));
    yield call(updateInvoices);
    yield put(GetScene(action.layout.sceneId));
  } catch (error) {
    console.warn('error', error);
  }
}

function* updateInvoices() {
  try {
    const layouts: PlacezLayoutPlan[] = yield select(getLayouts);
    const floorPlans: PlacezFixturePlan[] = yield select(
      (state: ReduxState) => state.floorPlans.unsorted
    );
    const assetsBySku = yield select((state: ReduxState) => state.asset.bySku);
    const venues = yield select((state: ReduxState) => state.place.places);

    const sceneLineItems = buildSceneLineItems(
      layouts ?? [],
      floorPlans,
      assetsBySku,
      venues
    );
    const total = rollUpPrice(sceneLineItems);
    //TODO use layout time not scene time
    sceneLineItems.push({
      notes: `Total @${computeSceneDuration(layouts)}hrs:`,
      total: total,
    });

    yield put({
      type: types.UPDATE_INVOICE,
      invoiceLineItems: sceneLineItems,
      invoiceTotal: total,
    });
  } catch (error) {
    console.warn('cannot update invoices', error);
  }
}

export const findEarliestAndLatest = (layouts: PlacezLayoutPlan[]) => {
  if (!layouts?.length) {
    return { earliest: null, latest: null };
  }
  return layouts.reduce(
    (acc, layout) => {
      if (!acc.earliest || isBefore(layout.startUtcDateTime, acc.earliest)) {
        acc.earliest = layout.startUtcDateTime;
      }

      if (!acc.latest || isAfter(layout.endUtcDateTime, acc.latest)) {
        acc.latest = layout.endUtcDateTime;
      }

      return acc;
    },
    { earliest: null as Date | null, latest: null as Date | null }
  );
};
