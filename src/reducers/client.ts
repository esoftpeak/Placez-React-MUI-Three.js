import createReducer from './helpers/createReducer';
import { Client } from '../api';

// Action Types
const GET_CLIENTS = 'GET_CLIENTS';
const GET_CLIENTS_SUCCESS = 'GET_CLIENTS_SUCCESS';
const GET_CLIENTS_FAILURE = 'GET_CLIENTS_FAILURE';

const UPDATE_CLIENT = 'UPDATE_CLIENT';
const UPDATE_CLIENT_SUCCESS = 'UPDATE_CLIENT_SUCCESS';
const UPDATE_CLIENT_FAILURE = 'UPDATE_CLIENT_FAILURE';

const CREATE_CLIENT = 'CREATE_CLIENT';
const CREATE_CLIENT_SUCCESS = 'CREATE_CLIENT_SUCCESS';
const CREATE_CLIENT_FAILURE = 'CREATE_CLIENT_FAILURE';

const DELETE_CLIENT = 'DELETE_CLIENT';
const DELETE_CLIENT_SUCCESS = 'DELETE_CLIENT_SUCCESS';
const DELETE_CLIENT_FAILURE = 'DELETE_CLIENT_FAILURE';

const SELECT_CLIENT = 'SELECT_CLIENT';

export const types = {
  GET_CLIENTS,
  GET_CLIENTS_SUCCESS,
  GET_CLIENTS_FAILURE,
  UPDATE_CLIENT,
  UPDATE_CLIENT_SUCCESS,
  UPDATE_CLIENT_FAILURE,
  CREATE_CLIENT,
  CREATE_CLIENT_SUCCESS,
  CREATE_CLIENT_FAILURE,
  DELETE_CLIENT,
  DELETE_CLIENT_SUCCESS,
  DELETE_CLIENT_FAILURE,
  SELECT_CLIENT,
};

type Types =
  | typeof GET_CLIENTS
  | typeof GET_CLIENTS_SUCCESS
  | typeof GET_CLIENTS_FAILURE
  | typeof UPDATE_CLIENT
  | typeof UPDATE_CLIENT_SUCCESS
  | typeof UPDATE_CLIENT_FAILURE
  | typeof CREATE_CLIENT
  | typeof CREATE_CLIENT_SUCCESS
  | typeof CREATE_CLIENT_FAILURE
  | typeof DELETE_CLIENT
  | typeof DELETE_CLIENT_SUCCESS
  | typeof DELETE_CLIENT_FAILURE
  | typeof SELECT_CLIENT;

// State
export type State = {
  clients: Client[];
  selectedId: number | null;
  clientSaveError: any;
  isClientSaved: boolean;
  selectedClientId?: number;
};
const initialState: State = {
  clients: [],
  clientSaveError: null,
  selectedId: null,
  isClientSaved: false,
};

// Action Creators
export const GetClients = () => ({
  type: GET_CLIENTS as typeof GET_CLIENTS,
});

export const GetClientsSuccess = (clients: Client[]) => ({
  type: GET_CLIENTS_SUCCESS as typeof GET_CLIENTS_SUCCESS,
  clients,
});

export const GetClientsFailure = (error: any) => ({
  type: GET_CLIENTS_FAILURE as typeof GET_CLIENTS_FAILURE,
  error,
});

export const UpdateClient = (client: Client) => ({
  type: UPDATE_CLIENT as typeof UPDATE_CLIENT,
  client,
});

export const UpdateClientSuccess = (client: Client) => ({
  type: UPDATE_CLIENT_SUCCESS as typeof UPDATE_CLIENT_SUCCESS,
  client,
});

export const UpdateClientFailure = (error: any) => ({
  type: UPDATE_CLIENT_FAILURE as typeof UPDATE_CLIENT_FAILURE,
  error,
});

export const CreateClient = (client: Client) => ({
  type: CREATE_CLIENT as typeof CREATE_CLIENT,
  client,
});

export const CreateClientSuccess = (client: Client) => ({
  type: CREATE_CLIENT_SUCCESS as typeof CREATE_CLIENT_SUCCESS,
  client,
});

export const CreateClientFailure = (error: any) => ({
  type: CREATE_CLIENT_FAILURE as typeof CREATE_CLIENT_FAILURE,
  error,
});

export const DeleteClient = (clientId: number) => ({
  type: DELETE_CLIENT as typeof DELETE_CLIENT,
  clientId,
});

export const DeleteClientSuccess = (clientId: number) => ({
  type: DELETE_CLIENT_SUCCESS as typeof DELETE_CLIENT_SUCCESS,
  clientId,
});

export const DeleteClientFailure = (error: any) => ({
  type: DELETE_CLIENT_FAILURE as typeof DELETE_CLIENT_FAILURE,
  error,
});

export const SelectClient = (selectedId: number) => ({
  type: SELECT_CLIENT as typeof SELECT_CLIENT,
  selectedId,
});

export type GetClientsAction = ReturnType<typeof GetClients>;
export type GetClientsSuccessAction = ReturnType<typeof GetClientsSuccess>;
export type GetClientsFailureAction = ReturnType<typeof GetClientsFailure>;
export type UpdateClientAction = ReturnType<typeof UpdateClient>;
export type UpdateClientSuccessAction = ReturnType<typeof UpdateClientSuccess>;
export type UpdateClientFailureAction = ReturnType<typeof UpdateClientFailure>;
export type CreateClientAction = ReturnType<typeof CreateClient>;
export type CreateClientSuccessAction = ReturnType<typeof CreateClientSuccess>;
export type CreateClientFailureAction = ReturnType<typeof CreateClientFailure>;
export type DeleteClientAction = ReturnType<typeof DeleteClient>;
export type DeleteClientSuccessAction = ReturnType<typeof DeleteClientSuccess>;
export type DeleteClientFailureAction = ReturnType<typeof DeleteClientFailure>;
export type SelectClientAction = ReturnType<typeof SelectClient>;
export type Action =
  | GetClientsAction
  | GetClientsSuccessAction
  | GetClientsFailureAction
  | UpdateClientAction
  | UpdateClientSuccessAction
  | UpdateClientFailureAction
  | CreateClientAction
  | CreateClientSuccessAction
  | CreateClientFailureAction
  | DeleteClientAction
  | DeleteClientSuccessAction
  | DeleteClientFailureAction
  | SelectClientAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_CLIENTS]: (state: State, action: GetClientsAction): State => state,
  [GET_CLIENTS_SUCCESS]: (
    state: State,
    action: GetClientsSuccessAction
  ): State => ({
    ...state,
    clients: action.clients,
  }),
  [GET_CLIENTS_FAILURE]: (
    state: State,
    action: GetClientsFailureAction
  ): State => state,
  [UPDATE_CLIENT]: (state: State, action: UpdateClientAction): State => state,
  [UPDATE_CLIENT_SUCCESS]: (
    state: State,
    action: UpdateClientSuccessAction
  ): State => ({
    ...state,
    clients: state.clients.map((client) =>
      client.id === action.client.id ? { ...client, ...action.client } : client
    ),
  }),
  [UPDATE_CLIENT_FAILURE]: (
    state: State,
    action: UpdateClientFailureAction
  ): State => state,
  [CREATE_CLIENT]: (state: State, action: CreateClientAction): State => state,
  [CREATE_CLIENT_SUCCESS]: (
    state: State,
    action: CreateClientSuccessAction
  ): State => ({
    ...state,
    clients: state.clients.concat([action.client]),
  }),
  [CREATE_CLIENT_FAILURE]: (
    state: State,
    action: CreateClientFailureAction
  ): State => ({
    ...state,
    clientSaveError: action.error,
  }),
  [DELETE_CLIENT]: (state: State, action: DeleteClientAction): State => state,
  [DELETE_CLIENT_SUCCESS]: (
    state: State,
    action: DeleteClientSuccessAction
  ): State => ({
    ...state,
    clients: state.clients.filter((client) => client.id !== action.clientId),
  }),
  [DELETE_CLIENT_FAILURE]: (
    state: State,
    action: DeleteClientFailureAction
  ): State => state,
  [SELECT_CLIENT]: (state: State, action: SelectClientAction): State => {
    return {
      ...state,
      selectedId: action.selectedId,
    };
  },
});

// Selectors
export const getClientById = (clients: Client[], clientId: number) => {
  return clients.find((client) => {
    return client.id == clientId;
  }); // tslint:disable-line
};
