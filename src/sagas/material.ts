import { all, takeLatest, put, call } from 'redux-saga/effects';
import {
  types,
  SaveMaterialAction,
  DeleteMaterialAction,
  GetMaterialsAction,
} from '../reducers/material';

import { types as uiTypes } from '../reducers/ui';

import { SagaReady } from '../reducers/lifecycle';

// Api
import { PlacezMaterial } from '../api/placez/models/PlacezMaterial';
import { placezApi } from '../api'

// Utils
export default function* materialSaga() {
  yield all([
    takeLatest(types.GET_MATERIALS, getMaterials),
    takeLatest(types.DELETE_MATERIAL, deleteMaterial),
    takeLatest(types.SAVE_MATERIAL, saveMaterial),
  ]);
  yield put({ type: types.GET_MATERIALS });
  yield put(SagaReady('material'));
}

function* getMaterials(action: GetMaterialsAction) {
  try {
    const response = yield call(placezApi.getMaterials);
    const materials = response.parsedBody as PlacezMaterial[];
    yield put({ type: types.GET_MATERIALS_SUCCESS, materials });
  } catch (error) {
    yield put({ type: types.GET_MATERIALS_FAILURE, error });
  }
}

function* saveMaterial(action: SaveMaterialAction) {
  try {
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Saving Material' });
    yield call(placezApi.postMaterial, action.material);
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Material Saved' });
    yield put({ type: types.GET_MATERIALS });
  } catch (error) {}
}

function* deleteMaterial(action: DeleteMaterialAction) {
  try {
    yield call(placezApi.deleteMaterial, action.id);
    yield put({ type: types.GET_MATERIALS });
  } catch (error) {}
}
