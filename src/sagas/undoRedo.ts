import {
  all,
  takeLatest,
  put,
  select,
} from 'redux-saga/effects';
import { SagaReady } from '../reducers/lifecycle';

import {
  types as BlueTypes,
  InitDesignerAction,
} from '../reducers/blue';
import { SetFuture, SetPast, types } from '../reducers/undoRedo';
import { ReduxState } from '../reducers';
import {
  getViewState,
  getGlobalViewState,
} from '../reducers/globalState';
import { ViewState, GlobalViewState } from '../models/GlobalState';

let designer: any;

export default function* blueSaga() {
  yield all([
    takeLatest(BlueTypes.INIT_DESIGNER, initDesigner),
    takeLatest(types.UNDO, undo),
    takeLatest(types.REDO, redo),
    takeLatest(types.SET_PAST, setPast),
  ]);
  yield put(SagaReady('undoRedo'));
}

function initDesigner(action: InitDesignerAction) {
  designer = action.designer;
}

function* undo() {
  // all undo effects go here

  const past = yield select((state: ReduxState) => state.undoRedo.past);
  const future = yield select((state: ReduxState) => state.undoRedo.future);

  if (past.length < 1) return;

  const newPast = [...past];
  const newFuture = [...future];
  const change = newPast.pop();
  newFuture.push(change);

  yield put(SetPast(newPast));
  yield put(SetFuture(newFuture));

  const globalViewState = yield select(getGlobalViewState);
  const viewState = yield select(getViewState);

  if (globalViewState === GlobalViewState.Fixtures) {
    if (viewState === ViewState.Floorplan) {
      designer
        .getModel()
        .floorplan.loadFloorplan(change.floorplan.undo[0].value);
      designer.getFloorPlan().getController().updateWallLabels();
    } else {
      designer.getMain().getController().undo(change);
      designer.getFloorPlan().floorplan.updateWalls();
    }
  } else if (globalViewState === GlobalViewState.Layout) {
    designer.getMain().getController().undo(change);
    designer.getFloorPlan().floorplan.updateWalls();
  }
}

function* redo() {
  // all redo effects go here

  const past = yield select((state: ReduxState) => state.undoRedo.past);
  const future = yield select((state: ReduxState) => state.undoRedo.future);

  if (future.length < 1) return;

  const newPast = [...past];
  const newFuture = [...future];
  const change = newFuture.pop();
  newPast.push(change);

  yield put(SetPast(newPast));
  yield put(SetFuture(newFuture));

  const globalViewState = yield select(getGlobalViewState);
  const viewState = yield select(getViewState);

  if (globalViewState === GlobalViewState.Fixtures) {
    if (viewState === ViewState.Floorplan) {
      designer
        .getModel()
        .floorplan.loadFloorplan(change.floorplan.redo[0].value);
      designer.getFloorPlan().getController().updateWallLabels();
    } else {
      designer.getMain().getController().redo(change);
      designer.getFloorPlan().floorplan.updateWalls();
    }
  } else if (globalViewState === GlobalViewState.Layout) {
    designer.getMain().getController().redo(change);
    designer.getFloorPlan().floorplan.updateWalls();
  }
}

function* setPast(action) {}
