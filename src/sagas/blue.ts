import {
  all,
  takeLatest,
  put,
  call,
  select,
  take,
  race,
  delay,
} from 'redux-saga/effects';
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from '../sharing/utils/localStorageHelper';
import { SagaReady } from '../reducers/lifecycle';
import { placezApi } from '../api';
import { SeatInstance } from '../blue/itemModifiers/ChairMod';

import {
  types,
  InitDesignerAction,
  SetCameraTypeAction,
  SetShaderViewAction,
  SetShaderViewSuccess,
  SetShaderViewFailure,
  SetControlsTypeAction,
  SetAutoRotateAction,
  ScreenshotAction,
  ScreenshotSuccess,
  ScreenshotFailure,
  SetPhotosphereAction,
  getBlueInitialized,
  ChangeCameraLayersAction,
  InitBatchItemAction,
  UpdateItemAction,
  HideChairAction,
  BlueInitAction,
  Save,
  NeedSaveAction,
  SavingAction,
  getSaveDebounceTimeSeconds,
  needSave,
  SetSelectedItems,
  sceneScanLoadedAction,
  CancelBatchAction,
  ApplyBatchAction,
  SetBatchSettingsAction,
  SetSelectedItemsAction,
  getSelectedItems,
  CancelBatch,
  ZoomInAction,
  RotateCameraAction,
  FitToViewAction,
  SetControlsTypeSuccess,
  ChangeCopiedAssetsState,
  isSaving,
  SetWatermark,
} from '../reducers/blue';
import { ToastMessage } from '../reducers/ui';
import {
  types as attendeeTypes,
  GetAttendeesByLayoutId,
} from '../reducers/attendee';
import { GetLabels } from '../reducers/label';
import {
  types as globalStateTypes,
  getGlobalViewState,
  getViewState,
} from '../reducers/globalState';
import { ViewState, ToolState } from '../models/GlobalState';
import { getCurrentScene, getSceneById, UpdateScene } from '../reducers/scenes';
import {
  CameraType,
  ShaderView,
  ControlsType,
} from '../components/Blue/models';
import {
  types as TypesOfLayoutsReducer,
  UpdateLayoutFailure,
  UpdateLayoutSuccess,
} from '../reducers/layouts';
import {
  types as TypesOfFloorPlanReducer,
  UpdateFloorPlanFailure,
  UpdateFloorPlanSuccess,
  CreateFloorPlanSuccess,
  CreateFloorPlanFailure,
  UpdateFloorPlan,
  UpdateFloorPlanAction,
} from '../reducers/floorPlans';
import {
  types as TypesOfDesignerReducer,
  getLayout,
  ResetLayout,
  ResetFixturePlan,
  GetDesignerFloorPlanSuccess,
  getFloorPlan,
} from '../reducers/designer';
import { ReduxState } from '../reducers';
import { GlobalViewState } from '../models/GlobalState';
import PlacezFixturePlan from '../api/placez/models/PlacezFixturePlan';
import PlacezLayoutPlan from '../api/placez/models/PlacezLayoutPlan';
import { Asset } from '../blue/items';
import PlacezCameraState from '../api/placez/models/PlacezCameraState';
import { store } from '..';
import {
  DefaultFloorMaterialPromise,
  DefaultMaterialIds,
  DefaultWallMaterialPromise,
  FallbackFloorMaterial,
  FallbackWallMaterial,
} from '../api/placez/models/PlacezMaterial';
import { Item } from '../blue/items/item';
import {
  CAMERA_LAYERS_LOCAL_STATE_VAR,
  CameraLayers,
  ControllerType,
  ProhibitedLayers,
  RequiredLayers,
} from '../models/BlueState';
import { Utils } from '../blue/core/utils';
import { SkuType } from '../blue/items/asset';
import { PlacezShape } from '../blue/shapes/placezShapes';
import { AttendeeSkuTypes } from '../blue/controllers/attendeeController';
import Attendee from '../api/placez/models/Attendee';

const layoutScene = (state: ReduxState) => {
  const sceneId =
    state.designer && state.designer.layout && state.designer.layout.sceneId;
  if (sceneId) {
    return getSceneById(state, sceneId);
  }

  return undefined;
};

let designer: any;

export default function* blueSaga() {
  yield all([
    takeLatest(types.LOAD_LAYOUT, loadLayout),
    takeLatest(types.LOAD_FIXTURE_PLAN, loadFixturePlan),
    takeLatest(types.INIT_DESIGNER, initDesigner),
    takeLatest(types.SET_CAMERA_TYPE, setCameraType),
    takeLatest(types.SET_SHADER_VIEW, setShaderView),
    takeLatest(types.SET_CONTROLS_TYPE, setControlsType),
    takeLatest(types.SET_AUTO_ROTATE, setAutoRotate),
    takeLatest(types.SCREENSHOT, screenshot),
    takeLatest(types.SET_PHOTOSPHERE, setPhotosphere),
    takeLatest(types.SAVE, save),
    takeLatest(types.NEED_SAVE, debounceSave),
    takeLatest(types.SAVE_LAYOUT, saveLayout),
    takeLatest(types.SAVE_FIXTURE, saveFixture),
    takeLatest(types.SAVE_FLOORPLAN, saveFloorplan),
    takeLatest(types.RESET, reset),
    takeLatest(types.CAMERA_LAYERS_STATE, changeCameraLayersState),
    takeLatest(attendeeTypes.UPDATE_ATTENDEE_SUCCESS, refreshAttendeeList),
    takeLatest(attendeeTypes.UPDATE_ATTENDEES_SUCCESS, refreshAttendeeList),
    takeLatest(attendeeTypes.DELETE_ATTENDEE_SUCCESS, refreshAttendeeList),
    takeLatest(attendeeTypes.SELECT_ATTENDEE, refreshAttendeeList),
    takeLatest(types.SET_TABLE_NUMBER, tableNumber),
    takeLatest(types.INCREMENT_NEXT_TABLE_NUMBER, tableNumber),
    takeLatest(types.INIT_BATCH_ITEM, initBatchItem),
    takeLatest(types.TAKE_EQUIRECTANGULAR_PHOTO, takePhotosphere),
    takeLatest(types.UPDATE_ITEM, updateItem),
    takeLatest(types.HIDE_CHAIR, hideChair),
    takeLatest(types.DISPOSE_DESIGNER, disposeDesigner),
    takeLatest(types.CANCEL_BATCH, cancelBatch),
    takeLatest(types.APPLY_BATCH, applyBatch),
    takeLatest(types.SET_BATCH_SETTINGS, setBatchSettings),
    takeLatest(types.SELECTED_ITEMS, selectedItems),
    takeLatest(types.ZOOM_IN, zoomIn),
    takeLatest(types.ZOOM_OUT, zoomOut),
    takeLatest(types.FIT_TO_VIEW, fitToView),
    takeLatest(types.ROTATE_CAMERA, rotateCamera),
    takeLatest(TypesOfDesignerReducer.REFRESH_FIXTURE_PLAN, refreshFloorPlan),
  ]);
  yield put(SagaReady('blue'));
}

function initDesigner(action: InitDesignerAction) {
  designer = action.designer;
}

function setCameraType(action: SetCameraTypeAction) {
  if (designer) designer.getMain().setCamera(action.cameraType);
}

function* setShaderView(action: SetShaderViewAction) {
  try {
    switch (action.shaderView) {
      case ShaderView.None:
        designer.getMain().setView(action.shaderView);
        break;
      case ShaderView.BlackAndWhite:
        designer.getMain().setView(action.shaderView);
        break;
      default:
        yield put(SetShaderViewFailure('Unknown Shader'));
    }
    yield put(SetShaderViewSuccess(action.shaderView));
  } catch (error) {
    yield put(SetShaderViewFailure(error));
  }
}

function* setControlsType(action: SetControlsTypeAction) {
  if (!designer) return;
  switch (action.controlsType) {
    case ControlsType.OrthographicControls:
      designer.getMain().setOrthographicControls();
      yield put(SetControlsTypeSuccess(action.controlsType));
      break;
    case ControlsType.PerspectiveControls:
      designer.getMain().setPerspectiveControls();
      yield put(SetControlsTypeSuccess(action.controlsType));
      break;
    case ControlsType.PointerLock:
      designer.getMain().streetView(action.position, action.direction);
      yield put(SetControlsTypeSuccess(action.controlsType));
      break;
    case ControlsType.Photosphere:
      designer.getMain().PhotosphereView(action.position, action.direction);
      yield put(SetControlsTypeSuccess(action.controlsType));
      break;
    default:
      break;
  }
}

function setPhotosphere(action: SetPhotosphereAction) {
  if (action.editPhotosphere) {
    designer.getMain().editPhotosphere(action.photosphere);
  } else {
    designer.getMain().viewPhotosphere(action.photosphere);
  }
}

function setAutoRotate(action: SetAutoRotateAction) {
  designer.getMain().controls.autoRotate = action.autoRotate;
}

function* screenshot(action: ScreenshotAction) {
  try {
    const watermarkUrl = yield select(
      (state: ReduxState) => state.blue.watermarkUrl
    );
    const watermarkOpacity = yield select(
      (state: ReduxState) => state.blue.watermarkOpacity
    );
    const watermarkSize = yield select(
      (state: ReduxState) => state.blue.watermarkSize
    );

    if (action.setSceneImage) {
      store.dispatch(ToastMessage('Saving Image', null));
      const blob = yield call(designer.getMain().getBlobAsync);
      const scene = yield select(getCurrentScene);

      // Apply watermark if exists
      let finalBlob = blob;
      if (watermarkUrl) {
        finalBlob = yield call(
          applyWatermarkToBlob,
          blob,
          watermarkUrl,
          watermarkOpacity,
          watermarkSize
        );
      }

      const formData = new FormData();
      formData.append('file', finalBlob);

      const data = yield call(placezApi.postBlob, formData);
      scene.thumbnailUrl = data.parsedBody.url;

      yield put(UpdateScene(scene));
      store.dispatch(ToastMessage('Image Saved'));

      // Clear watermark after successful save
      if (watermarkUrl) {
        yield put(SetWatermark(''));
      }
    }

    if (action.setFloorplanImage) {
      store.dispatch(ToastMessage('Saving Image', null));
      const blob = yield call(designer.getMain().getBlobAsync);
      const placePlan: PlacezFixturePlan = yield select(
        (state: ReduxState) => state.designer.floorPlan
      );

      // Apply watermark if exists
      let finalBlob = blob;
      if (watermarkUrl) {
        finalBlob = yield call(
          applyWatermarkToBlob,
          blob,
          watermarkUrl,
          watermarkOpacity,
          watermarkSize
        );
      }

      const formData = new FormData();
      formData.append('file', finalBlob);

      const data = yield call(placezApi.postBlob, formData);
      placePlan.thumbnailUrl = data.parsedBody.url;

      yield put(UpdateFloorPlan(placePlan));
      store.dispatch(ToastMessage('Image Saved'));
    }

    if (action.download) {
      store.dispatch(ToastMessage('Generating Download'));

      // Get event name for filename
      const layout = yield select(getLayout);
      const eventName = layout?.name || 'screenshot';

      if (watermarkUrl) {
        // Get blob and apply watermark
        const blob = yield call(designer.getMain().getBlobAsync);
        const watermarkedBlob = yield call(
          applyWatermarkToBlob,
          blob,
          watermarkUrl,
          watermarkOpacity,
          watermarkSize
        );

        // Create download link for watermarked image
        const url = URL.createObjectURL(watermarkedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${eventName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        designer.getMain().screenCapture(action.download);
      }

      store.dispatch(ToastMessage('Download Complete'));

      // Clear watermark after successful download
      if (watermarkUrl) {
        yield put(SetWatermark(''));
      }
    }

    yield put(ScreenshotSuccess());
  } catch (error) {
    yield put(ScreenshotFailure(error));
  }
}

function* debounceSave(action: NeedSaveAction) {
  if (action.needSave) {
    const saveDebounceTimeSeconds = yield select(getSaveDebounceTimeSeconds);
    yield delay(saveDebounceTimeSeconds * 1000);
    if (yield select(needSave)) yield call(save);
  }
}

function* save() {
  const saving = yield select(isSaving);
  if (saving) return;
  const globalViewState = yield select(getGlobalViewState);
  const viewState = yield select(getViewState);
  if (globalViewState === GlobalViewState.Fixtures) {
    if (viewState === ViewState.Floorplan) {
      yield call(saveFloorplan);
    } else {
      yield call(saveFixture);
    }
  } else if (globalViewState === GlobalViewState.Layout) {
    yield call(saveLayout);
  }
}

function* reset() {
  yield put(CancelBatch());
  yield put(NeedSaveAction(false));
  const globalViewState = yield select(getGlobalViewState);
  yield put(BlueInitAction(false));
  if (globalViewState === GlobalViewState.Fixtures) {
    yield put(ResetFixturePlan());
  } else if (globalViewState === GlobalViewState.Layout) {
    yield put(ResetLayout());
  }
}

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function applyWatermarkToBlob(
  screenshotBlob: Blob,
  watermarkUrl: string,
  opacity: number,
  size: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const screenshotImg = new Image();
    const watermarkImg = new Image();

    screenshotImg.onload = () => {
      // Set canvas size to match screenshot
      canvas.width = screenshotImg.width;
      canvas.height = screenshotImg.height;

      // Draw screenshot
      ctx.drawImage(screenshotImg, 0, 0);

      // Convert watermark URL to blob to avoid CORS issues
      fetch(watermarkUrl)
        .then((response) => response.blob())
        .then((watermarkBlob) => {
          const watermarkObjectUrl = URL.createObjectURL(watermarkBlob);

          watermarkImg.onload = () => {
            // Calculate watermark size while maintaining aspect ratio
            const screenshotAspectRatio =
              screenshotImg.width / screenshotImg.height;
            const watermarkAspectRatio =
              watermarkImg.width / watermarkImg.height;

            let watermarkWidth, watermarkHeight;

            // Scale watermark to fit within screenshot while maintaining aspect ratio
            // Use the size parameter (0.1 to 0.5 range) to control watermark size
            const maxWatermarkWidth = screenshotImg.width * size;
            const maxWatermarkHeight = screenshotImg.height * size;

            if (watermarkAspectRatio > screenshotAspectRatio) {
              // Watermark is wider relative to height
              watermarkWidth = Math.min(
                maxWatermarkWidth,
                screenshotImg.width * size
              );
              watermarkHeight = watermarkWidth / watermarkAspectRatio;
            } else {
              // Watermark is taller relative to width
              watermarkHeight = Math.min(
                maxWatermarkHeight,
                screenshotImg.height * size
              );
              watermarkWidth = watermarkHeight * watermarkAspectRatio;
            }

            // Calculate position to center the watermark
            const x = (canvas.width - watermarkWidth) / 2;
            const y = (canvas.height - watermarkHeight) / 2;

            // Set opacity
            ctx.globalAlpha = opacity;

            // Draw watermark
            ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);

            // Reset opacity
            ctx.globalAlpha = 1.0;

            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                URL.revokeObjectURL(watermarkObjectUrl); // Clean up
                resolve(blob);
              } else {
                URL.revokeObjectURL(watermarkObjectUrl); // Clean up
                reject(new Error('Failed to create blob'));
              }
            }, 'image/png');
          };

          watermarkImg.onerror = () => {
            URL.revokeObjectURL(watermarkObjectUrl); // Clean up
            reject(new Error('Failed to load watermark image'));
          };

          watermarkImg.src = watermarkObjectUrl;
        })
        .catch((error) => {
          reject(new Error(`Failed to fetch watermark: ${error.message}`));
        });
    };

    screenshotImg.onerror = () => {
      reject(new Error('Failed to load screenshot image'));
    };

    screenshotImg.src = URL.createObjectURL(screenshotBlob);
  });
}

function* captureOrthoView(id: string, cameraState: PlacezCameraState) {
  let dataUrl;
  const currentCameraType: CameraType = yield select(
    (state: ReduxState) => state.blue.cameraType
  );
  if (currentCameraType !== CameraType.Orthographic) {
    yield put({
      type: types.SET_CAMERA_TYPE,
      cameraType: CameraType.Orthographic,
    });
    designer.getMain().fitToView();
    dataUrl = designer.getMain().screenCapture();
    yield put({ type: types.SET_CAMERA_TYPE, cameraType: currentCameraType });
    designer.getMain().loadCameraState(cameraState);
  } else {
    designer.getMain().fitToView();
    dataUrl = designer.getMain().screenCapture();
    designer.getMain().loadCameraState(cameraState);
  }

  const blob = dataURLtoBlob(dataUrl);
  const formData = new FormData();
  formData.append('file', blob);
  const data = yield call(placezApi.postBlob, formData, id);
  return data.parsedBody.url;
}

function* saveLayout() {
  yield put(SavingAction(true));
  const items: Asset[] = designer
    .getModel()
    .scene.getAssets(designer.getMain(), true);
  const cameraState: PlacezCameraState = designer.getMain().getCameraState();

  // take screenshot
  const layout: PlacezLayoutPlan = yield select(getLayout);
  const viewState = yield select(getViewState);

  const dimensions = designer.getMain().shapes.map((dim: PlacezShape) => {
    return dim.serialize();
  });
  const price = 0;
  const newLayoutPlan: PlacezLayoutPlan = {
    ...layout,
    items,
    cameraState,
    dimensions,
    price,
  };

  if (viewState !== ViewState.Floorplan) {
    const imageUrl = yield captureOrthoView(layout.id, cameraState);
    newLayoutPlan.imageUrl = imageUrl;
  }

  yield put({
    type: TypesOfLayoutsReducer.UPDATE_LAYOUT,
    layout: newLayoutPlan,
  });
  yield race([
    take(UpdateLayoutSuccess),
    // TODO handle save failure
    take(UpdateLayoutFailure),
  ]);
  yield put({ type: TypesOfDesignerReducer.REQUIRE_NEW_DESIGN_EXPORT });
}

function* saveFixture() {
  const placePlan: PlacezFixturePlan = yield select(
    (state: ReduxState) => state.designer.floorPlan
  );

  const fixtures: Asset[] = designer
    .getModel()
    .scene.getAssets(designer.getMain(), true);
  const newBlueFloorPlan = designer.getModel().exportFloorPlan();
  const dimensions = designer.getMain().shapes.map((dim: PlacezShape) => {
    return dim.serialize();
  });

  const cameraState: PlacezCameraState = designer.getMain().getCameraState();

  const newPlacePlan: PlacezFixturePlan = {
    ...placePlan,
    ...newBlueFloorPlan,
    fixtures,
    dimensions,
  };

  const viewState = yield select(getViewState);
  if (viewState !== ViewState.Floorplan) {
    const imageUrl = yield captureOrthoView(placePlan.id, cameraState);
    newPlacePlan.thumbnailUrl = imageUrl;
  }

  if (placePlan.id) {
    yield put({
      type: TypesOfFloorPlanReducer.UPDATE_FLOOR_PLAN,
      floorPlan: newPlacePlan,
    });
    const result = yield race([
      take(UpdateFloorPlanSuccess),
      take(UpdateFloorPlanFailure),
    ]);

    if (result[UpdateFloorPlanFailure.toString()]) {
      console.error(
        'saveFixture() - Floor plan update failed:',
        result[UpdateFloorPlanFailure.toString()]
      );
      yield put(ToastMessage('Failed to save floor plan changes'));
    }
  } else {
    yield put({
      type: TypesOfFloorPlanReducer.CREATE_FLOOR_PLAN,
      floorPlan: newPlacePlan,
    });
    yield race([
      take(CreateFloorPlanSuccess),
      // TODO handle create failure
      take(CreateFloorPlanFailure),
    ]);
  }
}

function* saveFloorplan() {
  yield put(SavingAction(true));
  // Build / update new floorplan update photosphere and fixtures in it
  const newBlueFloorPlan = designer.getModel().exportFloorPlan();
  const floorPlan: PlacezFixturePlan = yield select(
    (state: ReduxState) => state.designer.floorPlan
  );

  const newPlacePlan: PlacezFixturePlan = {
    ...floorPlan,
    ...newBlueFloorPlan,
  };

  if (floorPlan.id) {
    yield put({
      type: TypesOfFloorPlanReducer.UPDATE_FLOOR_PLAN,
      floorPlan: newPlacePlan,
    });
    const result = yield race([
      take(UpdateFloorPlanSuccess),
      take(UpdateFloorPlanFailure),
    ]);

    if (result[UpdateFloorPlanFailure.toString()]) {
      console.error(
        'saveFloorplan() - Floor plan update failed:',
        result[UpdateFloorPlanFailure.toString()]
      );
      yield put(ToastMessage('Failed to save floor plan'));
    }
  } else {
    yield put({
      type: TypesOfFloorPlanReducer.CREATE_FLOOR_PLAN,
      floorPlan: newPlacePlan,
    });
    yield race([
      take(CreateFloorPlanSuccess),
      // TODO handle create failure
      take(CreateFloorPlanFailure),
    ]);
  }
}

function* changeCameraLayersState(action: ChangeCameraLayersAction) {
  const globalViewState = yield select(getGlobalViewState);
  const viewState = yield select(getViewState);
  const cameraLayersLocalState = getFromLocalStorage(
    CAMERA_LAYERS_LOCAL_STATE_VAR
  );
  if (cameraLayersLocalState === undefined) return;
  const newLayersSet = new Set(
    action.cameraLayersState
      .concat(RequiredLayers[viewState]?.cameraLayers ?? [])
      .filter(
        (layer: CameraLayers) =>
          !ProhibitedLayers[viewState]?.cameraLayers?.includes(layer)
      )
  );
  const newLayers = [...newLayersSet];
  cameraLayersLocalState[globalViewState][viewState] = {
    cameraLayers: newLayers,
  };
  saveToLocalStorage(CAMERA_LAYERS_LOCAL_STATE_VAR, cameraLayersLocalState);
}

function* loadLayout() {
  yield put(SetSelectedItems([]));
  yield put({ type: types.LAYOUT_LOADING, layoutLoading: true });

  try {
    let floorPlan: PlacezFixturePlan = yield select(getFloorPlan);
    floorPlan = JSON.parse(JSON.stringify(floorPlan));
    if (floorPlan) {
      let defaultWallMaterial = FallbackWallMaterial.clone();
      try {
        const wallMaterialResponse = yield call(
          placezApi.getMaterial,
          DefaultMaterialIds.defaultWallMaterial
        );
        defaultWallMaterial = yield call(
          DefaultWallMaterialPromise,
          wallMaterialResponse.parsedBody
        );
      } catch (error) {}
      let defaultFloorMaterial = FallbackFloorMaterial.clone();
      try {
        const floorMaterialResponse = yield call(
          placezApi.getMaterial,
          DefaultMaterialIds.defaultFloorMaterial
        );
        defaultFloorMaterial = yield call(
          DefaultFloorMaterialPromise,
          floorMaterialResponse.parsedBody
        );
      } catch (error) {}

      designer
        .getModel()
        .loadFloorplan(floorPlan, defaultWallMaterial, defaultFloorMaterial);
      if (floorPlan.fixtures) {
        try {
          yield call(() =>
            designer.getModel().importFixturesAsync(floorPlan.fixtures)
          );
        } catch (error) {
          console.error(error);
        }
      }
      if (floorPlan?.sceneScans?.length > 0) {
        yield call(() =>
          designer.getMain().loadSceneScans(floorPlan.sceneScans)
        );
      } else {
        yield put(sceneScanLoadedAction());
      }
    }

    let layout: PlacezLayoutPlan = yield select(getLayout);
    layout = JSON.parse(JSON.stringify(layout));
    if (layout) {
      designer.getMain().initCameraAndControls(layout.cameraState);
      const main = designer.getMain();
      yield call(() => designer.getModel().scene.loadAsync(layout, main));
      yield put(BlueInitAction());
      yield put(GetAttendeesByLayoutId(layout.id));
      yield put(GetLabels());
      if (layout.layoutLabels) {
        yield put({
          type: types.SELECTED_LABEL_ID,
          selectedLabelId: undefined,
        });
      }
      main.clearDimensions();
      if (layout.dimensions) {
        main.drawDimensions(layout.dimensions);
      }
    }
  } catch (error) {
    console.warn(error);
  }

  yield put({ type: types.LAYOUT_LOADING, layoutLoading: false });
  const layout: PlacezLayoutPlan = yield select(getLayout);
  if (layout) {
    yield put(GetAttendeesByLayoutId(layout.id));
  }
}

function* loadFixturePlan() {
  yield put(SetSelectedItems([]));
  yield put({ type: types.LAYOUT_LOADING, layoutLoading: true });

  try {
    let floorPlan: PlacezFixturePlan = yield select(getFloorPlan);
    floorPlan = JSON.parse(JSON.stringify(floorPlan));
    if (floorPlan) {
      const wallMaterialResponse = yield call(
        placezApi.getMaterial,
        DefaultMaterialIds.defaultWallMaterial
      );
      const defaultWallMaterial = yield call(
        DefaultWallMaterialPromise,
        wallMaterialResponse.parsedBody
      );
      const floorMaterialResponse = yield call(
        placezApi.getMaterial,
        DefaultMaterialIds.defaultFloorMaterial
      );
      const defaultFloorMaterial = yield call(
        DefaultFloorMaterialPromise,
        floorMaterialResponse.parsedBody
      );

      designer
        .getModel()
        .loadFloorplan(floorPlan, defaultWallMaterial, defaultFloorMaterial);
      designer.getFloorPlan().initCameraAndControls(floorPlan.cameraState);
      designer.getMain().initCameraAndControls(floorPlan.cameraState);
      designer.getFloorPlan()?.getController()?.updateWallLabels();

      if (floorPlan?.sceneScans?.length > 0) {
        yield call(() =>
          designer.getMain().loadSceneScans(floorPlan.sceneScans)
        );
      } else {
        yield put(sceneScanLoadedAction());
      }
      if (floorPlan?.fixtures?.length > 0) {
        const main = designer.getMain();
        yield call(() => designer.getModel().scene.loadAsync(floorPlan, main));
      }
      if (floorPlan?.dimensions?.length > 0) {
        const main = designer.getMain();
        main.drawDimensions(floorPlan.dimensions);
      }
      yield put(BlueInitAction());
    }
  } catch (error) {
    console.error(error);
  }

  yield put({ type: types.LAYOUT_LOADING, layoutLoading: false });
}

function* waitBlueInitialized() {
  const blueInitialized: boolean = yield select(getBlueInitialized);
  if (!blueInitialized) {
    yield take(types.INIT_DESIGNER);
  }
}

export function* initAttendeeList() {
  yield call(waitBlueInitialized);

  const attendees: Attendee[] = yield select(
    (state: ReduxState) => state.attendee.attendees
  );
  const main = designer.getMain();

  const model = main.getModel();

  const tableItems = model.scene.getItems().filter((item: Item) => {
    return AttendeeSkuTypes.includes(SkuType[item.asset.skuType]);
  });

  // TODO this is a hack and will not work if you remove the last table
  if (tableItems.length !== 0) {
    const chairsPerTable = tableItems.reduce((acc, item: Item) => {
      if (SkuType[item.asset.skuType] === SkuType.TBL) {
        acc[item.asset.instanceId] =
          item.asset?.modifiers?.chairMod?.seats ?? 0;
      } else {
        acc[item.asset.instanceId] = undefined;
      }
      return acc;
    }, {});

    const updatedAttendees = attendees.map((attendee: Attendee) => {
      const tableItem = tableItems.find((item: Item) => {
        return item.asset.instanceId === attendee.tableId;
      });

      const foundChair =
        chairsPerTable[attendee.tableId] >= attendee.chairNumber;

      if (
        tableItem?.asset &&
        (attendee.chairNumber === undefined || foundChair)
      ) {
        return {
          ...attendee,
          tableInfo: tableItem.asset?.labels?.tableNumberLabel ?? '',
        };
      }
      return {
        ...attendee,
        tableId: undefined,
        tableInfo: undefined,
        chairNumber: undefined,
      };
    });

    if (JSON.stringify(updatedAttendees) !== JSON.stringify(attendees)) {
      yield put({
        type: attendeeTypes.UPDATE_ATTENDEES,
        attendees: updatedAttendees,
      });
    }
  }

  yield call(refreshAttendeeList);
}

function* refreshAttendeeList() {
  yield call(waitBlueInitialized);

  const attendees: Attendee[] = yield select(
    (state: ReduxState) => state.attendee.attendees
  );
  const selectedattendeeId: number = yield select(
    (state: ReduxState) => state.attendee.selectedId
  );
  const main = designer.getMain();
  main.buildAttendeeLocations(attendees, selectedattendeeId);
}

function* tableNumber() {
  // check if nextTableNumber exists
  const assets: Asset[] = designer
    .getModel()
    .scene.getAssets(designer.getMain(), true);
  const nextTableNumber: number = yield select(
    (state: ReduxState) => state.blue.nextTableNumber
  );
  if (
    assets.find((asset: Asset) => {
      return parseInt(asset.labels.tableNumberLabel, 10) === nextTableNumber;
    })
  ) {
    store.dispatch(
      ToastMessage(`Table Number: ${nextTableNumber} Is Already Used`)
    );
  }
}

function* initBatchItem(action: InitBatchItemAction) {
  yield call(() =>
    designer.getModel().scene.initBatchItem(action.asset, action?.cb)
  );
}

function* takePhotosphere() {
  const photosphereUrl = yield call(designer.getMain().getEquirectangular);
  yield put({ type: types.SELECT_EQUIRECTANGULAR_PHOTO, url: photosphereUrl });
}

function* updateItem(action: UpdateItemAction) {
  yield call(() => designer.getModel().scene.updateItemModifiers(action.asset));
}

function* hideChair(action: HideChairAction) {
  const { chairNumber, tableId } = action.attendee;

  const items: Asset[] = designer
    .getModel()
    .scene.getAssets(designer.getMain(), true);

  yield put({
    type: attendeeTypes.UNSEAT_ATTENDEE,
    chairNumber,
    tableInstanceId: tableId,
    shiftSeats: true,
  });
  yield take('UPDATE_ATTENDEES_SUCCESS');

  // Hide the Chair
  let newAsset = undefined;
  const newItems = items.map((assetInstance: Asset) => {
    if (assetInstance.instanceId === tableId) {
      newAsset = {
        ...assetInstance,
        modifiers: {
          ...assetInstance.modifiers,
          chairMod: {
            ...assetInstance.modifiers.chairMod,
            seatPositions: assetInstance.modifiers.chairMod.seatPositions.map(
              (seat: SeatInstance): SeatInstance => {
                if (seat.chairNumber === chairNumber) {
                  return {
                    ...seat,
                    hidden: true,
                  };
                }
                return seat;
              }
            ),
          },
        },
      };
      return newAsset;
    } else {
      return assetInstance;
    }
  });

  if (newAsset) {
    yield put({ type: types.UPDATE_ITEM, asset: newAsset });
    const layout: PlacezLayoutPlan = yield select(getLayout);

    const newLayoutPlan: PlacezLayoutPlan = {
      ...layout,
      items: newItems,
    };

    yield put({
      type: TypesOfLayoutsReducer.UPDATE_LAYOUT,
      layout: newLayoutPlan,
    });
    yield take(UpdateLayoutSuccess);
    yield put(Save());
  }
}

function* disposeDesigner() {
  //TODO maybe check globalviewState before put
  yield put(GetDesignerFloorPlanSuccess(null));
  yield put(NeedSaveAction(false));
}

function* cancelBatch(action: CancelBatchAction) {
  try {
    const main = designer.getMain();
    const batchController = main.getController();
    yield put({
      type: types.SET_ACTIVE_CONTROLLER,
      controllerType: ControllerType.Main,
    });
    // const selectedItems = yield select(getSelectedItems);
    // if (selectedItems && selectedItems.length > 0) {
    //   yield put({
    //     type: globalStateTypes.TOOL_STATE,
    //     toolState: ToolState.EditItem,
    //   });
    // } else {
    //   yield put({
    //     type: globalStateTypes.TOOL_STATE,
    //     toolState: ToolState.Default,
    //   });
    // }
    yield put({
      type: globalStateTypes.TOOL_STATE,
      toolState: ToolState.Default,
    });
    batchController?.clearBatch();
  } catch (error) {}
}

function* applyBatch(action: ApplyBatchAction) {
  try {
    const main = designer.getMain();
    yield put({
      type: types.SET_ACTIVE_CONTROLLER,
      controllerType: ControllerType.Main,
    });
    const selectedItems = yield select(getSelectedItems);
    const batchGuid = designer.getModel().scene.setBatchGuid(selectedItems);
    main.getController().updateItemsList();
    const batchItems = main
      .getModel()
      .scene.getItems()
      .filter((item: Item) => item.asset.groupId === batchGuid);
    main.getController()?.confirmBatch();
    main.getController().selectItems(batchItems);
  } catch (error) {}
}

function* setBatchSettings(action: SetBatchSettingsAction) {
  const main = designer.getMain();
  const currentController: ControllerType = yield select(
    (state: ReduxState) => state.blue.activeController
  );
  if (action?.batchSettings) {
    if (currentController !== action.batchSettings.controllerType) {
      yield put({
        type: types.SET_ACTIVE_CONTROLLER,
        controllerType: action.batchSettings.controllerType,
      });
    }
    main.getController()?.updateBatch(action?.batchSettings);
  } else {
    main.getController()?.resetBatch();
  }
}

function* selectedItems(action: SetSelectedItemsAction) {
  yield put({
    type: globalStateTypes.TOOL_STATE,
    toolState: ToolState.Default,
  });
  if (action.selectedItems[0] !== undefined) {
    //   yield put({
    //     type: globalStateTypes.TOOL_STATE,
    //     toolState: ToolState.EditItem,
    //   });
    const main = designer.getMain();
    main
      .getModel()
      .scene.collisionHandler.getCollisionItemsForSelected(
        action.selectedItems
      );
    main
      .getModel()
      .scene.collisionHandler.getIntersectionItemsForSelected(
        action.selectedItems
      );
    action.selectedItems.forEach((item: Item) => {
      item.updateCollisionSettings(designer.getModel());
    });
  }
  // } else {
  //   yield put({
  //     type: globalStateTypes.TOOL_STATE,
  //     toolState: ToolState.Default,
  //   });
  // }
}

function zoomIn(action: ZoomInAction) {
  const main = designer.getMain();
  main.controls.dollyIn(main.controls.getZoomScale());
  main.controls.update();
  main.needsUpdate();
  const floorplanner = designer.getFloorPlan();
  if (floorplanner) {
    floorplanner.controls.dollyIn(main.controls.getZoomScale());
    floorplanner.controls.update();
    floorplanner.needsUpdate();
  }
}

function zoomOut(action: ZoomInAction) {
  const main = designer.getMain();
  main.controls.dollyOut(main.controls.getZoomScale());
  main.controls.update();
  main.needsUpdate();

  const floorplanner = designer.getFloorPlan();
  if (floorplanner) {
    floorplanner.controls.dollyOut(main.controls.getZoomScale());
    floorplanner.controls.update();
    floorplanner.needsUpdate();
  }
}

function* fitToView(action: FitToViewAction) {
  const viewState = yield select(getViewState);
  const globalViewState: GlobalViewState = yield select(getGlobalViewState);

  if (globalViewState === GlobalViewState.Fixtures) {
    if (viewState === ViewState.Floorplan) {
      const floorPlanner = designer.getFloorPlan();
      floorPlanner.fitToView();
      floorPlanner.floorplan.setAzimuth(
        floorPlanner.controls.getAzimuthalAngle()
      );
      floorPlanner.needsUpdate();
    } else {
      const main = designer.getMain();
      main.fitToView();
      main.needsUpdate();
    }
  } else {
    const main = designer.getMain();
    main.fitToView();
    main.needsUpdate();
  }
}

function* rotateCamera(action: RotateCameraAction) {
  const globalViewState = yield select(getGlobalViewState);
  const newAngle = isNaN(action.degreeAngle) ? 0 : action.degreeAngle;

  if (globalViewState === GlobalViewState.Fixtures) {
    const floorPlanner = designer.getFloorPlan();
    floorPlanner.controls.setCameraRotation(
      Utils.convertToRadians(-newAngle % 360)
    );
    floorPlanner.floorplan.setAzimuth(
      floorPlanner.controls.getAzimuthalAngle()
    );
    const main = designer.getMain();
    main.controls.setCameraRotation(Utils.convertToRadians(-newAngle % 360));
    main.needsUpdate();
  } else {
    const main = designer.getMain();
    main.controls.setCameraRotation(Utils.convertToRadians(-newAngle % 360));
    main.needsUpdate();
  }
}

function* refreshFloorPlan(action: UpdateFloorPlanAction) {
  yield put(SetSelectedItems([]));
  designer.getFloorPlan().floorplan.update();
  designer.getMain().roomLoaded();
  yield put(ChangeCopiedAssetsState(undefined));

  const designerFloorplan = yield select(getFloorPlan);
  designer.getFloorPlan().loadCameraState(designerFloorplan.cameraState);
  designer.getMain().loadCameraState(designerFloorplan.cameraState);
}
