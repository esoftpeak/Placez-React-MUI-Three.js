import createReducer from './helpers/createReducer';
import { Attendee } from '../api';

// Action Types
const GET_ATTENDEES_BY_LAYOUT_ID = 'GET_ATTENDEES_BY_LAYOUT_ID';
const GET_ATTENDEES_BY_LAYOUT_ID_SUCCESS = 'GET_ATTENDEES_BY_LAYOUT_ID_SUCCESS';
const GET_ATTENDEES_BY_LAYOUT_ID_FAILURE = 'GET_ATTENDEES_BY_LAYOUT_ID_FAILURE';
const CREATE_ATTENDEE = 'CREATE_ATTENDEE';
const CREATE_ATTENDEE_SUCCESS = 'CREATE_ATTENDEE_SUCCESS';
const CREATE_ATTENDEE_FAILURE = 'CREATE_ATTENDEE_FAILURE';
const UPDATE_ATTENDEE = 'UPDATE_ATTENDEE';
const UPDATE_ATTENDEE_SUCCESS = 'UPDATE_ATTENDEE_SUCCESS';
const UPDATE_ATTENDEE_FAILURE = 'UPDATE_ATTENDEE_FAILURE';
const UPDATE_ATTENDEES = 'UPDATE_ATTENDEES';
const UPDATE_ATTENDEES_SUCCESS = 'UPDATE_ATTENDEES_SUCCESS';
const UPDATE_ATTENDEES_FAILURE = 'UPDATE_ATTENDEES_FAILURE';
const DELETE_ATTENDEE = 'DELETE_ATTENDEE';
const DELETE_ATTENDEE_SUCCESS = 'DELETE_ATTENDEE_SUCCESS';
const DELETE_ATTENDEE_FAILURE = 'DELETE_ATTENDEE_FAILURE';
const SELECT_ATTENDEE = 'SELECT_ATTENDEE';
const SELECT_TABLE = 'SELECT_TABLE';
const UNSEAT_ATTENDEE = 'UNSEAT_ATTENDEE';

export const types = {
  GET_ATTENDEES_BY_LAYOUT_ID,
  GET_ATTENDEES_BY_LAYOUT_ID_SUCCESS,
  GET_ATTENDEES_BY_LAYOUT_ID_FAILURE,
  CREATE_ATTENDEE,
  CREATE_ATTENDEE_SUCCESS,
  CREATE_ATTENDEE_FAILURE,
  UPDATE_ATTENDEE,
  UPDATE_ATTENDEE_SUCCESS,
  UPDATE_ATTENDEE_FAILURE,
  UPDATE_ATTENDEES,
  UPDATE_ATTENDEES_SUCCESS,
  UPDATE_ATTENDEES_FAILURE,
  DELETE_ATTENDEE,
  DELETE_ATTENDEE_SUCCESS,
  DELETE_ATTENDEE_FAILURE,
  SELECT_ATTENDEE,
  UNSEAT_ATTENDEE,
  SELECT_TABLE,
};

type Types =
  | typeof GET_ATTENDEES_BY_LAYOUT_ID
  | typeof GET_ATTENDEES_BY_LAYOUT_ID_SUCCESS
  | typeof GET_ATTENDEES_BY_LAYOUT_ID_FAILURE
  | typeof CREATE_ATTENDEE
  | typeof CREATE_ATTENDEE_SUCCESS
  | typeof CREATE_ATTENDEE_FAILURE
  | typeof UPDATE_ATTENDEE
  | typeof UPDATE_ATTENDEE_SUCCESS
  | typeof UPDATE_ATTENDEE_FAILURE
  | typeof UPDATE_ATTENDEES
  | typeof UPDATE_ATTENDEES_SUCCESS
  | typeof UPDATE_ATTENDEES_FAILURE
  | typeof DELETE_ATTENDEE
  | typeof DELETE_ATTENDEE_SUCCESS
  | typeof DELETE_ATTENDEE_FAILURE
  | typeof SELECT_ATTENDEE
  | typeof UNSEAT_ATTENDEE
  | typeof SELECT_TABLE;

// State
export type State = {
  attendees: Attendee[];
  selectedId: number;
  attendeesLoading: boolean;
  selectedTableId: string;
};

const initialState: State = {
  attendees: [] as Attendee[],
  selectedId: 0,
  attendeesLoading: false,
  selectedTableId: undefined,
};

// Action Creators
export const GetAttendeesByLayoutId = (layoutId: string) => ({
  type: GET_ATTENDEES_BY_LAYOUT_ID as typeof GET_ATTENDEES_BY_LAYOUT_ID,
  layoutId,
});

export const GetAttendeesByLayoutIdSuccess = (attendees: Attendee[]) => ({
  type: GET_ATTENDEES_BY_LAYOUT_ID_SUCCESS as typeof GET_ATTENDEES_BY_LAYOUT_ID_SUCCESS,
  attendees,
});

export const GetAttendeesByLayoutIdFailure = (error: any) => ({
  type: GET_ATTENDEES_BY_LAYOUT_ID_FAILURE as typeof GET_ATTENDEES_BY_LAYOUT_ID_FAILURE,
  error,
});

export const CreateAttendee = (attendee: Attendee) => ({
  type: CREATE_ATTENDEE as typeof CREATE_ATTENDEE,
  attendee,
});

export const CreateAttendeeSuccess = (attendee: Attendee) => ({
  type: CREATE_ATTENDEE_SUCCESS as typeof CREATE_ATTENDEE_SUCCESS,
  attendee,
});

export const CreateAttendeeFailure = (error: any) => ({
  type: CREATE_ATTENDEE_FAILURE as typeof CREATE_ATTENDEE_FAILURE,
  error,
});

export const UpdateAttendee = (attendee: Attendee) => ({
  type: UPDATE_ATTENDEE as typeof UPDATE_ATTENDEE,
  attendee,
});

export const UpdateAttendeeSuccess = (attendee: Attendee) => ({
  type: UPDATE_ATTENDEE_SUCCESS as typeof UPDATE_ATTENDEE_SUCCESS,
  attendee,
});

export const UpdateAttendeeFailure = (error: any) => ({
  type: UPDATE_ATTENDEE_FAILURE as typeof UPDATE_ATTENDEE_FAILURE,
  error,
});

export const UpdateAttendees = (attendees?: Attendee[]) => ({
  type: UPDATE_ATTENDEES as typeof UPDATE_ATTENDEES,
  attendees,
});

export const UpdateAttendeesSuccess = (attendees: Attendee[]) => ({
  type: UPDATE_ATTENDEES_SUCCESS as typeof UPDATE_ATTENDEES_SUCCESS,
  attendees,
});

export const UpdateAttendeesFailure = (error: any) => ({
  type: UPDATE_ATTENDEES_FAILURE as typeof UPDATE_ATTENDEES_FAILURE,
  error,
});

export const DeleteAttendee = (attendee: Attendee) => ({
  type: DELETE_ATTENDEE as typeof DELETE_ATTENDEE,
  attendee,
});

export const DeleteAttendeeSuccess = (attendee: Attendee) => ({
  type: DELETE_ATTENDEE_SUCCESS as typeof DELETE_ATTENDEE_SUCCESS,
  attendee,
});

export const DeleteAttendeeFailure = (error: any) => ({
  type: DELETE_ATTENDEE_FAILURE as typeof DELETE_ATTENDEE_FAILURE,
  error,
});

export const SelectAttendee = (selectedId: number) => ({
  type: SELECT_ATTENDEE as typeof SELECT_ATTENDEE,
  selectedId,
});

export const SelectTable = (selectedId: string) => ({
  type: SELECT_TABLE as typeof SELECT_TABLE,
  selectedId,
});

export const UnseatAttendee = (
  chairNumber: number,
  tableInstanceId: string,
  shiftSeats: boolean = false
) => ({
  type: UNSEAT_ATTENDEE as typeof UNSEAT_ATTENDEE,
  chairNumber,
  tableInstanceId,
  shiftSeats,
});

export type GetAttendeesByLayoutIdAction = ReturnType<
  typeof GetAttendeesByLayoutId
>;
export type GetAttendeesByLayoutIdSuccessAction = ReturnType<
  typeof GetAttendeesByLayoutIdSuccess
>;
export type GetAttendeesByLayoutIdFailureAction = ReturnType<
  typeof GetAttendeesByLayoutIdFailure
>;
export type CreateAttendeeAction = ReturnType<typeof CreateAttendee>;
export type CreateAttendeeSuccessAction = ReturnType<
  typeof CreateAttendeeSuccess
>;
export type CreateAttendeeFailureAction = ReturnType<
  typeof CreateAttendeeFailure
>;
export type UpdateAttendeeAction = ReturnType<typeof UpdateAttendee>;
export type UpdateAttendeeSuccessAction = ReturnType<
  typeof UpdateAttendeeSuccess
>;
export type UpdateAttendeeFailureAction = ReturnType<
  typeof UpdateAttendeeFailure
>;
export type UpdateAttendeesAction = ReturnType<typeof UpdateAttendees>;
export type UpdateAttendeesSuccessAction = ReturnType<
  typeof UpdateAttendeesSuccess
>;
export type UpdateAttendeesFailureAction = ReturnType<
  typeof UpdateAttendeesFailure
>;
export type DeleteAttendeeAction = ReturnType<typeof DeleteAttendee>;
export type DeleteAttendeeSuccessAction = ReturnType<
  typeof DeleteAttendeeSuccess
>;
export type DeleteAttendeeFailureAction = ReturnType<
  typeof DeleteAttendeeFailure
>;
export type SelectAttendeeAction = ReturnType<typeof SelectAttendee>;
export type SelectTableAction = ReturnType<typeof SelectTable>;
export type UnseatAttendeeAction = ReturnType<typeof UnseatAttendee>;

export type Action =
  | GetAttendeesByLayoutIdAction
  | GetAttendeesByLayoutIdSuccessAction
  | GetAttendeesByLayoutIdFailureAction
  | CreateAttendeeAction
  | CreateAttendeeSuccessAction
  | UpdateAttendeeFailureAction
  | UpdateAttendeeAction
  | UpdateAttendeeSuccessAction
  | UpdateAttendeeFailureAction
  | DeleteAttendeeAction
  | DeleteAttendeeSuccessAction
  | DeleteAttendeeFailureAction
  | SelectAttendeeAction
  | UnseatAttendeeAction
  | SelectTableAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_ATTENDEES_BY_LAYOUT_ID]: (
    state: State,
    action: GetAttendeesByLayoutIdAction
  ): State => ({
    ...state,
    attendeesLoading: true,
  }),
  [GET_ATTENDEES_BY_LAYOUT_ID_SUCCESS]: (
    state: State,
    action: GetAttendeesByLayoutIdSuccessAction
  ): State => ({
    ...state,
    attendeesLoading: false,
    attendees: action.attendees,
  }),
  [GET_ATTENDEES_BY_LAYOUT_ID_FAILURE]: (
    state: State,
    action: GetAttendeesByLayoutIdFailureAction
  ): State => ({
    ...state,
    attendeesLoading: false,
  }),

  [CREATE_ATTENDEE]: (state: State, action: CreateAttendeeAction): State => ({
    ...state,
    attendeesLoading: true,
  }),
  [CREATE_ATTENDEE_SUCCESS]: (
    state: State,
    action: CreateAttendeeSuccessAction
  ): State => ({
    ...state,
    attendees: [...state.attendees, action.attendee],
    attendeesLoading: false,
  }),
  [CREATE_ATTENDEE_FAILURE]: (
    state: State,
    action: CreateAttendeeFailureAction
  ): State => ({
    ...state,
    attendeesLoading: false,
  }),

  [UPDATE_ATTENDEE]: (state: State, action: UpdateAttendeeAction): State => ({
    ...state,
    attendeesLoading: true,
  }),
  [UPDATE_ATTENDEE_SUCCESS]: (
    state: State,
    action: UpdateAttendeeSuccessAction
  ): State => ({
    ...state,
    attendees: state.attendees.map((attendee) =>
      attendee.id === action.attendee.id ? action.attendee : attendee
    ),
    attendeesLoading: false,
  }),
  [UPDATE_ATTENDEE_FAILURE]: (
    state: State,
    action: UpdateAttendeeFailureAction
  ): State => ({
    ...state,
    attendeesLoading: false,
  }),

  [UPDATE_ATTENDEES]: (state: State, action: UpdateAttendeesAction): State => ({
    ...state,
    attendeesLoading: true,
  }),
  [UPDATE_ATTENDEES_SUCCESS]: (
    state: State,
    action: UpdateAttendeesSuccessAction
  ): State => ({
    ...state,
    attendees: action.attendees,
    attendeesLoading: false,
  }),
  [UPDATE_ATTENDEES_FAILURE]: (
    state: State,
    action: UpdateAttendeesFailureAction
  ): State => ({
    ...state,
    attendeesLoading: false,
  }),

  [DELETE_ATTENDEE]: (state: State, action: DeleteAttendeeAction): State => ({
    ...state,
    attendeesLoading: true,
  }),
  [DELETE_ATTENDEE_SUCCESS]: (
    state: State,
    action: DeleteAttendeeSuccessAction
  ): State => ({
    ...state,
    attendees: state.attendees.filter(
      (attendee) => attendee.id !== action.attendee.id
    ),
    attendeesLoading: false,
  }),
  [DELETE_ATTENDEE_FAILURE]: (
    state: State,
    action: DeleteAttendeeFailureAction
  ): State => ({
    ...state,
    attendeesLoading: false,
  }),
  [SELECT_ATTENDEE]: (state: State, action: SelectAttendeeAction): State => ({
    ...state,
    selectedId: action.selectedId,
  }),
  [SELECT_TABLE]: (state: State, action: SelectTableAction): State => ({
    ...state,
    selectedTableId: action.selectedId,
  }),
  [UNSEAT_ATTENDEE]: (state: State, action: UnseatAttendeeAction): State => ({
    ...state,
  }),
});

export const getEntrees = (
  attendees: Attendee[]
): { [meal: string]: number } => {
  const ret = attendees
    .filter((attendee: Attendee) => attendee.meal)
    .reduce((acc: { [meal: string]: number }, attendee: Attendee) => {
      const key = attendee.meal;
      if (!acc[key]) {
        acc[key] = 1;
      } else {
        acc[key]++;
      }
      return acc;
    }, {});
  return ret;
};

export const getSelectedAttendee = (
  attendees: Attendee[],
  selectedAttendeeId: number
): Attendee => {
  const ret = attendees.find(
    (attendee: Attendee) => attendee.id === selectedAttendeeId
  );
  return ret;
};
