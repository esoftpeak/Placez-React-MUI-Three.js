import createReducer from './helpers/createReducer';
import { Corner } from '../blue/model/corner';

export enum FloorPlanModes {
  'NONE',
  'MOVE',
  'DRAW',
  'DELETE',
  'SCALE',
}

// Action Types
const SELECT_CORNERS = 'SELECT_CORNERS';
const SET_MODE = 'SET_MODE';
const SET_ACTIVE_CORNER = 'SET_ACTIVE_CORNER';

export const types = {
  SELECT_CORNERS,
  SET_MODE,
  SET_ACTIVE_CORNER,
};

type Types = typeof SELECT_CORNERS | typeof SET_MODE | typeof SET_ACTIVE_CORNER;

// State
export type State = {
  selectedCorners: any[];
  floor: number;
  mode: FloorPlanModes;
  activeCorner: Corner;
};

const initialState: State = {
  selectedCorners: [],
  floor: 1,
  mode: FloorPlanModes.NONE,
  activeCorner: undefined,
};

// Action Creators
export const SelectCorners = (corners: Corner[]) => ({
  type: SELECT_CORNERS as typeof SELECT_CORNERS,
  corners,
});

export const SetActiveCorner = (corner: Corner) => ({
  type: SET_ACTIVE_CORNER as typeof SET_ACTIVE_CORNER,
  corner,
});

export const SetFloorPlanMode = (mode: FloorPlanModes) => ({
  type: SET_MODE as typeof SET_MODE,
  mode,
});

export type SelectCornersAction = ReturnType<typeof SelectCorners>;
export type SetFloorPlanModeAction = ReturnType<typeof SetFloorPlanMode>;
export type SetActiveCornerAction = ReturnType<typeof SetActiveCorner>;

export type Action =
  | SelectCornersAction
  | SetFloorPlanModeAction
  | SetActiveCornerAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [SELECT_CORNERS]: (state: State, action: SelectCornersAction): State => {
    // not sure if side effects in here is good ohh well
    state.selectedCorners.forEach((corner) => corner.unSelect());
    action.corners.forEach((corner) => corner.select());
    return {
      ...state,
      selectedCorners: [
        ...new Map(action.corners.map((item) => [item.id, item])).values(),
      ],
    };
  },
  [SET_MODE]: (state: State, action: SetFloorPlanModeAction): State => ({
    ...state,
    mode: action.mode,
  }),
  [SET_ACTIVE_CORNER]: (
    state: State,
    action: SetActiveCornerAction
  ): State => ({
    ...state,
    activeCorner: action.corner,
  }),
});
