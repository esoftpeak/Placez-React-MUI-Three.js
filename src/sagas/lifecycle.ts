import { put } from 'redux-saga/effects';
import { SagaReady, types } from '../reducers/lifecycle';

export default function* lifecycleSaga() {
  yield put({ type: types.APPLICATION_START, isAppStarted: true });
  yield put(SagaReady('lifecyle'));
}
