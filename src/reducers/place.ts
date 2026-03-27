import createReducer from './helpers/createReducer';
import { Place, MetricReport, Metric } from '../api';
import { DateRange } from '../sharing/utils/DateHelper';

// Action Types
const GET_PLACES = 'GET_PLACES';
const GET_PLACES_SUCCESS = 'GET_PLACES_SUCCESS';
const GET_PLACES_FAILURE = 'GET_PLACES_FAILURE';

const UPDATE_PLACE = 'UPDATE_PLACE';
const UPDATE_PLACE_SUCCESS = 'UPDATE_PLACE_SUCCESS';
const UPDATE_PLACE_FAILURE = 'UPDATE_PLACE_FAILURE';

const CREATE_PLACE = 'CREATE_PLACE';
const CREATE_PLACE_SUCCESS = 'CREATE_PLACE_SUCCESS';
const CREATE_PLACE_FAILURE = 'CREATE_PLACE_FAILURE';

const DELETE_PLACE = 'DELETE_PLACE';
const DELETE_PLACE_SUCCESS = 'DELETE_PLACE_SUCCESS';
const DELETE_PLACE_FAILURE = 'DELETE_PLACE_FAILURE';

const GET_PLACE_METRICS = 'GET_PLACE_METRICS';
const GET_PLACE_METRICS_SUCCESS = 'GET_PLACE_METRICS_SUCCESS';
const GET_PLACE_METRICS_FAILURE = 'GET_PLACE_METRICS_FAILURE';

const PLACE_API_READY = 'PLACE_API_READY';

const SELECT_PLACE = 'SELECT_PLACE';

export const types = {
  GET_PLACES,
  GET_PLACES_SUCCESS,
  GET_PLACES_FAILURE,
  UPDATE_PLACE,
  UPDATE_PLACE_SUCCESS,
  UPDATE_PLACE_FAILURE,
  CREATE_PLACE,
  CREATE_PLACE_SUCCESS,
  CREATE_PLACE_FAILURE,
  DELETE_PLACE,
  DELETE_PLACE_SUCCESS,
  DELETE_PLACE_FAILURE,
  GET_PLACE_METRICS,
  GET_PLACE_METRICS_SUCCESS,
  GET_PLACE_METRICS_FAILURE,
  PLACE_API_READY,
  SELECT_PLACE,
};

type Types =
  | typeof GET_PLACES
  | typeof GET_PLACES_SUCCESS
  | typeof GET_PLACES_FAILURE
  | typeof UPDATE_PLACE
  | typeof UPDATE_PLACE_SUCCESS
  | typeof UPDATE_PLACE_FAILURE
  | typeof CREATE_PLACE
  | typeof CREATE_PLACE_SUCCESS
  | typeof CREATE_PLACE_FAILURE
  | typeof DELETE_PLACE
  | typeof DELETE_PLACE_SUCCESS
  | typeof DELETE_PLACE_FAILURE
  | typeof GET_PLACE_METRICS
  | typeof GET_PLACE_METRICS_SUCCESS
  | typeof GET_PLACE_METRICS_FAILURE
  | typeof PLACE_API_READY
  | typeof SELECT_PLACE;

// State
export type State = {
  places: Place[];
  selectedId: number | null;
  metrics: MetricReport;
  selectedPlaceMetric: Metric;
};
const initialState: State = {
  places: [],
  selectedId: null,
  metrics: {
    bestTimesBooked: 0,
    bestTotalGuests: 0,
    bestTotalRevenue: 0,
    endUtcDate: null,
    startUtcDate: null,
    metricsData: [],
  },
  selectedPlaceMetric: {
    maxGuests: 0,
    maxRevenue: 0,
    metricId: 0,
    metricName: '',
    timesBooked: 0,
    totalRevenue: 0,
    totlGuests: 0,
  },
};

// Action Creators
export const GetPlaces = () => ({
  type: GET_PLACES as typeof GET_PLACES,
});

export const GetPlacesSuccess = (places: Place[]) => ({
  type: GET_PLACES_SUCCESS as typeof GET_PLACES_SUCCESS,
  places,
});

export const GetPlacesFailure = (error: any) => ({
  type: GET_PLACES_FAILURE as typeof GET_PLACES_FAILURE,
  error,
});

export const UpdatePlace = (place: Place) => ({
  type: UPDATE_PLACE as typeof UPDATE_PLACE,
  place,
});

export const UpdatePlaceSuccess = (place: Place) => ({
  type: UPDATE_PLACE_SUCCESS as typeof UPDATE_PLACE_SUCCESS,
  place,
});

export const UpdatePlaceFailure = (error: any) => ({
  type: UPDATE_PLACE_FAILURE as typeof UPDATE_PLACE_FAILURE,
  error,
});

export const CreatePlace = (place: Place) => ({
  type: CREATE_PLACE as typeof CREATE_PLACE,
  place,
});

export const CreatePlaceSuccess = (place: Place) => ({
  type: CREATE_PLACE_SUCCESS as typeof CREATE_PLACE_SUCCESS,
  place,
});

export const CreatePlaceFailure = (error: any) => ({
  type: CREATE_PLACE_FAILURE as typeof CREATE_PLACE_FAILURE,
  error,
});

export const DeletePlace = (placeId: number) => ({
  type: DELETE_PLACE as typeof DELETE_PLACE,
  placeId,
});

export const DeletePlaceSuccess = (placeId: number) => ({
  type: DELETE_PLACE_SUCCESS as typeof DELETE_PLACE_SUCCESS,
  placeId,
});

export const DeletePlaceFailure = (error: any) => ({
  type: DELETE_PLACE_FAILURE as typeof DELETE_PLACE_FAILURE,
  error,
});

export const GetPlaceMetrics = (range?: DateRange, takeFirst?: number) => ({
  type: GET_PLACE_METRICS as typeof GET_PLACE_METRICS,
  range,
  takeFirst,
});

export const GetPlaceMetricsSuccess = (metrics: MetricReport) => ({
  type: GET_PLACE_METRICS_SUCCESS as typeof GET_PLACE_METRICS_SUCCESS,
  metrics,
});

export const GetPlaceMetricsFailure = (error: any) => ({
  type: GET_PLACE_METRICS_FAILURE as typeof GET_PLACE_METRICS_FAILURE,
  error,
});

export const SelectPlace = (placeId?: number) => ({
  type: SELECT_PLACE as typeof SELECT_PLACE,
  placeId,
});

export type GetPlacesAction = ReturnType<typeof GetPlaces>;
export type GetPlacesSuccessAction = ReturnType<typeof GetPlacesSuccess>;
export type GetPlacesFailureAction = ReturnType<typeof GetPlacesFailure>;
export type UpdatePlaceAction = ReturnType<typeof UpdatePlace>;
export type UpdatePlaceSuccessAction = ReturnType<typeof UpdatePlaceSuccess>;
export type UpdatePlaceFailureAction = ReturnType<typeof UpdatePlaceFailure>;
export type CreatePlaceAction = ReturnType<typeof CreatePlace>;
export type CreatePlaceSuccessAction = ReturnType<typeof CreatePlaceSuccess>;
export type CreatePlaceFailureAction = ReturnType<typeof CreatePlaceFailure>;
export type DeletePlaceAction = ReturnType<typeof DeletePlace>;
export type DeletePlaceSuccessAction = ReturnType<typeof DeletePlaceSuccess>;
export type DeletePlaceFailureAction = ReturnType<typeof DeletePlaceFailure>;
export type GetPlaceMetricsAction = ReturnType<typeof GetPlaceMetrics>;
export type GetPlaceMetricsSuccessAction = ReturnType<
  typeof GetPlaceMetricsSuccess
>;
export type GetPlaceMetricsFailureAction = ReturnType<
  typeof GetPlaceMetricsFailure
>;
export type SelectPlaceAction = ReturnType<typeof SelectPlace>;
export type Action =
  | GetPlacesAction
  | GetPlacesSuccessAction
  | GetPlacesFailureAction
  | UpdatePlaceAction
  | UpdatePlaceSuccessAction
  | UpdatePlaceFailureAction
  | CreatePlaceAction
  | CreatePlaceSuccessAction
  | CreatePlaceFailureAction
  | DeletePlaceAction
  | DeletePlaceSuccessAction
  | DeletePlaceFailureAction
  | GetPlaceMetricsAction
  | GetPlaceMetricsSuccessAction
  | GetPlaceMetricsFailureAction
  | SelectPlaceAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_PLACES]: (state: State, action: GetPlacesAction): State => state,
  [GET_PLACES_SUCCESS]: (
    state: State,
    action: GetPlacesSuccessAction
  ): State => ({
    ...state,
    places: action.places,
  }),
  [GET_PLACES_FAILURE]: (state: State, action: GetPlacesFailureAction): State =>
    state,
  [UPDATE_PLACE]: (state: State, action: UpdatePlaceAction): State => state,
  [UPDATE_PLACE_SUCCESS]: (
    state: State,
    action: UpdatePlaceSuccessAction
  ): State => ({
    ...state,
    places: state.places.map((place) =>
      place.id === action.place.id ? { ...place, ...action.place } : place
    ),
  }),
  [UPDATE_PLACE_FAILURE]: (
    state: State,
    action: UpdatePlaceFailureAction
  ): State => state,
  [CREATE_PLACE]: (state: State, action: CreatePlaceAction): State => state,
  [CREATE_PLACE_SUCCESS]: (
    state: State,
    action: CreatePlaceSuccessAction
  ): State => ({
    ...state,
    selectedId: action.place.id,
    places: state.places.concat([action.place]),
  }),
  [CREATE_PLACE_FAILURE]: (
    state: State,
    action: CreatePlaceFailureAction
  ): State => state,
  [DELETE_PLACE]: (state: State, action: DeletePlaceAction): State => state,
  [DELETE_PLACE_SUCCESS]: (
    state: State,
    action: DeletePlaceSuccessAction
  ): State => ({
    ...state,
    places: state.places.filter((place) => place.id !== action.placeId),
    selectedId: null,
  }),
  [DELETE_PLACE_FAILURE]: (
    state: State,
    action: DeletePlaceFailureAction
  ): State => state,
  [GET_PLACE_METRICS]: (state: State, action: GetPlaceMetricsAction): State =>
    state,
  [GET_PLACE_METRICS_SUCCESS]: (
    state: State,
    action: GetPlaceMetricsSuccessAction
  ): State => {
    const selectedPlaceMetric = action.metrics.metricsData.find(
      (placeMetric) => placeMetric.metricId === state.selectedId
    );

    return {
      ...state,
      metrics: action.metrics,
      selectedPlaceMetric: selectedPlaceMetric
        ? selectedPlaceMetric
        : initialState.selectedPlaceMetric,
    };
  },
  [GET_PLACE_METRICS_FAILURE]: (
    state: State,
    action: GetPlaceMetricsFailureAction
  ): State => state,
  [PLACE_API_READY]: (state: State, action: any): State => state,
  [SELECT_PLACE]: (state: State, action: SelectPlaceAction): State => {
    const selectedPlaceMetric = state.metrics.metricsData.find(
      (placeMetric) => placeMetric.metricId === action.placeId
    );

    return {
      ...state,
      selectedId: action.placeId,
      selectedPlaceMetric: selectedPlaceMetric
        ? selectedPlaceMetric
        : initialState.selectedPlaceMetric,
    };
  },
});

// Selectors
export const placeById = (state: { place: State }, placeId: number) => {
  return state.place.places.find((place) => {
    return place.id === placeId;
  }); // tslint:disable-line
};
