import createReducer from './helpers/createReducer';
import { LayoutLabel } from '../api';

// Action Types
const GET_LABELS = 'GET_LABELS';
const GET_LABELS_SUCCESS = 'GET_LABELS_SUCCESS';
const GET_LABELS_FAILURE = 'GET_LABELS_FAILURE';
const CREATE_LABEL = 'CREATE_LABEL';
const CREATE_LABEL_SUCCESS = 'CREATE_LABEL_SUCCESS';
const CREATE_LABEL_FAILURE = 'CREATE_LABEL_FAILURE';
const DELETE_LABEL = 'DELETE_LABEL';
const DELETE_LABEL_SUCCESS = 'DELETE_LABEL_SUCCESS';
const DELETE_LABEL_FAILURE = 'DELETE_LABEL_FAILURE';

export const types = {
  GET_LABELS,
  GET_LABELS_SUCCESS,
  GET_LABELS_FAILURE,
  CREATE_LABEL,
  CREATE_LABEL_SUCCESS,
  CREATE_LABEL_FAILURE,
  DELETE_LABEL,
  DELETE_LABEL_SUCCESS,
  DELETE_LABEL_FAILURE,
};

type Types =
  | typeof GET_LABELS
  | typeof GET_LABELS_SUCCESS
  | typeof GET_LABELS_FAILURE
  | typeof CREATE_LABEL
  | typeof CREATE_LABEL_SUCCESS
  | typeof CREATE_LABEL_FAILURE
  | typeof DELETE_LABEL
  | typeof DELETE_LABEL_SUCCESS
  | typeof DELETE_LABEL_FAILURE;

// State
export type State = {
  labels: LayoutLabel[];
};

const initialState: State = {
  labels: [] as LayoutLabel[],
};

// Action Creators
export const GetLabels = () => ({
  type: GET_LABELS as typeof GET_LABELS,
});

export const GetLabelsSuccess = (labels: LayoutLabel[]) => ({
  type: GET_LABELS_SUCCESS as typeof GET_LABELS_SUCCESS,
  labels,
});

export const GetLabelsFailure = (error: any) => ({
  type: GET_LABELS_FAILURE as typeof GET_LABELS_FAILURE,
  error,
});

export const CreateLabel = (label: LayoutLabel) => ({
  type: CREATE_LABEL as typeof CREATE_LABEL,
  label,
});

export const CreateLabelSuccess = (label: LayoutLabel) => ({
  type: CREATE_LABEL_SUCCESS as typeof CREATE_LABEL_SUCCESS,
  label,
});

export const CreateLabelFailure = (error: any) => ({
  type: CREATE_LABEL_FAILURE as typeof CREATE_LABEL_FAILURE,
  error,
});

export const DeleteLabel = (label: LayoutLabel) => ({
  type: DELETE_LABEL as typeof DELETE_LABEL,
  label,
});

export const DeleteLabelSuccess = (label: LayoutLabel) => ({
  type: DELETE_LABEL_SUCCESS as typeof DELETE_LABEL_SUCCESS,
  label,
});

export const DeleteLabelFailure = (error: any) => ({
  type: DELETE_LABEL_FAILURE as typeof DELETE_LABEL_FAILURE,
  error,
});

export type GetLabelsAction = ReturnType<typeof GetLabels>;
export type GetLabelsSuccessAction = ReturnType<typeof GetLabelsSuccess>;
export type GetLabelsFailureAction = ReturnType<typeof GetLabelsFailure>;
export type CreateLabelAction = ReturnType<typeof CreateLabel>;
export type CreateLabelSuccessAction = ReturnType<typeof CreateLabelSuccess>;
export type CreateLabelFailureAction = ReturnType<typeof CreateLabelFailure>;
export type DeleteLabelAction = ReturnType<typeof DeleteLabel>;
export type DeleteLabelSuccessAction = ReturnType<typeof DeleteLabelSuccess>;
export type DeleteLabelFailureAction = ReturnType<typeof DeleteLabelFailure>;

export type Action =
  | GetLabelsAction
  | GetLabelsSuccessAction
  | GetLabelsFailureAction
  | CreateLabelAction
  | CreateLabelSuccessAction
  | CreateLabelFailureAction
  | DeleteLabelAction
  | DeleteLabelSuccessAction
  | DeleteLabelFailureAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_LABELS]: (state: State, action: GetLabelsAction): State => ({
    ...state,
  }),
  [GET_LABELS_SUCCESS]: (
    state: State,
    action: GetLabelsSuccessAction
  ): State => ({
    ...state,
    labels: action.labels,
  }),
  [GET_LABELS_FAILURE]: (
    state: State,
    action: GetLabelsFailureAction
  ): State => ({
    ...state,
  }),

  [CREATE_LABEL]: (state: State, action: CreateLabelAction): State => ({
    ...state,
  }),
  [CREATE_LABEL_SUCCESS]: (
    state: State,
    action: CreateLabelSuccessAction
  ): State => ({
    ...state,
    labels: [...state.labels, action.label],
  }),
  [CREATE_LABEL_FAILURE]: (
    state: State,
    action: CreateLabelFailureAction
  ): State => ({
    ...state,
  }),
  [DELETE_LABEL]: (state: State, action: DeleteLabelAction): State => ({
    ...state,
  }),
  [DELETE_LABEL_SUCCESS]: (
    state: State,
    action: DeleteLabelSuccessAction
  ): State => ({
    ...state,
    labels: state.labels.filter(
      (label: LayoutLabel) => label.id !== action.label.id
    ),
  }),
  [DELETE_LABEL_FAILURE]: (
    state: State,
    action: DeleteLabelFailureAction
  ): State => ({
    ...state,
  }),
});
