import {
  all,
  takeLatest,
  put,
  call,
  race,
  take,
  select,
} from 'redux-saga/effects';
import { SagaReady } from '../reducers/lifecycle';
import {
  types,
  GetScenesAction,
  CreateScene,
  CreateSceneAction,
  UpdateSceneAction,
  DeleteSceneAction,
  GetSceneMetricsAction,
  GetSceneAction,
  CopySceneWithLayoutsAction,
  SelectSceneAction,
  GetSceneSuccessAction,
} from '../reducers/scenes';
import { types as uiTypes } from '../reducers/ui';
import {
  types as layoutTypes,
  CreateLayout,
  GetSceneLayouts,
  getLayouts,
} from '../reducers/layouts';
import { getTimeDateRange, TimeRangeOption } from '../sharing/utils/DateHelper';

// Api
import { placezApi, Scene, SceneDetail, PlacezLayoutPlan } from '../api';
import { sceneRoutes } from '../routes'
import PlacezNote from '../api/placez/models/PlacezNote'

export default function* sceneSaga() {
  yield all([
    takeLatest(types.GET_SCENE, getScene),
    takeLatest(types.GET_SCENE_SUCCESS, getSceneSuccess),
    takeLatest(types.GET_SCENES, getScenesEffect),
    takeLatest(types.GET_SCENE_METRICS, getSceneMetrics),
    takeLatest(types.CREATE_SCENE, createScene),
    takeLatest(types.COPY_SCENE_WITH_LAYOUTS, copySceneWithLayouts),
    takeLatest(types.UPDATE_SCENE, updateScene),
    takeLatest(types.DELETE_SCENE, deleteScene),
    takeLatest(types.SELECT_SCENE, selectScene),
  ]);
  yield put({ type: types.SCENE_API_READY });
  yield put({ type: types.GET_SCENES });
  yield put(SagaReady('scene'));
}

function* getScene(action: GetSceneAction) {
  try {
    const response = yield call(placezApi.getScene, action.sceneId);
    yield put({
      type: types.GET_SCENE_SUCCESS,
      scene: response.parsedBody as Scene,
    });

  } catch (error) {
    yield put({ type: types.GET_SCENE_FAILURE, error });
  }
}

function* getScenesEffect(action: GetScenesAction) {
  try {
    const response = yield call(placezApi.getScenes);
    yield put({ type: types.GET_SCENES_SUCCESS, scenes: response.parsedBody });
  } catch (error) {
    yield put({ type: types.GET_SCENES_FAILURE, error });
  }
}

function* createScene(action: CreateSceneAction) {
  try {
    const { sceneDetail } = action;
    const response = yield call(placezApi.postScene, sceneDetail);

    yield put({ type: types.CREATE_SCENE_SUCCESS, scene: response.parsedBody });
    // yield put({ type: uiTypes.NAVIGATE, target: sceneRoutes.edit.path.replace(':id', response.parsedBody.id) });
  } catch (error) {
    yield put({ type: types.CREATE_SCENE_FAILURE, error });
  }
}

const clearSceneNotes = (notes: PlacezNote[]) => {
  return notes.map(note => {
    return {
      ...note,
      id: null,
      sceneId: null,
    }
  })
}

function* copySceneWithLayouts(action: CopySceneWithLayoutsAction) {
  const sceneLayouts: PlacezLayoutPlan[] = yield select(getLayouts);
  const { scene } = action;
  const sceneCopy = {
    ...scene,
    id: 0,
    name: `${scene.name} - Copy`,
    notes: clearSceneNotes(scene.notes),
  } as Scene;

  yield put(CreateScene(sceneCopy as SceneDetail));
  const { success, failure } = yield race({
    success: take(types.CREATE_SCENE_SUCCESS),
    failure: take(types.CREATE_SCENE_FAILURE),
  });
  if (!success) {
    return;
  }

  const sceneId = success.scene.id;
  for (let i = 0; i < sceneLayouts.length; i++) {
    const layout = sceneLayouts[i];
    const layoutCopy = {
      ...layout,
      id: null,
      sceneId,
    } as PlacezLayoutPlan;

    yield put(CreateLayout(layoutCopy));
    const { success, failure } = yield race({
      success: take(layoutTypes.CREATE_LAYOUT_SUCCESS),
      failure: take(layoutTypes.CREATE_LAYOUT_FAILURE),
    });
    if (failure) {
      return;
    }
  }
  yield put(GetSceneLayouts(sceneId));
}

function* updateScene(action: UpdateSceneAction) {
  try {
    const { scene } = action;
    const response = yield call(placezApi.putScene, scene);
    yield put({ type: types.UPDATE_SCENE_SUCCESS, scene: response.parsedBody });
  } catch (error) {
    yield put({ type: types.UPDATE_SCENE_FAILURE, error });
  }
}

function* getSceneMetrics(action: GetSceneMetricsAction) {
  try {
    const range = action.range
      ? action.range
      : getTimeDateRange(TimeRangeOption.ThisWeek);
    const response = yield call(
      placezApi.getSceneMetrics,
      range.startDate,
      range.endDate
    );
    yield put({
      type: types.GET_SCENE_METRICS_SUCCESS,
      metrics: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.GET_SCENE_METRICS_FAILURE, error });
  }
}

function* deleteScene(action: DeleteSceneAction) {
  try {
    const { sceneId } = action;
    const response = yield call(placezApi.deleteScene, sceneId);
    yield put({ type: types.DELETE_SCENE_SUCCESS, sceneId });
    yield put({ type: uiTypes.NAVIGATE, target: sceneRoutes.main.path });
  } catch (error) {
    yield put({ type: types.DELETE_SCENE_FAILURE, error });
  }
}

function* selectScene(action: SelectSceneAction) {
  try {
    const { sceneId } = action;
    if (sceneId) {
      yield put(GetSceneLayouts(sceneId));
    }
  } catch (error) {
  }
}

function* getSceneSuccess(action: GetSceneSuccessAction) {
  try {
    const { scene } = action;
    yield put(GetSceneLayouts(scene.id));
  } catch (error) {
  }
}
