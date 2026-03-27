import { all, takeLatest, put } from 'redux-saga/effects';
import {
  ToastMessageAction,
  types,
} from '../reducers/ui';
import { SagaReady } from '../reducers/lifecycle';

// Api
import { ToastStateService } from '../components/Blue/components/toast'

export default function* clientSaga() {
  yield all([
    takeLatest(types.TOAST_MESSAGE, toastMessage),
  ]);
  yield put(SagaReady('ui'));
}

function toastMessage(action: ToastMessageAction) {
  const toastService = ToastStateService.getInstance();
  toastService.$createMessage(action.message, action.duration);
}

