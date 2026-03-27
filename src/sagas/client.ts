import { all, takeLatest, put, call } from 'redux-saga/effects';
import {
  types,
  GetClientsAction,
  CreateClientAction,
  UpdateClientAction,
  DeleteClientAction,
} from '../reducers/client';
import { SagaReady } from '../reducers/lifecycle';

// Api
import { placezApi } from '../api';

export default function* clientSaga() {
  yield all([
    takeLatest(types.GET_CLIENTS, getClients),
    takeLatest(types.CREATE_CLIENT, createClient),
    takeLatest(types.UPDATE_CLIENT, updateClient),
    takeLatest(types.DELETE_CLIENT, deleteClient),
  ]);
  yield put({ type: types.GET_CLIENTS });
  yield put(SagaReady('client'));
}

function* getClients(action: GetClientsAction) {
  try {
    const response = yield call(placezApi.getClients);
    yield put({
      type: types.GET_CLIENTS_SUCCESS,
      clients: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.GET_CLIENTS_FAILURE, error });
  }
}

function* createClient(action: CreateClientAction) {
  try {
    const { client } = action;
    const response = yield call(placezApi.postClient, client);
    yield put({
      type: types.CREATE_CLIENT_SUCCESS,
      client: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.CREATE_CLIENT_FAILURE, error: error.parsedError });
  }
}

function* updateClient(action: UpdateClientAction) {
  try {
    const { client } = action;
    const response = yield call(placezApi.putClient, client);
    yield put({
      type: types.UPDATE_CLIENT_SUCCESS,
      client: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.UPDATE_CLIENT_FAILURE, error });
  }
}

function* deleteClient(action: DeleteClientAction) {
  try {
    const { clientId } = action;
    const response = yield call(placezApi.deleteClient, clientId);
    yield put({ type: types.DELETE_CLIENT_SUCCESS, clientId });
  } catch (error) {
    yield put({ type: types.DELETE_CLIENT_FAILURE, error });
  }
}
