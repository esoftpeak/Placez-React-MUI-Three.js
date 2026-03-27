import createReducer from './helpers/createReducer';

// Action Types
const NAVIGATE = 'NAVIGATE';
const TOAST_MESSAGE = 'TOAST_MESSAGE';

export const types = {
  NAVIGATE,
  TOAST_MESSAGE,
};

type Types = typeof NAVIGATE | typeof TOAST_MESSAGE;

// State
export type State = {
  target: string;
  toastMessage: string | null;
  toastDuration: number;
  toastColor: string;
};
const initialState: State = {
  target: null,
  toastMessage: null,
  toastDuration: 3000,
  toastColor: '#313131',
};

// Action Creators
export const NavigateToAction = (target: string) => ({
  type: NAVIGATE as typeof NAVIGATE,
  target,
});

export const ToastMessage = (
  message: string,
  duration?: number,
  color?: string
) => ({
  type: TOAST_MESSAGE as typeof TOAST_MESSAGE,
  message,
  duration,
  color,
});

export type NavigateToAction = ReturnType<typeof NavigateToAction>;
export type ToastMessageAction = ReturnType<typeof ToastMessage>;

export type Action = NavigateToAction | ToastMessageAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [NAVIGATE]: (state: State, action: NavigateToAction): State => ({
    ...state,
    target: action.target,
  }),
  [TOAST_MESSAGE]: (state: State, action: ToastMessageAction): State => ({
    ...state,
    toastMessage: action.message,
    toastDuration: action.duration ?? 3000,
    toastColor: action.color ?? '#313131',
  }),
});

// Selectors
