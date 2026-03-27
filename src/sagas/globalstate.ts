import {
  put,
  all,
  takeLatest,
  take,
  call,
  select,
} from 'redux-saga/effects';
import { SagaReady } from '../reducers/lifecycle';
import {
  types as globalStateTypes,
  ChangeGlobalViewStateAction,
  ChangeViewStateAction,
  getViewState,
  getSaveBarState,
  SetGlobalStateInitialized,
  ChangeViewState,
  canEditLayout,
  ChangeToolStateAction,
} from '../reducers/globalState';
import {
  types as blueStateTypes,
  getBlueInitialized,
  LoadLayout,
  LoadFixturePlan,
  getDesignerReady,
} from '../reducers/blue';
import { GetTemplates } from '../reducers/layouts';
import {
  types as designerTypes,
  getFloorPlan as getFloorPlanForDesigner,
  getLayout,
} from '../reducers/designer';

import {
  ViewState,
  GlobalViewState,
  ToolState,
} from '../models/GlobalState';
import { CameraType } from '../components/Blue/models/CameraType';
import { ControlsType } from '../components/Blue/models/ControlsType';
import {
  InitialCameraLayersLocalState,
  ControllerType,
  CameraLayers,
  ProhibitedLayers,
  RequiredLayers,
  CAMERA_LAYERS_LOCAL_STATE_VAR,
} from '../models/BlueState';

import {
  getFromLocalStorage,
  saveToLocalStorage,
} from '../sharing/utils/localStorageHelper';
import { initAttendeeList } from './blue';
import { ReduxState } from '../reducers';

let prevViewState: ViewState;

export default function* globalstateSaga() {
  yield all([
    takeLatest(globalStateTypes.GLOBAL_VIEW_STATE, changeGlobalViewState),
    takeLatest(globalStateTypes.VIEW_STATE, changeViewState),
    takeLatest(globalStateTypes.TOOL_STATE, changeToolState),
  ]);
  yield put(SagaReady('globalState'));
  yield call(setPrevViewState);
}

const getCameraLayers = (
  globalViewState: GlobalViewState,
  viewState: ViewState
): CameraLayers[] => {
  const cameraLayersLocalState = getFromLocalStorage(CAMERA_LAYERS_LOCAL_STATE_VAR) ?? [];

  const localCameraLayers = cameraLayersLocalState[globalViewState]?.[viewState]?.cameraLayers;

  const requiredLayers = RequiredLayers[viewState].cameraLayers;
  const prohibitedLayers = ProhibitedLayers[viewState].cameraLayers;
  const defaultCameraLayers = InitialCameraLayersLocalState[globalViewState][viewState]?.cameraLayers ?? [];

  const newLayers = [
    ...new Set(localCameraLayers.concat(requiredLayers)),
  ] as CameraLayers[];
  const filteredCameraLayers = newLayers.filter(
    (layer) => !prohibitedLayers?.includes(layer)
  );


  return filteredCameraLayers ?? defaultCameraLayers;
};

export function* setPrevViewState() {
  while (true) {
    prevViewState = yield select(getViewState);
    yield take(globalStateTypes.VIEW_STATE);
  }
}

function* changeGlobalViewState(action: ChangeGlobalViewStateAction) {
  yield put(SetGlobalStateInitialized(true));

  const { globalViewState } = action;
  const cameraLayersLocalState = getFromLocalStorage(CAMERA_LAYERS_LOCAL_STATE_VAR);

  if (cameraLayersLocalState === undefined) {
    saveToLocalStorage(CAMERA_LAYERS_LOCAL_STATE_VAR, InitialCameraLayersLocalState);
  } else {
    // this updates the cameraLayersLocalState when new keys are added to initialState
    /*
    function mergeStates(cameraLayersLocalState, initialState) {
      for (const key in initialState) {
        if (
          initialState[key] &&
          typeof initialState[key] === 'object' &&
          !Array.isArray(initialState[key])
        ) {
          if (!cameraLayersLocalState.hasOwnProperty(key)) {
            cameraLayersLocalState[key] = {};
          }
          mergeStates(cameraLayersLocalState[key], initialState[key]);
        } else {
          if (!cameraLayersLocalState.hasOwnProperty(key)) {
            cameraLayersLocalState[key] = initialState[key];
          }
        }
      }
    }

    mergeStates(cameraLayersLocalState, InitialCameraLayersLocalState);
    saveToLocalStorage('CameraLayersLocalState', cameraLayersLocalState);
    */
  }

  let designerReady;

  const floorplan = yield select(getFloorPlanForDesigner);
  if (!floorplan) yield take(designerTypes.GET_DESIGNER_FLOOR_PLAN_SUCCESS);
  let blueReady = false;

  switch (globalViewState) {
    case GlobalViewState.Layout:
      const layout = yield select(getLayout);
      const getTemplates = yield select(GetTemplates);
      if (!layout) yield take(designerTypes.GET_DESIGNER_LAYOUT_SUCCESS);

      designerReady = yield select(getDesignerReady);
      if (!designerReady) yield take(blueStateTypes.INIT_DESIGNER);
      yield put(LoadLayout());
      blueReady = yield select(getBlueInitialized);
      if (!blueReady) yield take(blueStateTypes.BLUE_INIT);
      yield put(ChangeViewState(ViewState.TwoDView, ViewState.TwoDView));
      yield put({
        type: blueStateTypes.SET_CAMERA_TYPE,
        cameraType: CameraType.Orthographic,
      });
      break;
    case GlobalViewState.Fixtures:
      designerReady = yield select(getDesignerReady);
      if (!designerReady) yield take(blueStateTypes.INIT_DESIGNER);
      yield put(LoadFixturePlan());
      blueReady = yield select(getBlueInitialized);
      if (!blueReady) yield take(blueStateTypes.BLUE_INIT);
      yield put(
        ChangeViewState(
          ViewState.Floorplan,
          ViewState.Floorplan
        )
      );
      break;
  }
}

function* changeViewState(action: ChangeViewStateAction) {
  const { viewState } = action;
  const saveBarState = yield select(getSaveBarState);

  const currentControls: ControlsType = yield select(
    (state: ReduxState) => state.blue.controlsType
  );
  const currentCameraType: CameraType = yield select(
    (state: ReduxState) => state.blue.cameraType
  );

  const globalState = yield select((state: ReduxState) => state.globalstate);

  const canEdit = yield select(canEditLayout);

  yield put({
    type: globalStateTypes.GLOBAL_STATE_INITIALIZED,
    globalStateInitialized: true,
  });
  switch (viewState) {
    case ViewState.Floorplan:
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          GlobalViewState.Fixtures,
          ViewState.Floorplan
        ),
      });
      break;
    case ViewState.TwoDView:
      yield put({
        type: blueStateTypes.SET_CAMERA_TYPE,
        cameraType: CameraType.Orthographic,
      });
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.OrthographicControls,
      });
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.Main,
      });
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.TwoDView
        ),
      });
      break;
    case ViewState.ThreeDView:
      yield put({
        type: blueStateTypes.SET_CAMERA_TYPE,
        cameraType: CameraType.Perspective,
      });
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.PerspectiveControls,
      });
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.Main,
      });
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.ThreeDView
        ),
      });
      break;
    case ViewState.PhotosphereView:
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.Photosphere,
      });
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.PhotosphereView
        ).filter((layer) => {
          const prohibitedLayers = [
            CameraLayers.Walls,
            CameraLayers.FloorplaneImage,
            CameraLayers.Floorplanes,
            CameraLayers.BasePlanes,
          ];
          return !prohibitedLayers.includes(layer);
        }),
      });
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.None,
      });
      yield put({ type: blueStateTypes.SET_SECTION_VIEW, sectionView: false });
      break;
    case ViewState.PhotosphereEdit:
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.Photosphere,
      });
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.PhotosphereEdit
        )
        // .filter((layer) => {
        //   const prohibitedLayers = [CameraLayers.Walls];
        //   return !prohibitedLayers.includes(layer);
        // }),
      });
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.None,
      });
      yield put({ type: blueStateTypes.SET_SECTION_VIEW, sectionView: false });
      break;
    case ViewState.TextureView:
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.TextureView
        )
      });
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.Texture,
      });
      yield put({
        type: blueStateTypes.SET_CAMERA_TYPE,
        cameraType: CameraType.Perspective,
      });
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.PerspectiveControls,
      });
      break;
    case ViewState.LabelView:
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.Label,
      });
      yield put({
        type: blueStateTypes.SET_CAMERA_TYPE,
        cameraType: CameraType.Orthographic,
      });
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.OrthographicControls,
      });
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.LabelView
        ),
      });
      break;
    case ViewState.ShapeView:
      yield put({
        type: blueStateTypes.SET_CAMERA_TYPE,
        cameraType: CameraType.Orthographic,
      });
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.OrthographicControls,
      });
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.Drawing,
      });
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.ShapeView
        ),
      });
      break;
    case ViewState.NumberView:
      yield put({
        type: blueStateTypes.SET_CAMERA_TYPE,
        cameraType: CameraType.Orthographic,
      });
      yield put({
        type: blueStateTypes.SET_CONTROLS_TYPE,
        controlsType: ControlsType.OrthographicControls,
      });
      yield put({
        type: blueStateTypes.SET_ACTIVE_CONTROLLER,
        controllerType: ControllerType.Number,
      });
      yield put({
        type: blueStateTypes.CAMERA_LAYERS_STATE,
        cameraLayersState: getCameraLayers(
          globalState.globalViewState,
          ViewState.NumberView
        ),
      });
      break;
      case ViewState.AttendeeView:
        yield put({
          type: blueStateTypes.SET_CAMERA_TYPE,
          cameraType: CameraType.Orthographic,
        });
        yield put({
          type: blueStateTypes.SET_CONTROLS_TYPE,
          controlsType: ControlsType.OrthographicControls,
        });
        yield put({
          type: blueStateTypes.SET_ACTIVE_CONTROLLER,
          controllerType: ControllerType.Attendee,
        });
        yield put({
          type: blueStateTypes.CAMERA_LAYERS_STATE,
          cameraLayersState: getCameraLayers(
            globalState.globalViewState,
            ViewState.AttendeeView
          ),
        });
        yield call(initAttendeeList);
        break;
      case ViewState.StreetView:
        yield put({
          type: blueStateTypes.SET_CAMERA_TYPE,
          cameraType: CameraType.FPVCamera,
        });
        yield put({
          type: blueStateTypes.SET_CONTROLS_TYPE,
          controlsType: ControlsType.PointerLock,
        });
        yield put({
          type: blueStateTypes.SET_ACTIVE_CONTROLLER,
          controllerType: ControllerType.None,
        });
        yield put({
          type: blueStateTypes.CAMERA_LAYERS_STATE,
          cameraLayersState: getCameraLayers(
            globalState.globalViewState,
            ViewState.StreetView
          ),
        });
        yield put({ type: blueStateTypes.SET_SECTION_VIEW, sectionView: false });
        break;
    default:
      if (currentControls !== ControlsType.OrthographicControls)
        yield put({
          type: blueStateTypes.SET_CONTROLS_TYPE,
          controlsType: ControlsType.OrthographicControls,
        });
      // if (currentCameraType !== CameraType.Orthographic) yield put({ type: blueStateTypes.SET_CAMERA_TYPE, cameraType: CameraType.Orthographic });
      break;
  }

  if (
    action.currentViewState === ViewState.Floorplan &&
    viewState !== ViewState.Floorplan
  ) {
    yield put({ type: designerTypes.REFRESH_FIXTURE_PLAN });
  }

  if (
    action.currentViewState !== ViewState.Floorplan &&
    viewState === ViewState.Floorplan
  ) {
    yield put({ type: designerTypes.REFRESH_FIXTURE_PLAN });
  }
}

function* changeToolState(action: ChangeToolStateAction) {
  const currentToolState: ToolState = yield select(
    (state: ReduxState) => state.globalstate.toolState
  );
  if (
    currentToolState === ToolState.AddBatch ||
    currentToolState === ToolState.NewBatch
  ) {
    yield put({ type: blueStateTypes.SET_MULTISELECT, multiSelect: false });
    yield put({ type: globalStateTypes.DISABLE_NAVIGATION, disable: true });
  } else {
    yield put({ type: globalStateTypes.DISABLE_NAVIGATION, disable: false });
  }
}
