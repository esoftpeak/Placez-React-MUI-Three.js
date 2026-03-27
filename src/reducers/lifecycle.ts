import createReducer from './helpers/createReducer';
import { SagaState, getInitialSagaState, SagaName } from '../sagas/SagaState';

// Action Types
const APPLICATION_START = 'APPLICATION_START';
const SAGA_READY = 'SAGA_READY';
export const types = {
  APPLICATION_START,
  SAGA_READY,
};
type Types = typeof APPLICATION_START | typeof SAGA_READY;

// State
export type State = {
  started: boolean;
  sagas: SagaState;
  sagasReady: boolean;
};
const initialState: State = {
  started: false,
  sagas: getInitialSagaState(),
  sagasReady: false,
};

// Action Creators
export const ApplicationStart = (isAppStarted: boolean) => ({
  type: APPLICATION_START as typeof APPLICATION_START,
  isAppStarted,
});

export const SagaReady = (sagaName: SagaName) => ({
  type: SAGA_READY as typeof SAGA_READY,
  sagaName,
});

type ApplicationStartAction = ReturnType<typeof ApplicationStart>;
type SagaReadyAction = ReturnType<typeof SagaReady>;
export type Action = SagaReadyAction | ApplicationStartAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [APPLICATION_START]: (
    state: State,
    action: ApplicationStartAction
  ): State => ({
    ...state,
    started: action.isAppStarted,
  }),
  [SAGA_READY]: (state: State, action: SagaReadyAction): State => {
    const newSagas = {
      ...state.sagas,
      [action.sagaName]: true,
    };

    return {
      ...state,
      sagas: newSagas,
      sagasReady: sagasComplete(newSagas),
    };
  },
});

function sagasComplete(state: SagaState): boolean {
  return Object.keys(state).reduce(
    (complete, sagaName) => complete && state[sagaName],
    true
  );
}
