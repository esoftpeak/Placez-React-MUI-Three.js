import createReducer from './helpers/createReducer';
import { groupBy, normalizeArray } from '../sharing/utils/normalizeArray';
import { Photosphere } from '../components/Blue/models/Photosphere';
import PlacezFixturePlan from '../api/placez/models/PlacezFixturePlan';

// Action Types
const GET_FLOOR_PLANS = 'GET_FLOOR_PLANS';
const GET_FLOOR_PLANS_SUCCESS = 'GET_FLOOR_PLANS_SUCCESS';
const GET_FLOOR_PLANS_FAILURE = 'GET_FLOOR_PLANS_FAILURE';

const UPDATE_PHOTOSPHERES = 'UPDATE_PHOTOSPHERES';
const UPDATE_PHOTOSPHERE = 'UPDATE_PHOTOSPHERE';

const UPDATE_FLOOR_PLAN = 'UPDATE_FLOOR_PLAN';
const UPDATE_FLOOR_PLAN_SUCCESS = 'UPDATE_FLOOR_PLAN_SUCCESS';
const UPDATE_FLOOR_PLAN_FAILURE = 'UPDATE_FLOOR_PLAN_FAILURE';

const CREATE_FLOOR_PLAN = 'CREATE_FLOOR_PLAN';
const CREATE_FLOOR_PLAN_SUCCESS = 'CREATE_FLOOR_PLAN_SUCCESS';
const CREATE_FLOOR_PLAN_FAILURE = 'CREATE_FLOOR_PLAN_FAILURE';

const COPY_FLOOR_PLAN = 'COPY_FLOOR_PLAN';

const DELETE_FLOOR_PLAN = 'DELETE_FLOOR_PLAN';
const DELETE_FLOOR_PLAN_SUCCESS = 'DELETE_FLOOR_PLAN_SUCCESS';
const DELETE_FLOOR_PLAN_FAILURE = 'DELETE_FLOOR_PLAN_FAILURE';

export const types = {
  GET_FLOOR_PLANS,
  GET_FLOOR_PLANS_SUCCESS,
  GET_FLOOR_PLANS_FAILURE,
  UPDATE_PHOTOSPHERES,
  UPDATE_PHOTOSPHERE,
  UPDATE_FLOOR_PLAN,
  UPDATE_FLOOR_PLAN_SUCCESS,
  UPDATE_FLOOR_PLAN_FAILURE,
  CREATE_FLOOR_PLAN,
  CREATE_FLOOR_PLAN_SUCCESS,
  CREATE_FLOOR_PLAN_FAILURE,
  COPY_FLOOR_PLAN,
  DELETE_FLOOR_PLAN,
  DELETE_FLOOR_PLAN_SUCCESS,
  DELETE_FLOOR_PLAN_FAILURE,
};

type Types =
  | typeof GET_FLOOR_PLANS
  | typeof GET_FLOOR_PLANS_SUCCESS
  | typeof GET_FLOOR_PLANS_FAILURE
  | typeof UPDATE_PHOTOSPHERES
  | typeof UPDATE_PHOTOSPHERE
  | typeof UPDATE_FLOOR_PLAN
  | typeof UPDATE_FLOOR_PLAN_SUCCESS
  | typeof UPDATE_FLOOR_PLAN_FAILURE
  | typeof CREATE_FLOOR_PLAN
  | typeof COPY_FLOOR_PLAN
  | typeof CREATE_FLOOR_PLAN_SUCCESS
  | typeof CREATE_FLOOR_PLAN_FAILURE
  | typeof DELETE_FLOOR_PLAN
  | typeof DELETE_FLOOR_PLAN_SUCCESS
  | typeof DELETE_FLOOR_PLAN_FAILURE;

// State
export type State = {
  unsorted: PlacezFixturePlan[];
  byId: { [floorPlanId: number]: PlacezFixturePlan };
  byPlace: Map<PlacezFixturePlan[keyof PlacezFixturePlan], PlacezFixturePlan[]>;
};

const initialState: State = {
  unsorted: [],
  byId: null,
  byPlace: null,
};

// Action Creators
export const UpdatePhotospheres = (photoSpheres: Photosphere[]) => ({
  type: UPDATE_PHOTOSPHERES as typeof UPDATE_PHOTOSPHERES,
  photoSpheres,
});

export const UpdatePhotosphere = (photoSphere: Photosphere) => ({
  type: UPDATE_PHOTOSPHERE as typeof UPDATE_PHOTOSPHERE,
  photoSphere,
});

export const GetFloorPlans = (placeId?: number) => ({
  type: GET_FLOOR_PLANS as typeof GET_FLOOR_PLANS,
  placeId,
});

export const GetFloorPlansSuccess = (floorPlans: PlacezFixturePlan[]) => ({
  type: GET_FLOOR_PLANS_SUCCESS as typeof GET_FLOOR_PLANS_SUCCESS,
  floorPlans,
});

export const GetFloorPlansFailure = (error: any) => ({
  type: GET_FLOOR_PLANS_FAILURE as typeof GET_FLOOR_PLANS_FAILURE,
  error,
});

export const UpdateFloorPlan = (floorPlan: PlacezFixturePlan) => ({
  type: UPDATE_FLOOR_PLAN as typeof UPDATE_FLOOR_PLAN,
  floorPlan,
});

export const UpdateFloorPlanSuccess = (floorPlan: PlacezFixturePlan) => ({
  type: UPDATE_FLOOR_PLAN_SUCCESS as typeof UPDATE_FLOOR_PLAN_SUCCESS,
  floorPlan,
});

export const UpdateFloorPlanFailure = (error: any) => ({
  type: UPDATE_FLOOR_PLAN_FAILURE as typeof UPDATE_FLOOR_PLAN_FAILURE,
  error,
});

//this newIdRef is temporary
export const CreateFloorPlan = (floorPlan: PlacezFixturePlan, newIdRef: number) => ({
  type: CREATE_FLOOR_PLAN as typeof CREATE_FLOOR_PLAN,
  floorPlan,
  newIdRef
});

export const CreateFloorPlanSuccess = (floorPlan: PlacezFixturePlan) => ({
  type: CREATE_FLOOR_PLAN_SUCCESS as typeof CREATE_FLOOR_PLAN_SUCCESS,
  floorPlan,
});

export const CreateFloorPlanFailure = (error: any) => ({
  type: CREATE_FLOOR_PLAN_FAILURE as typeof CREATE_FLOOR_PLAN_FAILURE,
  error,
});

export const CopyFloorPlan = (floorPlan: PlacezFixturePlan) => ({
  type: COPY_FLOOR_PLAN as typeof COPY_FLOOR_PLAN,
  floorPlan,
});

export const DeleteFloorPlan = (floorPlanId: string) => ({
  type: DELETE_FLOOR_PLAN as typeof DELETE_FLOOR_PLAN,
  floorPlanId,
});

export const DeleteFloorPlanSuccess = (floorPlanId: string) => ({
  type: DELETE_FLOOR_PLAN_SUCCESS as typeof DELETE_FLOOR_PLAN_SUCCESS,
  floorPlanId,
});

export const DeleteFloorPlanFailure = (error: any) => ({
  type: DELETE_FLOOR_PLAN_FAILURE as typeof DELETE_FLOOR_PLAN_FAILURE,
  error,
});

export type GetFloorPlansAction = ReturnType<typeof GetFloorPlans>;
export type GetFloorPlansSuccessAction = ReturnType<
  typeof GetFloorPlansSuccess
>;
export type GetFloorPlansFailureAction = ReturnType<
  typeof GetFloorPlansFailure
>;
export type UpdatePhotospheres = ReturnType<typeof UpdatePhotospheres>;
export type UpdatePhotosphere = ReturnType<typeof UpdatePhotosphere>;
export type UpdateFloorPlanAction = ReturnType<typeof UpdateFloorPlan>;
export type UpdateFloorPlanSuccessAction = ReturnType<
  typeof UpdateFloorPlanSuccess
>;
export type UpdateFloorPlanFailureAction = ReturnType<
  typeof UpdateFloorPlanFailure
>;
export type CreateFloorPlanAction = ReturnType<typeof CreateFloorPlan>;
export type CreateFloorPlanSuccessAction = ReturnType<
  typeof CreateFloorPlanSuccess
>;
export type CreateFloorPlanFailureAction = ReturnType<
  typeof CreateFloorPlanFailure
>;
export type CopyFloorPlanAction = ReturnType<typeof CopyFloorPlan>;
export type DeleteFloorPlanAction = ReturnType<typeof DeleteFloorPlan>;
export type DeleteFloorPlanSuccessAction = ReturnType<
  typeof DeleteFloorPlanSuccess
>;
export type DeleteFloorPlanFailureAction = ReturnType<
  typeof DeleteFloorPlanFailure
>;

export type Action =
  | GetFloorPlansAction
  | GetFloorPlansSuccessAction
  | GetFloorPlansFailureAction
  | UpdateFloorPlanAction
  | UpdateFloorPlanSuccessAction
  | UpdateFloorPlanFailureAction
  | CreateFloorPlanAction
  | CreateFloorPlanSuccessAction
  | CreateFloorPlanFailureAction
  | CopyFloorPlanAction
  | DeleteFloorPlanAction
  | DeleteFloorPlanSuccessAction
  | DeleteFloorPlanFailureAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [UPDATE_PHOTOSPHERES]: (state: State, action: UpdatePhotospheres): State =>
    state,
  [UPDATE_PHOTOSPHERE]: (state: State, action: UpdatePhotosphere): State =>
    state,
  [GET_FLOOR_PLANS]: (state: State, action: GetFloorPlansAction): State =>
    state,
  [GET_FLOOR_PLANS_SUCCESS]: (
    state: State,
    action: GetFloorPlansSuccessAction
  ): State => ({
    ...state,
    unsorted: action.floorPlans,
    byId: normalizeArray(action.floorPlans, 'id'),
    byPlace: groupBy(action.floorPlans, 'placeId'),
  }),
  [GET_FLOOR_PLANS_FAILURE]: (
    state: State,
    action: GetFloorPlansFailureAction
  ): State => state,
  [UPDATE_FLOOR_PLAN]: (state: State, action: UpdateFloorPlanAction): State =>
    state,
  [UPDATE_FLOOR_PLAN_SUCCESS]: (
    state: State,
    action: UpdateFloorPlanSuccessAction
  ): State => ({
    ...state,
    unsorted: state.unsorted.map((floorPlan) =>
      floorPlan.id === action.floorPlan.id
        ? { ...floorPlan, ...action.floorPlan }
        : floorPlan
    ),
    byId: {
      ...state.byId,
      [action.floorPlan.id]: action.floorPlan,
    },
    byPlace: {
      ...state.byPlace,
      [action.floorPlan.placeId]: action.floorPlan,
    },
  }),
  [UPDATE_FLOOR_PLAN_FAILURE]: (
    state: State,
    action: UpdateFloorPlanFailureAction
  ): State => state,
  [CREATE_FLOOR_PLAN]: (state: State, action: CreateFloorPlanAction): State =>
    state,
  [CREATE_FLOOR_PLAN_SUCCESS]: (
    state: State,
    action: CreateFloorPlanSuccessAction
  ): State => ({
    ...state,
    unsorted: state.unsorted.concat([action.floorPlan]),
    byId: {
      ...state.byId,
      [action.floorPlan.id]: action.floorPlan,
    },
    byPlace: {
      ...state.byPlace,
      [action.floorPlan.placeId]: action.floorPlan,
    },
  }),
  [COPY_FLOOR_PLAN]: (state: State, action: CopyFloorPlanAction): State =>
    state,
  [CREATE_FLOOR_PLAN_FAILURE]: (
    state: State,
    action: CreateFloorPlanFailureAction
  ): State => state,
  [DELETE_FLOOR_PLAN]: (state: State, action: DeleteFloorPlanAction): State =>
    state,
  [DELETE_FLOOR_PLAN_SUCCESS]: (
    state: State,
    action: DeleteFloorPlanSuccessAction
  ): State => {
    const newById = state.byId;
    const deleted = state.byId[action.floorPlanId];
    const newByPlace = state.byPlace;
    delete newById[deleted.id];
    delete newByPlace[deleted.placeId];
    return {
      ...state,
      unsorted: state.unsorted.filter(
        (floorPlan) => floorPlan.id !== action.floorPlanId
      ),
      byId: {
        ...newById,
      },
      byPlace: {
        ...newByPlace,
      },
    };
  },
  [DELETE_FLOOR_PLAN_FAILURE]: (
    state: State,
    action: DeleteFloorPlanFailureAction
  ): State => state,
});

export const getFloorPlans = (state: { floorPlans: State }) => {
  return state.floorPlans.byId;
};

export const getFloorNamesByPlaceId = (
  state: { floorPlans: State },
  placeId: number
) => {
  return state.floorPlans.unsorted
    .filter((fp) => {
      return fp.placeId === placeId;
    })
    .map((fp) => {
      return fp.name;
    });
};

export const getFloorPlansByPlaceId = (
  state: { floorPlans: State },
  placeId: number
) => {
  return state.floorPlans.unsorted.filter((fp) => {
    return fp.placeId === placeId;
  });
};

export const getFloorPlanById = (
  state: { floorPlans: State },
  id: string
) => {
  return state?.floorPlans?.byId[id];
};
