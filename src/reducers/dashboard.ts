import createReducer from './helpers/createReducer';
import { TimeRangeOption, DateRange } from '../sharing/utils/DateHelper';
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from '../sharing/utils/localStorageHelper';

// Action Types
const REFRESH_METRICS = 'REFRESH_METRICS';
const REFRESH_METRICS_COMPLETE = 'REFRESH_METRICS_COMPLETE';
const UPDATE_DASHBOARD_DATE_OPTION = 'UPDATE_DASHBOARD_DATE_OPTION';
const SET_LOCATIONS = 'SET_LOCATIONS';
const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';

export const types = {
  REFRESH_METRICS,
  REFRESH_METRICS_COMPLETE,
  UPDATE_DASHBOARD_DATE_OPTION,
  SET_LOCATIONS,
  SET_CURRENT_LOCATION,
};
type Types =
  | typeof REFRESH_METRICS
  | typeof REFRESH_METRICS_COMPLETE
  | typeof UPDATE_DASHBOARD_DATE_OPTION
  | typeof SET_LOCATIONS
  | typeof SET_CURRENT_LOCATION;

// State
export type State = {
  isLoading: boolean;
  dateOption: TimeRangeOption;
  locations: { [key: string]: string };
  currentLocationKey: string;
};

const initialState: State = {
  isLoading: false,
  dateOption: TimeRangeOption.ThisMonth,
  locations: {},
  currentLocationKey: '',
};

// Action Creators
export const RefreshMetrics = (range?: DateRange) => ({
  type: REFRESH_METRICS as typeof REFRESH_METRICS,
  range,
});

export const RefreshMetricsComplete = () => ({
  type: REFRESH_METRICS_COMPLETE as typeof REFRESH_METRICS_COMPLETE,
});

export const UpdateDashboardDateOption = (dateOption: TimeRangeOption) => ({
  type: UPDATE_DASHBOARD_DATE_OPTION as typeof UPDATE_DASHBOARD_DATE_OPTION,
  dateOption,
});

export const SetLocations = (locations: { [key: string]: string }) => ({
  type: SET_LOCATIONS as typeof SET_LOCATIONS,
  locations,
});
export const SetCurrentLocation = (currentLocationKey: string) => ({
  type: SET_CURRENT_LOCATION as typeof SET_CURRENT_LOCATION,
  currentLocationKey,
});

export type RefreshMetricsAction = ReturnType<typeof RefreshMetrics>;
export type RefreshMetricsCompleteAction = ReturnType<
  typeof RefreshMetricsComplete
>;
export type UpdateDashboardDateOptionAction = ReturnType<
  typeof UpdateDashboardDateOption
>;
export type SetLocationsAction = ReturnType<typeof SetLocations>;
export type SetCurrentLocationAction = ReturnType<typeof SetCurrentLocation>;

export type Action =
  | RefreshMetricsAction
  | RefreshMetricsCompleteAction
  | UpdateDashboardDateOptionAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [REFRESH_METRICS]: (state: State, action: RefreshMetricsAction): State => ({
    ...state,
    isLoading: true,
  }),
  [REFRESH_METRICS_COMPLETE]: (
    state: State,
    action: RefreshMetricsCompleteAction
  ): State => ({
    ...state,
    isLoading: false,
  }),
  [UPDATE_DASHBOARD_DATE_OPTION]: (
    state: State,
    action: UpdateDashboardDateOptionAction
  ): State => ({
    ...state,
    dateOption: action.dateOption,
  }),
  [SET_LOCATIONS]: (state: State, action: SetLocationsAction): State => {
    let locations = initialState.locations;
    let currentLocationKey = initialState.currentLocationKey;

    if (action.locations) {
      locations = action.locations;
      const locationKeys = Object.keys(locations);

      if (locationKeys.length) {
        const savedLocationKey: string = getFromLocalStorage<string>(
          types.SET_CURRENT_LOCATION
        );
        const useSavedLocationKey =
          !!savedLocationKey && !!locations[savedLocationKey];

        currentLocationKey = useSavedLocationKey
          ? savedLocationKey
          : locationKeys[0];
      }
    }

    return {
      ...state,
      locations,
      currentLocationKey,
    };
  },
  [SET_CURRENT_LOCATION]: (
    state: State,
    action: SetCurrentLocationAction
  ): State => {
    saveToLocalStorage<string>(
      types.SET_CURRENT_LOCATION,
      action.currentLocationKey
    );

    return {
      ...state,
      currentLocationKey: action.currentLocationKey,
    };
  },
});
