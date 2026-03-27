import createReducer from './helpers/createReducer';
import { PhotosphereSetup } from '../components/Blue/models';
import {
  GlobalViewState,
  ViewState,
  SaveBarState,
  ToolState,
} from '../models/GlobalState';
import { ReduxState } from '.';
import {
  guestRole,
  userIsInRole,
  allowUpdateAttendee,
  allowUpdateLayout,
  adminRole,
} from '../sharing/utils/userHelpers';

// Action Types]
const GLOBAL_STATE_INITIALIZING = 'GLOBAL_STATE_INITIALIZING';
const GLOBAL_STATE_INITIALIZED = 'GLOBAL_STATE_INITIALIZED';
const GLOBAL_VIEW_STATE = 'GLOBAL_VIEW_STATE';
const VIEW_STATE = 'VIEW_STATE';
const UPDATE_PHOTO_SPHERE_SETUP = 'UPDATE_PHOTO_SPHERE_SETUP';
const TOOL_STATE = 'TOOL_STATE';
const LICENSE_TYPE_STATE = 'LICENSE_TYPE_STATE';
const DISABLE_NAVIGATION = 'DISABLE_NAVIGATION';

export enum LicenseType {
  Placez = 'Placez',
  PlacezPlus = 'Placez Plus',
  PlacezPro = 'Placez Pro',
}

export const types = {
  GLOBAL_STATE_INITIALIZING,
  GLOBAL_STATE_INITIALIZED,
  GLOBAL_VIEW_STATE,
  VIEW_STATE,
  UPDATE_PHOTO_SPHERE_SETUP,
  TOOL_STATE,
  LICENSE_TYPE_STATE,
  DISABLE_NAVIGATION,
};

type Types =
  | typeof GLOBAL_STATE_INITIALIZING
  | typeof GLOBAL_STATE_INITIALIZED
  | typeof GLOBAL_VIEW_STATE
  | typeof VIEW_STATE
  | typeof UPDATE_PHOTO_SPHERE_SETUP
  | typeof TOOL_STATE
  | typeof LICENSE_TYPE_STATE
  | typeof DISABLE_NAVIGATION;

// State
export type State = {
  globalStateInitialized: boolean;
  globalViewState: GlobalViewState;
  viewState: ViewState;
  photoSphereSetup: PhotosphereSetup;
  saveBarState: SaveBarState;
  licenseState: LicenseType;
  toolState: ToolState;
  navigationDisabled: boolean;
};

const initialState: State = {
  globalStateInitialized: false,
  globalViewState: GlobalViewState.Fixtures,
  viewState: ViewState.TwoDView,
  photoSphereSetup: PhotosphereSetup.Home,
  saveBarState: SaveBarState.None,
  licenseState: LicenseType.Placez,
  toolState: ToolState.Default,
  navigationDisabled: false,
};

// Action Creators
export const GlobalStateInitializing = () => ({
  type: GLOBAL_STATE_INITIALIZING as typeof GLOBAL_STATE_INITIALIZING,
});

export const SetGlobalStateInitialized = (globalStateInitialized: boolean) => ({
  type: GLOBAL_STATE_INITIALIZED as typeof GLOBAL_STATE_INITIALIZED,
  globalStateInitialized,
});

export const ChangeGlobalViewState = (globalViewState: GlobalViewState) => ({
  type: GLOBAL_VIEW_STATE as typeof GLOBAL_VIEW_STATE,
  globalViewState,
});

export const ChangeViewState = (
  viewState: ViewState,
  currentViewState: ViewState
) => ({
  type: VIEW_STATE as typeof VIEW_STATE,
  viewState,
  currentViewState,
});

export const ChangeToolState = (toolState: ToolState) => ({
  type: TOOL_STATE as typeof TOOL_STATE,
  toolState,
});

export const UpdatePhotosphereSetup = (photoSphereSetup: PhotosphereSetup) => ({
  type: UPDATE_PHOTO_SPHERE_SETUP as typeof UPDATE_PHOTO_SPHERE_SETUP,
  photoSphereSetup,
});

export const ChangeLicenseTypeState = (licenseState: LicenseType) => ({
  type: LICENSE_TYPE_STATE as typeof LICENSE_TYPE_STATE,
  licenseState,
});

export const DisableNavigation = (disable: boolean) => ({
  type: DISABLE_NAVIGATION as typeof DISABLE_NAVIGATION,
  disable,
});

export type GlobalStateInitializingAction = ReturnType<
  typeof GlobalStateInitializing
>;
export type SetGlobalStateInitializedAction = ReturnType<
  typeof SetGlobalStateInitialized
>;
export type ChangeGlobalViewStateAction = ReturnType<
  typeof ChangeGlobalViewState
>;
export type ChangeViewStateAction = ReturnType<
  typeof ChangeViewState
>;
export type UpdatePhotosphereSetupAction = ReturnType<
  typeof UpdatePhotosphereSetup
>;
export type ChangeToolStateAction = ReturnType<typeof ChangeToolState>;
export type ChangeLicenseTypeState = ReturnType<typeof ChangeLicenseTypeState>;
export type DisableNavigationAction = ReturnType<typeof DisableNavigation>;

export type Action =
  | GlobalStateInitializingAction
  | SetGlobalStateInitializedAction
  | ChangeGlobalViewStateAction
  | ChangeViewStateAction
  | SetGlobalStateInitializedAction
  | ChangeGlobalViewStateAction
  | ChangeLicenseTypeState
  | DisableNavigationAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GLOBAL_STATE_INITIALIZING]: (
    state: State,
    action: GlobalStateInitializingAction
  ): State => ({
    ...state,
    // globalStateInitialized: false,
  }),
  [GLOBAL_STATE_INITIALIZED]: (
    state: State,
    action: SetGlobalStateInitializedAction
  ): State => ({
    ...state,
    globalStateInitialized: action.globalStateInitialized,
  }),
  [GLOBAL_VIEW_STATE]: (
    state: State,
    action: ChangeGlobalViewStateAction
  ): State => ({
    ...state,
    globalViewState: action.globalViewState,
  }),
  [VIEW_STATE]: (
    state: State,
    action: ChangeViewStateAction
  ): State => ({
    ...state,
    viewState: action.viewState,
  }),
  [UPDATE_PHOTO_SPHERE_SETUP]: (
    state: State,
    action: UpdatePhotosphereSetupAction
  ): State => ({
    ...state,
    photoSphereSetup: action.photoSphereSetup,
  }),
  [TOOL_STATE]: (state: State, action: ChangeToolStateAction): State => ({
    ...state,
    toolState: action.toolState,
  }),
  [LICENSE_TYPE_STATE]: (
    state: State,
    action: ChangeLicenseTypeState
  ): State => ({
    ...state,
    licenseState: action.licenseState,
  }),
  [DISABLE_NAVIGATION]: (
    state: State,
    action: DisableNavigationAction
  ): State => ({
    ...state,
    navigationDisabled: action.disable,
  }),
});

export const getGlobalViewState = (state: ReduxState) => {
  return state.globalstate.globalViewState;
};

export const getViewState = (state: ReduxState) => {
  return state.globalstate.viewState;
};

export const getSaveBarState = (state: ReduxState) => {
  return state.globalstate.saveBarState;
};

export const isGuest = (state: ReduxState) => {
  return userIsInRole(state.oidc.user, guestRole);
};

export const isAdmin = (state: ReduxState) => {
  return userIsInRole(state.oidc.user, adminRole);
};

export const guestUpdateAttendee = (state: ReduxState) => {
  if (userIsInRole(state.oidc.user, guestRole)) {
    return allowUpdateAttendee(state.oidc.user);
  } else {
    return true;
  }
};

export const guestAllowUpdateLayout = (state: ReduxState): boolean => {
  return allowUpdateLayout(state.oidc.user);
};

export const canEditLayout = (state: ReduxState): boolean => {
  return !isGuest(state) || (isGuest(state) && guestAllowUpdateLayout(state));
};
