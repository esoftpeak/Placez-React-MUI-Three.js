import { PlacezFixturePlan } from '../api';
import Attendee from '../api/placez/models/Attendee';
import { Asset } from '../blue/items';
import createReducer from './helpers/createReducer';

// Action Types
const INIT_HISTORY = 'INIT_HISTORY';
const SET_PAST = 'SET_PAST';
const SET_FUTURE = 'SET_FUTURE';
const UNDO = 'UNDO';
const REDO = 'REDO';

export const types = {
  INIT_HISTORY,
  SET_PAST,
  SET_FUTURE,
  UNDO,
  REDO,
};

type Types =
  | typeof INIT_HISTORY
  | typeof SET_PAST
  | typeof SET_FUTURE
  | typeof UNDO
  | typeof REDO;

export interface HistoryModel {
  items: Asset[];
  attendees: Attendee[];
  floorplan: PlacezFixturePlan;
}

// State
export type State = {
  history: HistoryModel;
  past: { assets?: any; attendees?: any; floorplan?: any }[];
  future: { assets?: any; attendees?: any; floorplan?: any }[];
};

const initialState: State = {
  history: null,
  past: [],
  future: [],
};

// Action Creators
export const InitHistory = (history: any) => ({
  type: INIT_HISTORY as typeof INIT_HISTORY,
  history,
});

export const SetPast = (newPast: any[]) => ({
  type: SET_PAST as typeof SET_PAST,
  newPast,
});

export const SetFuture = (newFuture: any[]) => ({
  type: SET_FUTURE as typeof SET_FUTURE,
  newFuture,
});

export const UndoHistory = () => ({
  type: UNDO as typeof UNDO,
});

export const RedoHistory = () => ({
  type: REDO as typeof REDO,
});

export type InitHistory = ReturnType<typeof InitHistory>;
export type SetFuture = ReturnType<typeof SetFuture>;
export type SetPast = ReturnType<typeof SetPast>;
export type UndoAction = ReturnType<typeof UndoHistory>;
export type RedoAction = ReturnType<typeof RedoHistory>;

export type Action =
  | InitHistory
  | SetPast
  | SetFuture
  | UndoAction
  | RedoAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [INIT_HISTORY]: (state: State): State => ({
    ...state,
  }),
  [SET_PAST]: (state: State, action: SetPast): State => ({
    ...state,
    past: action.newPast,
  }),
  [SET_FUTURE]: (state: State, action: SetFuture): State => ({
    ...state,
    future: action.newFuture,
  }),
  [UNDO]: (state: State): State => ({
    ...state,
  }),
  [REDO]: (state: State): State => ({
    ...state,
  }),
});
