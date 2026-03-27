import createReducer from './helpers/createReducer';
import { Scene, SceneDetail } from '../api';
import { DateRange } from '../sharing/utils/DateHelper';

// Action Types
const GET_SCENE = 'GET_SCENE';
const GET_SCENE_SUCCESS = 'GET_SCENE_SUCCESS';
const GET_SCENE_FAILURE = 'GET_SCENE_FAILURE';
const GET_SCENES = 'GET_SCENES';
const GET_SCENES_SUCCESS = 'GET_SCENES_SUCCESS';
const GET_SCENES_FAILURE = 'GET_SCENES_FAILURE';
const SELECT_SCENE = 'SELECT_SCENE';
const CREATE_SCENE = 'CREATE_SCENE';
const COPY_SCENE_WITH_LAYOUTS = 'COPY_SCENE_WITH_LAYOUTS';
const CREATE_SCENE_SUCCESS = 'CREATE_SCENE_SUCCESS';
const CREATE_SCENE_FAILURE = 'CREATE_SCENE_FAILURE';
const UPDATE_SCENE = 'UPDATE_SCENE';
const UPDATE_SCENE_SUCCESS = 'UPDATE_SCENE_SUCCESS';
const UPDATE_SCENE_FAILURE = 'UPDATE_SCENE_FAILURE';
const DELETE_SCENE = 'DELETE_SCENE';
const DELETE_SCENE_SUCCESS = 'DELETE_SCENE_SUCCESS';
const DELETE_SCENE_FAILURE = 'DELETE_SCENE_FAILURE';
const GET_SCENE_METRICS = 'GET_SCENE_METRICS';
const GET_SCENE_METRICS_SUCCESS = 'GET_SCENE_METRICS_SUCCESS';
const GET_SCENE_METRICS_FAILURE = 'GET_SCENE_METRICS_FAILURE';
const SCENE_API_READY = 'SCENE_API_READY';

export const types = {
  GET_SCENE,
  GET_SCENE_SUCCESS,
  GET_SCENE_FAILURE,
  GET_SCENES,
  GET_SCENES_SUCCESS,
  GET_SCENES_FAILURE,
  SELECT_SCENE,
  CREATE_SCENE,
  COPY_SCENE_WITH_LAYOUTS,
  CREATE_SCENE_SUCCESS,
  CREATE_SCENE_FAILURE,
  UPDATE_SCENE,
  UPDATE_SCENE_SUCCESS,
  UPDATE_SCENE_FAILURE,
  DELETE_SCENE,
  DELETE_SCENE_SUCCESS,
  DELETE_SCENE_FAILURE,
  GET_SCENE_METRICS,
  GET_SCENE_METRICS_SUCCESS,
  GET_SCENE_METRICS_FAILURE,
  SCENE_API_READY,
};

type Types =
  | typeof GET_SCENES
  | typeof GET_SCENES_SUCCESS
  | typeof GET_SCENES_FAILURE
  | typeof GET_SCENE
  | typeof GET_SCENE_SUCCESS
  | typeof GET_SCENE_FAILURE
  | typeof SELECT_SCENE
  | typeof CREATE_SCENE
  | typeof COPY_SCENE_WITH_LAYOUTS
  | typeof CREATE_SCENE_SUCCESS
  | typeof CREATE_SCENE_FAILURE
  | typeof UPDATE_SCENE
  | typeof UPDATE_SCENE_SUCCESS
  | typeof UPDATE_SCENE_FAILURE
  | typeof DELETE_SCENE
  | typeof DELETE_SCENE_SUCCESS
  | typeof DELETE_SCENE_FAILURE
  | typeof GET_SCENE_METRICS
  | typeof GET_SCENE_METRICS_SUCCESS
  | typeof GET_SCENE_METRICS_FAILURE
  | typeof SCENE_API_READY;

// State
export type State = {
  scenes: Scene[];
  selectedId: number | null;
  metrics: any;
  isLoading: boolean;
};
const initialState: State = {
  scenes: [],
  selectedId: null,
  metrics: {},
  isLoading: false,
};

// Action Creators
export const GetScenes = () => ({
  type: GET_SCENES as typeof GET_SCENES,
});

export const GetScenesSuccess = (scenes: Scene[]) => ({
  type: GET_SCENES_SUCCESS as typeof GET_SCENES_SUCCESS,
  scenes,
});

export const GetScenesFailure = (error: any) => ({
  type: GET_SCENES_FAILURE as typeof GET_SCENES_FAILURE,
  error,
});

export const GetScene = (sceneId: number) => ({
  type: GET_SCENE as typeof GET_SCENE,
  sceneId,
});

export const GetSceneSuccess = (scene: Scene) => ({
  type: GET_SCENE_SUCCESS as typeof GET_SCENE_SUCCESS,
  scene,
});

export const GetSceneFailure = (error: any) => ({
  type: GET_SCENE_FAILURE as typeof GET_SCENE_FAILURE,
  error,
});

export const SelectScene = (sceneId: number | null) => ({
  type: SELECT_SCENE as typeof SELECT_SCENE,
  sceneId,
});

export const CreateScene = (sceneDetail: SceneDetail) => ({
  type: CREATE_SCENE as typeof CREATE_SCENE,
  sceneDetail,
});

export const CopySceneWithLayouts = (scene: Scene) => ({
  type: COPY_SCENE_WITH_LAYOUTS as typeof COPY_SCENE_WITH_LAYOUTS,
  scene,
});

export const CreateSceneSuccess = (scene: Scene) => ({
  type: CREATE_SCENE_SUCCESS as typeof CREATE_SCENE_SUCCESS,
  scene,
});

export const CreateSceneFailure = (error: any) => ({
  type: CREATE_SCENE_FAILURE as typeof CREATE_SCENE_FAILURE,
  error,
});

export const UpdateScene = (scene: Scene) => ({
  type: UPDATE_SCENE as typeof UPDATE_SCENE,
  scene,
});

export const UpdateSceneSuccess = (scene: Scene) => ({
  type: UPDATE_SCENE_SUCCESS as typeof UPDATE_SCENE_SUCCESS,
  scene,
});

export const UpdateSceneFailure = (error: any) => ({
  type: UPDATE_SCENE_FAILURE as typeof UPDATE_SCENE_FAILURE,
  error,
});

export const DeleteScene = (sceneId: number) => ({
  type: DELETE_SCENE as typeof DELETE_SCENE,
  sceneId,
});

export const DeleteSceneSuccess = (sceneId: number) => ({
  type: DELETE_SCENE_SUCCESS as typeof DELETE_SCENE_SUCCESS,
  sceneId,
});

export const DeleteSceneFailure = (error: any) => ({
  type: DELETE_SCENE_FAILURE as typeof DELETE_SCENE_FAILURE,
  error,
});

export const GetSceneMetrics = (range?: DateRange) => ({
  type: GET_SCENE_METRICS as typeof GET_SCENE_METRICS,
  range,
});

export const GetSceneMetricsSuccess = (metrics: any) => ({
  type: GET_SCENE_METRICS_SUCCESS as typeof GET_SCENE_METRICS_SUCCESS,
  metrics,
});

export const GetSceneMetricsFailure = (error: any) => ({
  type: GET_SCENE_METRICS_FAILURE as typeof GET_SCENE_METRICS_FAILURE,
  error,
});

export type GetScenesAction = ReturnType<typeof GetScenes>;
export type GetScenesSuccessAction = ReturnType<typeof GetScenesSuccess>;
export type GetScenesFailureAction = ReturnType<typeof GetScenesFailure>;
export type GetSceneAction = ReturnType<typeof GetScene>;
export type GetSceneSuccessAction = ReturnType<typeof GetSceneSuccess>;
export type GetSceneFailureAction = ReturnType<typeof GetSceneFailure>;
export type SelectSceneAction = ReturnType<typeof SelectScene>;
export type CreateSceneAction = ReturnType<typeof CreateScene>;
export type CopySceneWithLayoutsAction = ReturnType<
  typeof CopySceneWithLayouts
>;
export type CreateSceneSuccessAction = ReturnType<typeof CreateSceneSuccess>;
export type CreateSceneFailureAction = ReturnType<typeof CreateSceneFailure>;
export type UpdateSceneAction = ReturnType<typeof UpdateScene>;
export type UpdateSceneSuccessAction = ReturnType<typeof UpdateSceneSuccess>;
export type UpdateSceneFailureAction = ReturnType<typeof UpdateSceneFailure>;
export type DeleteSceneAction = ReturnType<typeof DeleteScene>;
export type DeleteSceneSuccessAction = ReturnType<typeof DeleteSceneSuccess>;
export type DeleteSceneFailureAction = ReturnType<typeof DeleteSceneFailure>;
export type GetSceneMetricsAction = ReturnType<typeof GetSceneMetrics>;
export type GetSceneMetricsSuccessAction = ReturnType<
  typeof GetSceneMetricsSuccess
>;
export type GetSceneMetricsFailureAction = ReturnType<
  typeof GetSceneMetricsFailure
>;

export type Action =
  | GetScenesAction
  | GetScenesSuccessAction
  | GetScenesFailureAction
  | GetSceneAction
  | GetSceneSuccessAction
  | GetSceneFailureAction
  | SelectSceneAction
  | CreateSceneAction
  | CopySceneWithLayoutsAction
  | CreateSceneSuccessAction
  | CreateSceneFailureAction
  | UpdateSceneAction
  | UpdateSceneSuccessAction
  | UpdateSceneFailureAction
  | DeleteSceneAction
  | DeleteSceneSuccessAction
  | DeleteSceneFailureAction
  | GetSceneMetricsAction
  | GetSceneMetricsSuccessAction
  | GetSceneMetricsFailureAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_SCENES]: (state: State, action: GetScenesAction): State => state,
  [GET_SCENES_SUCCESS]: (
    state: State,
    action: GetScenesSuccessAction
  ): State => ({
    ...state,
    scenes: action.scenes,
  }),
  [GET_SCENES_FAILURE]: (state: State, action: GetScenesFailureAction): State =>
    state,
  [GET_SCENE]: (state: State, action: GetSceneAction): State => state,
  [GET_SCENE_SUCCESS]: (
    state: State,
    action: GetSceneSuccessAction
  ): State => ({
    ...state,
    scenes: state.scenes
      .map((scene) => (scene.id === action.scene.id ? action.scene : scene)),
    selectedId: action.scene.id,
  }),
  [GET_SCENE_FAILURE]: (state: State, action: GetSceneFailureAction): State =>
    state,
  [SELECT_SCENE]: (state: State, action: SelectSceneAction): State => ({
    ...state,
    selectedId: action.sceneId,
  }),
  [CREATE_SCENE]: (state: State, action: CreateSceneAction): State => state,
  [CREATE_SCENE_SUCCESS]: (
    state: State,
    action: CreateSceneSuccessAction
  ): State => ({
    ...state,
    scenes: state.scenes.concat([action.scene]),
    selectedId: action.scene.id,
  }),
  [COPY_SCENE_WITH_LAYOUTS]: (
    state: State,
    action: CopySceneWithLayoutsAction
  ): State => state,
  [CREATE_SCENE_FAILURE]: (
    state: State,
    action: CreateSceneFailureAction
  ): State => ({
    ...state,
    selectedId: null,
  }),
  [UPDATE_SCENE]: (state: State, action: UpdateSceneAction): State => state,
  [UPDATE_SCENE_SUCCESS]: (
    state: State,
    action: UpdateSceneSuccessAction
  ): State => ({
    ...state,
    scenes: state.scenes
      .map((scene) =>
        scene.id === action.scene.id ? { ...scene, ...action.scene } : scene
      ),
  }),
  [UPDATE_SCENE_FAILURE]: (
    state: State,
    action: UpdateSceneFailureAction
  ): State => state,
  [DELETE_SCENE]: (state: State, action: DeleteSceneAction): State => state,
  [DELETE_SCENE_SUCCESS]: (
    state: State,
    action: DeleteSceneSuccessAction
  ): State => {
    return {
      ...state,
      scenes: state.scenes.filter((scene) => scene.id !== action.sceneId),
    };
  },
  [DELETE_SCENE_FAILURE]: (
    state: State,
    action: DeleteSceneFailureAction
  ): State => state,
  [GET_SCENE_METRICS]: (
    state: State,
    action: GetSceneMetricsAction
  ): State => ({
    ...state,
  }),
  [GET_SCENE_METRICS_SUCCESS]: (
    state: State,
    action: GetSceneMetricsSuccessAction
  ): State => ({
    ...state,
    metrics: action.metrics,
  }),
  [GET_SCENE_METRICS_FAILURE]: (
    state: State,
    action: GetSceneMetricsFailureAction
  ): State => ({
    ...state,
  }),
  [SCENE_API_READY]: (state: State, action: any): State => state,
});

// Selectors
export const getSceneById = (state: { scenes: State }, sceneId: number) => {
  return state.scenes.scenes.find((scene) => scene.id === sceneId);
};

export const getClientScenes = (state: { scenes: State; client: any }) => {
  const { selectedId } = state.client;
  const { scenes } = state.scenes;
  return scenes.filter((scene) => {
    return scene.clientId == selectedId;
  }); // tslint:disable-line
};

export const getCurrentScene = (state: { scenes: State }) => {
  return state.scenes.scenes.find((scene) => scene.id === state.scenes.selectedId);
};

export const getScenes = (state: { scenes: State }) => {
  return state.scenes.scenes;
};
