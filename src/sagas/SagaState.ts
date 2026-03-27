import { sagas } from './index';

export type SagaName = keyof typeof sagas;

export type SagaState = { [key in SagaName]: boolean };

export const getInitialSagaState = (): SagaState => {
  const state: SagaState = {} as SagaState;
  Object.keys(sagas).forEach((key) => (state[key] = false));
  return state;
};

export function sagasComplete(state: SagaState): boolean {
  return Object.keys(state).reduce(
    (complete, sagaName) => complete && state[sagaName],
    true
  );
}
