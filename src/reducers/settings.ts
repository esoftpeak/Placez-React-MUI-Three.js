import createReducer from './helpers/createReducer';
import { PickList, PickListOption, UserSetting } from '../api';
import { FilterMap } from '../components/MultiFilter/Filters';

// Action Types
const GET_SETTINGS = 'GET_SETTINGS';
const GET_SETTINGS_SUCCESS = 'GET_SETTINGS_SUCCESS';
const GET_SETTINGS_FAILURE = 'GET_SETTINGS_FAILURE';

const GET_USER_SETTINGS = 'GET_USER_SETTINGS';
const GET_USER_SETTINGS_SUCCESS = 'GET_USER_SETTINGS_SUCCESS';
const GET_USER_SETTINGS_FAILURE = 'GET_USER_SETTINGS_FAILURE';

const ADD_PICKLISTOPTION = 'ADD_PICKLISTOPTION';
const ADD_PICKLISTOPTION_SUCCESS = 'ADD_PICKLISTOPTION_SUCCESS';
const ADD_PICKLISTOPTION_FAILURE = 'ADD_PICKLISTOPTION_FAILURE';

const UPDATE_SETTING = 'UPDATE_SETTING';
const UPDATE_SETTING_SUCCESS = 'UPDATE_SETTING_SUCCESS';
const UPDATE_SETTING_FAILURE = 'UPDATE_SETTING_FAILURE';

const UPDATE_USER_SETTING = 'UPDATE_USER_SETTING';
const UPDATE_USER_SETTING_SUCCESS = 'UPDATE_USER_SETTING_SUCCESS';
const UPDATE_USER_SETTING_FAILURE = 'UPDATE_USER_SETTING_FAILURE';

const SET_GLOBAL_FILTER = 'SET_GLOBAL_FILTER';
const SET_SCENE_FILTER = 'SET_SCENE_FILTER';

export const types = {
  GET_SETTINGS,
  GET_SETTINGS_SUCCESS,
  GET_SETTINGS_FAILURE,
  GET_USER_SETTINGS,
  GET_USER_SETTINGS_SUCCESS,
  GET_USER_SETTINGS_FAILURE,
  ADD_PICKLISTOPTION,
  ADD_PICKLISTOPTION_SUCCESS,
  ADD_PICKLISTOPTION_FAILURE,
  UPDATE_SETTING,
  UPDATE_SETTING_SUCCESS,
  UPDATE_SETTING_FAILURE,
  UPDATE_USER_SETTING,
  UPDATE_USER_SETTING_SUCCESS,
  UPDATE_USER_SETTING_FAILURE,
  SET_GLOBAL_FILTER,
  SET_SCENE_FILTER,
};

type Types =
  | typeof GET_SETTINGS
  | typeof GET_SETTINGS_SUCCESS
  | typeof GET_SETTINGS_FAILURE
  | typeof GET_USER_SETTINGS
  | typeof GET_USER_SETTINGS_SUCCESS
  | typeof GET_USER_SETTINGS_FAILURE
  | typeof UPDATE_SETTING
  | typeof UPDATE_SETTING_SUCCESS
  | typeof UPDATE_SETTING_FAILURE
  | typeof UPDATE_USER_SETTING
  | typeof UPDATE_USER_SETTING_SUCCESS
  | typeof UPDATE_USER_SETTING_FAILURE
  | typeof ADD_PICKLISTOPTION
  | typeof ADD_PICKLISTOPTION_SUCCESS
  | typeof ADD_PICKLISTOPTION_FAILURE
  | typeof SET_GLOBAL_FILTER
  | typeof SET_SCENE_FILTER;

// State
export type State = {
  unit: number;
  language: number;
  currency: number;
  type: number;
  timeFormat: number;
  dateFormat: number;
  pickLists: PickList[];
  userSettings: UserSetting[];
  globalFilter: string;
  settingsReady: boolean;
  twentyFourHourTime: boolean;
  itemLabelSize: number;
  itemInfoLabelSize: number;
  tableNumberLabelSize: number;
  chairNumberLabelSize: number;
  sceneFilters: FilterMap;
};

const initialState: State = {
  unit: 0,
  language: 0,
  currency: 0,
  type: 0,
  timeFormat: 0,
  dateFormat: 0,
  pickLists: [] as PickList[],
  userSettings: [] as UserSetting[],
  globalFilter: '',
  settingsReady: false,
  twentyFourHourTime: false,
  itemLabelSize: 12,
  itemInfoLabelSize: 12,
  tableNumberLabelSize: 12,
  chairNumberLabelSize: 12,
  sceneFilters: {},
};

// Action Creators
export const GetSettings = () => ({
  type: GET_SETTINGS as typeof GET_SETTINGS,
});

export const GetSettingsSuccess = (settings: any) => ({
  type: GET_SETTINGS_SUCCESS as typeof GET_SETTINGS_SUCCESS,
  settings,
});

export const GetSettingsFailure = (error: any) => ({
  type: GET_SETTINGS_FAILURE as typeof GET_SETTINGS_FAILURE,
  error,
});

export const UpdateSetting = (setting: any) => ({
  type: UPDATE_SETTING as typeof UPDATE_SETTING,
  setting,
});

export const UpdateSettingSuccess = (setting: any) => ({
  type: UPDATE_SETTING_SUCCESS as typeof UPDATE_SETTING_SUCCESS,
  setting,
});

export const UpdateSettingFailure = (error: any) => ({
  type: UPDATE_SETTING_FAILURE as typeof UPDATE_SETTING_FAILURE,
  error,
});

export const GetUserSettings = () => ({
  type: GET_USER_SETTINGS as typeof GET_USER_SETTINGS,
});

export const GetUserSettingsSuccess = (userSettings: UserSetting[]) => ({
  type: GET_USER_SETTINGS_SUCCESS as typeof GET_USER_SETTINGS_SUCCESS,
  userSettings,
});

export const GetUserSettingsFailure = (error: any) => ({
  type: GET_USER_SETTINGS_FAILURE as typeof GET_USER_SETTINGS_FAILURE,
  error,
});

export const UpdateUserSetting = (userSetting: UserSetting) => ({
  type: UPDATE_USER_SETTING as typeof UPDATE_USER_SETTING,
  userSetting,
});

export const UpdateUserSettingSuccess = (userSetting: UserSetting) => ({
  type: UPDATE_USER_SETTING_SUCCESS as typeof UPDATE_USER_SETTING_SUCCESS,
  userSetting,
});

export const UpdateUserSettingFailure = (error: any) => ({
  type: UPDATE_USER_SETTING_FAILURE as typeof UPDATE_USER_SETTING_FAILURE,
  error,
});

export const AddPickListOption = (
  newOptions: PickListOption[],
  prevOptions: PickListOption[]
) => ({
  type: ADD_PICKLISTOPTION as typeof ADD_PICKLISTOPTION,
  newOptions,
  prevOptions,
});

export const AddPickListOptionSuccess = (options: PickListOption[]) => ({
  type: ADD_PICKLISTOPTION_SUCCESS as typeof ADD_PICKLISTOPTION_SUCCESS,
  options,
});

export const AddPickListOptionsFailure = (error: any) => ({
  type: ADD_PICKLISTOPTION_FAILURE as typeof ADD_PICKLISTOPTION_FAILURE,
  error,
});

export const SetGlobalFilter = (filter: string) => ({
  type: SET_GLOBAL_FILTER as typeof SET_GLOBAL_FILTER,
  filter,
});

export const SetSceneFilters = (filters: FilterMap) => ({
  type: SET_SCENE_FILTER as typeof SET_SCENE_FILTER,
  filters,
});

export type GetSettingsAction = ReturnType<typeof GetSettings>;
export type GetSettingsSuccessAction = ReturnType<typeof GetSettingsSuccess>;
export type GetSettingsFailureAction = ReturnType<typeof GetSettingsFailure>;
export type GetUserSettingsAction = ReturnType<typeof GetUserSettings>;
export type GetUserSettingsSuccessAction = ReturnType<
  typeof GetUserSettingsSuccess
>;
export type GetUserSettingsFailureAction = ReturnType<
  typeof GetUserSettingsFailure
>;
export type UpdateSettingAction = ReturnType<typeof UpdateSetting>;
export type UpdateSettingSuccessAction = ReturnType<
  typeof UpdateSettingSuccess
>;
export type UpdateSettingFailureAction = ReturnType<
  typeof UpdateSettingFailure
>;
export type UpdateUserSettingAction = ReturnType<typeof UpdateUserSetting>;
export type UpdateUserSettingSuccessAction = ReturnType<
  typeof UpdateUserSettingSuccess
>;
export type UpdateUserSettingFailureAction = ReturnType<
  typeof UpdateUserSettingFailure
>;
export type AddPickListOptionAction = ReturnType<typeof AddPickListOption>;
export type AddPickListOptionSuccessAction = ReturnType<
  typeof AddPickListOptionSuccess
>;
export type AddPickListOptionsFailureAction = ReturnType<
  typeof AddPickListOptionsFailure
>;
export type SetGlobalFilterAction = ReturnType<typeof SetGlobalFilter>;
export type SetSceneFiltersAction = ReturnType<typeof SetSceneFilters>;

export type Action =
  | GetSettingsAction
  | GetSettingsSuccessAction
  | GetSettingsFailureAction
  | GetUserSettingsAction
  | GetUserSettingsSuccessAction
  | GetUserSettingsFailureAction
  | UpdateSettingAction
  | UpdateSettingSuccessAction
  | UpdateSettingFailureAction
  | UpdateUserSettingAction
  | UpdateUserSettingSuccessAction
  | UpdateUserSettingFailureAction
  | AddPickListOptionAction
  | AddPickListOptionSuccessAction
  | AddPickListOptionsFailureAction
  | SetGlobalFilterAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_SETTINGS]: (state: State, action: GetSettingsAction): State => state,
  [GET_SETTINGS_SUCCESS]: (
    state: State,
    action: GetSettingsSuccessAction
  ): State => ({
    ...state,
    ...action.settings,
    settingsReady: true,
  }),
  [GET_SETTINGS_FAILURE]: (
    state: State,
    action: GetSettingsFailureAction
  ): State => ({ ...state, settingsReady: false }),

  [GET_USER_SETTINGS]: (state: State, action: GetUserSettingsAction): State =>
    state,
  [GET_USER_SETTINGS_SUCCESS]: (
    state: State,
    action: GetUserSettingsSuccessAction
  ): State => ({
    ...state,
    userSettings: action.userSettings,
  }),
  [GET_USER_SETTINGS_FAILURE]: (
    state: State,
    action: GetUserSettingsFailureAction
  ): State => state,

  [UPDATE_SETTING]: (state: State, action: UpdateSettingAction): State => state,
  [UPDATE_SETTING_SUCCESS]: (
    state: State,
    action: UpdateSettingSuccessAction
  ): State => ({
    ...state,
  }),
  [UPDATE_SETTING_FAILURE]: (
    state: State,
    action: UpdateSettingFailureAction
  ): State => state,
  [UPDATE_USER_SETTING]: (
    state: State,
    action: UpdateUserSettingAction
  ): State => ({
    ...state,
    userSettings: state.userSettings.map((userSetting) =>
      userSetting.id === action.userSetting.id
        ? { ...userSetting, ...action.userSetting }
        : userSetting
    ),
  }),
  [UPDATE_USER_SETTING_SUCCESS]: (
    state: State,
    action: UpdateUserSettingSuccessAction
  ): State => ({
    ...state,
    userSettings: state.userSettings.map((userSetting) =>
      userSetting.id === action.userSetting.id
        ? { ...userSetting, ...action.userSetting }
        : userSetting
    ),
  }),
  [UPDATE_USER_SETTING_FAILURE]: (
    state: State,
    action: UpdateUserSettingFailureAction
  ): State => state,

  [ADD_PICKLISTOPTION]: (
    state: State,
    action: AddPickListOptionAction
  ): State => state,
  [ADD_PICKLISTOPTION_SUCCESS]: (
    state: State,
    action: AddPickListOptionSuccessAction
  ): State => ({
    ...state,
    ...action.options,
  }),
  [ADD_PICKLISTOPTION_FAILURE]: (
    state: State,
    action: AddPickListOptionsFailureAction
  ): State => state,
  [SET_GLOBAL_FILTER]: (
    state: State,
    action: SetGlobalFilterAction
  ): State => ({
    ...state,
    globalFilter: action.filter,
  }),
  [SET_SCENE_FILTER]: (state: State, action: SetSceneFiltersAction): State => ({
    ...state,
    sceneFilters: action.filters,
  }),
});
