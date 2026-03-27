import { all, takeLatest, put, call } from 'redux-saga/effects';
import {
  types,
  GetLabelsAction,
  GetLabelsSuccess,
  GetLabelsFailure,
  CreateLabelAction,
  CreateLabelSuccess,
  CreateLabelFailure,
  DeleteLabelAction,
  DeleteLabelSuccess,
  DeleteLabelFailure,
} from '../reducers/label';
import { store } from '..';

import { SagaReady } from '../reducers/lifecycle';

import { placezApi, LayoutLabel } from '../api';
import { ToastMessage } from '../reducers/ui'

export default function* attendeeSaga() {
  yield all([
    takeLatest(types.GET_LABELS, getLabels),
    takeLatest(types.CREATE_LABEL, createLabel),
    takeLatest(types.DELETE_LABEL, deleteLabel),
  ]);
  yield put(SagaReady('label'));
}

function* getLabels(action: GetLabelsAction) {
  try {
    const response = yield call(placezApi.getLabels);
    const labels = response.parsedBody as LayoutLabel[];

    yield put(GetLabelsSuccess(labels));
  } catch (error) {
    yield put(GetLabelsFailure(error));
  }
}

function* createLabel(action: CreateLabelAction) {
  try {
    const response = yield call(placezApi.postLabel, action.label);
    const label = response.parsedBody as LayoutLabel;
    store.dispatch(ToastMessage(`Label Favorited`));
    yield put(CreateLabelSuccess(label));
  } catch (error) {
    yield put(CreateLabelFailure(error));
  }
}

function* deleteLabel(action: DeleteLabelAction) {
  try {
    yield call(placezApi.deleteLabel, action.label.id);
    yield put(DeleteLabelSuccess(action.label));
  } catch (error) {
    yield put(DeleteLabelFailure(error));
  }
}
