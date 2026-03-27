import createReducer from './helpers/createReducer';
import {
  CameraType,
  ShaderView,
  ControlsType,
} from '../components/Blue/models';
import { Photosphere } from '../components/Blue/models/Photosphere';
import {
  CameraLayers,
  ControllerType,
  ControllerMode,
  DrawingMode,
} from '../models/BlueState';
import { Asset, AssetGroup } from '../blue/items';
import Attendee from '../api/placez/models/Attendee';
import { Item } from '../blue/items/item';
import { GridCell } from '../blue/core/utils';
import { Points } from 'three';

// Action Types
const INIT_DESIGNER = 'INIT_DESIGNER';
const SET_CAMERA_TYPE = 'SET_CAMERA_TYPE';
const SET_SHADER_VIEW = 'SET_SHADER_VIEW';
const SET_SHADER_VIEW_SUCCESS = 'SET_SHADER_VIEW_SUCCESS';
const SET_SHADER_VIEW_FAILURE = 'SET_SHADER_VIEW_FAILURE';
const SET_CONTROLS_TYPE = 'SET_CONTROLS_TYPE';
const SET_CONTROLS_TYPE_SUCCESS = 'SET_CONTROLS_TYPE_SUCCESS';
const SET_CONTROLS_TYPE_FAILURE = 'SET_CONTROLS_TYPE_FAILURE';
const SET_AUTO_ROTATE = 'SET_AUTO_ROTATE';
const DISPOSE_DESIGNER = 'DISPOSE_DESIGNER';
const SET_PHOTOSPHERE = 'SET_PHOTOSPHERE';
const SCREENSHOT = 'SCREENSHOT';
const SCREENSHOT_SUCCESS = 'SCREENSHOT_SUCCESS';
const SCREENSHOT_FAILURE = 'SCREENSHOT_FAILURE';
const AUTO_ROTATE_PHOTOSPHERE_CAMERA = 'AUTO_ROTATE_PHOTOSPHERE_CAMERA';
const SET_SAVE_DEBOUNCE_TIME_SECONDS = 'SET_SAVE_DEBOUNCE_TIME_SECONDS';
const SAVE = 'SAVE';
const SAVING = 'SAVING';
const NEED_SAVE = 'NEED_SAVE';
const SAVE_LAYOUT = 'SAVE_LAYOUT';
const SAVE_FIXTURE = 'SAVE_FIXTURE';
const SAVE_FLOORPLAN = 'SAVE_FLOORPLAN';
const LAYOUT_LOADING = 'LAYOUT_LOADING';
const CAMERA_LAYERS_STATE = 'CAMERA_LAYERS_STATE';
const LOAD_LAYOUT = 'LOAD_LAYOUT';
const LOAD_FIXTURE_PLAN = 'LOAD_FIXTURE_PLAN';
const SET_MULTISELECT = 'SET_MULTISELECT';
const COPIED_ASSET_STATE = 'COPIED_ASSET_STATE';
const SELECTED_ITEMS = 'SELECTED_ITEMS';
const SELECTED_LABEL_ID = 'SELECTED_LABEL_ID';
const SET_ACTIVE_CONTROLLER = 'SET_ACTIVE_CONTROLLER';
const SELECTED_SURFACES = 'SELECTED_SURFACES';
const SELECTED_POINTS = 'SELECTED_POINTS';
const SET_CONTROLLER_MODE = 'SET_CONTROLLER_MODE';
const SET_DRAWING_MODE = 'SET_DRAWING_MODE';
const SET_STATS = 'SET_STATS';
const CONFIGURE_ASSET = 'CONFIGURE_ASSET';
const SET_TABLE_NUMBER = 'SET_CURRENT_TABLE_NUMBER';
const INCREMENT_NEXT_TABLE_NUMBER = 'INCREMENT_NEXT_TABLE_NUMBER';
const SET_IGNORE_FIXED = 'SET_IGNORE_FIXED';
const SET_SECTION_VIEW = 'SET_SECTION_VIEW';
const INIT_BATCH_ITEM = 'INIT_BATCH_ITEM';
const SET_GRID_CELL_SIZE = 'SET_GRID_CELL_SIZE';
const TOGGLE_DELETE_TABLE_NUMBER = 'TOGGLE_DELETE_TABLE_NUMBER';
const TAKE_EQUIRECTANGULAR_PHOTO = 'TAKE_EQUIRECTANGULAR_PHOTO';
const SELECT_EQUIRECTANGULAR_PHOTO = 'SELECTE_EQUIRECTANGULAR_PHOTO';
const UPDATE_ITEM = 'UPDATE_ITEM';
const HIDE_CHAIR = 'HIDE_CHAIR';
const BLUE_INIT = 'BLUE_INIT';
const RESET = 'RESET';
const SCENE_SCAN_LOADED = 'SCENE_SCAN_LOADED';
const CANCEL_BATCH = 'CANCEL_BATCH';
const APPLY_BATCH = 'APPLY_BATCH';
const SET_BATCH_SETTINGS = 'SET_BATCH_SETTINGS';
const ZOOM_IN = 'ZOOM_IN';
const ZOOM_OUT = 'ZOOM_OUT';
const FIT_TO_VIEW = 'FIT_TO_VIEW';
const ROTATE_CAMERA = 'ROTATE_CAMERA';
const SET_WATERMARK = 'SET_WATERMARK';
const SET_WATERMARK_OPACITY = 'SET_WATERMARK_OPACITY';
const SET_WATERMARK_SIZE = 'SET_WATERMARK_SIZE';

export const types = {
  INIT_DESIGNER,
  SET_CAMERA_TYPE,
  SET_SHADER_VIEW,
  SET_SHADER_VIEW_SUCCESS,
  SET_SHADER_VIEW_FAILURE,
  SET_CONTROLS_TYPE,
  SET_CONTROLS_TYPE_SUCCESS,
  SET_CONTROLS_TYPE_FAILURE,
  SET_AUTO_ROTATE,
  SCREENSHOT,
  SCREENSHOT_SUCCESS,
  SCREENSHOT_FAILURE,
  DISPOSE_DESIGNER,
  SET_PHOTOSPHERE,
  AUTO_ROTATE_PHOTOSPHERE_CAMERA,
  SET_SAVE_DEBOUNCE_TIME_SECONDS,
  SAVE,
  SAVING,
  NEED_SAVE,
  SAVE_LAYOUT,
  SAVE_FIXTURE,
  SAVE_FLOORPLAN,
  LAYOUT_LOADING,
  CAMERA_LAYERS_STATE,
  LOAD_LAYOUT,
  LOAD_FIXTURE_PLAN,
  SET_MULTISELECT,
  COPIED_ASSET_STATE,
  SELECTED_ITEMS,
  SELECTED_LABEL_ID,
  SET_ACTIVE_CONTROLLER,
  SELECTED_SURFACES,
  SET_CONTROLLER_MODE,
  SET_DRAWING_MODE,
  CONFIGURE_ASSET,
  SET_TABLE_NUMBER,
  INCREMENT_NEXT_TABLE_NUMBER,
  SET_IGNORE_FIXED,
  SET_SECTION_VIEW,
  INIT_BATCH_ITEM,
  SET_GRID_CELL_SIZE,
  TOGGLE_DELETE_TABLE_NUMBER,
  TAKE_EQUIRECTANGULAR_PHOTO,
  SELECT_EQUIRECTANGULAR_PHOTO,
  UPDATE_ITEM,
  HIDE_CHAIR,
  BLUE_INIT,
  RESET,
  SCENE_SCAN_LOADED,
  SET_STATS,
  CANCEL_BATCH,
  APPLY_BATCH,
  SET_BATCH_SETTINGS,
  ZOOM_IN,
  ZOOM_OUT,
  FIT_TO_VIEW,
  ROTATE_CAMERA,
  SET_WATERMARK,
  SET_WATERMARK_OPACITY,
  SET_WATERMARK_SIZE,
};

type Types =
  | typeof INIT_DESIGNER
  | typeof SET_CAMERA_TYPE
  | typeof SET_SHADER_VIEW
  | typeof SET_SHADER_VIEW_SUCCESS
  | typeof SET_SHADER_VIEW_FAILURE
  | typeof SET_CONTROLS_TYPE
  | typeof SET_CONTROLS_TYPE_SUCCESS
  | typeof SET_CONTROLS_TYPE_FAILURE
  | typeof SET_AUTO_ROTATE
  | typeof SCREENSHOT
  | typeof SCREENSHOT_SUCCESS
  | typeof SCREENSHOT_FAILURE
  | typeof DISPOSE_DESIGNER
  | typeof SET_PHOTOSPHERE
  | typeof SAVE
  | typeof SAVING
  | typeof NEED_SAVE
  | typeof SAVE_LAYOUT
  | typeof SAVE_FIXTURE
  | typeof SAVE_FLOORPLAN
  | typeof AUTO_ROTATE_PHOTOSPHERE_CAMERA
  | typeof SET_SAVE_DEBOUNCE_TIME_SECONDS
  | typeof LAYOUT_LOADING
  | typeof CAMERA_LAYERS_STATE
  | typeof LOAD_LAYOUT
  | typeof LOAD_FIXTURE_PLAN
  | typeof SET_MULTISELECT
  | typeof COPIED_ASSET_STATE
  | typeof SELECTED_ITEMS
  | typeof SELECTED_LABEL_ID
  | typeof SET_ACTIVE_CONTROLLER
  | typeof SELECTED_SURFACES
  | typeof SELECTED_POINTS
  | typeof SET_CONTROLLER_MODE
  | typeof SET_DRAWING_MODE
  | typeof SET_STATS
  | typeof CONFIGURE_ASSET
  | typeof SET_TABLE_NUMBER
  | typeof INCREMENT_NEXT_TABLE_NUMBER
  | typeof SET_IGNORE_FIXED
  | typeof SET_SECTION_VIEW
  | typeof INIT_BATCH_ITEM
  | typeof SET_GRID_CELL_SIZE
  | typeof TOGGLE_DELETE_TABLE_NUMBER
  | typeof TAKE_EQUIRECTANGULAR_PHOTO
  | typeof UPDATE_ITEM
  | typeof HIDE_CHAIR
  | typeof SELECT_EQUIRECTANGULAR_PHOTO
  | typeof BLUE_INIT
  | typeof RESET
  | typeof SCENE_SCAN_LOADED
  | typeof CANCEL_BATCH
  | typeof APPLY_BATCH
  | typeof SET_BATCH_SETTINGS
  | typeof ZOOM_IN
  | typeof ZOOM_OUT
  | typeof ROTATE_CAMERA
  | typeof FIT_TO_VIEW
  | typeof SET_WATERMARK
  | typeof SET_WATERMARK_OPACITY
  | typeof SET_WATERMARK_SIZE;

interface BlueStats {
  chairs?: number;
  tables?: number;
  price?: number;
}

// State
export type State = {
  designerReady: boolean;
  cameraType: CameraType;
  shaderView: ShaderView;
  controlsType: ControlsType;
  autoRotate: boolean;
  blueInitialized: boolean;
  autoRotatePhotosphereCamera: boolean;
  layoutLoading: boolean;
  cameraLayers: CameraLayers[];
  multiSelect: boolean;
  copiedAssets: AssetGroup;
  selectedItems: Item[];
  selectedLabelId: string;
  activeController: ControllerType;
  selectedSurfaces: any[];
  selectedPoints: Points[];
  controllerMode: ControllerMode;
  drawingMode: DrawingMode;
  stats: BlueStats;
  chairs: number;
  tables: number;
  configuredAssets: { [assetId: string]: Asset };
  nextTableNumber: number;
  ignoreFixed: boolean;
  sectionView: boolean;
  gridCellSize: { cmSize: number; units: string };
  deleteTableNumber: boolean;
  photosphere: Photosphere;
  selectedEquirectangularPhotoLink: string;
  saving: boolean;
  needSave: boolean;
  saveDebounceTimeSeconds: number;
  sceneScanLoaded: boolean;
  batchSettings: any;
  degreeAngle: null | number;
  watermarkUrl: string;
  watermarkOpacity: number;
  watermarkSize: number;
};

const initialState: State = {
  designerReady: false,
  cameraType: CameraType.Orthographic,
  shaderView: ShaderView.None,
  controlsType: ControlsType.OrthographicControls,
  autoRotate: false,
  blueInitialized: false,
  autoRotatePhotosphereCamera: false,
  layoutLoading: false,
  cameraLayers: [],
  multiSelect: false,
  copiedAssets: undefined,
  selectedItems: [],
  selectedLabelId: undefined,
  activeController: ControllerType.None,
  selectedSurfaces: [],
  selectedPoints: [],
  controllerMode: ControllerMode.MOVE,
  drawingMode: DrawingMode.DIMENSION,
  stats: {
    chairs: 0,
    tables: 0,
    price: 0,
  },
  chairs: 0,
  tables: 0,
  configuredAssets: {},
  nextTableNumber: 1,
  ignoreFixed: true,
  sectionView: false,
  gridCellSize: { cmSize: 100, units: 'cm' },
  deleteTableNumber: false,
  photosphere: undefined,
  selectedEquirectangularPhotoLink: '',
  saving: false,
  needSave: false,
  saveDebounceTimeSeconds: 15,
  sceneScanLoaded: false,
  batchSettings: {},
  degreeAngle: 0,
  watermarkUrl: '',
  watermarkOpacity: 0.5,
  watermarkSize: 0.5,
};

// Action Creators
export const InitDesigner = (designer: any) => ({
  type: INIT_DESIGNER as typeof INIT_DESIGNER,
  designer,
});

export const SetCameraType = (cameraType: CameraType) => ({
  type: SET_CAMERA_TYPE as typeof SET_CAMERA_TYPE,
  cameraType,
});

export const SetShaderView = (shaderView: ShaderView) => ({
  type: SET_SHADER_VIEW as typeof SET_SHADER_VIEW,
  shaderView,
});

export const SetShaderViewSuccess = (shaderView: ShaderView) => ({
  type: SET_SHADER_VIEW_SUCCESS as typeof SET_SHADER_VIEW_SUCCESS,
  shaderView,
});

export const SetShaderViewFailure = (error: any) => ({
  type: SET_SHADER_VIEW_FAILURE as typeof SET_SHADER_VIEW_FAILURE,
  error,
});

export const SetControlsType = (
  controlsType: ControlsType,
  position?: THREE.Vector3,
  direction?: THREE.Vector3
) => ({
  type: SET_CONTROLS_TYPE as typeof SET_CONTROLS_TYPE,
  controlsType,
  position,
  direction,
});

export const SetControlsTypeSuccess = (controlsType: ControlsType) => ({
  type: SET_CONTROLS_TYPE_SUCCESS as typeof SET_CONTROLS_TYPE_SUCCESS,
  controlsType,
});

export const SetControlsTypeFailure = (error: any) => ({
  type: SET_CONTROLS_TYPE_FAILURE as typeof SET_CONTROLS_TYPE_FAILURE,
  error,
});

export const SetAutoRotate = (autoRotate: boolean) => ({
  type: SET_AUTO_ROTATE as typeof SET_AUTO_ROTATE,
  autoRotate,
});

export const Screenshot = (
  download: boolean,
  setSceneImage: boolean,
  setFloorplanImage: boolean
) => ({
  type: SCREENSHOT as typeof SCREENSHOT,
  download,
  setSceneImage,
  setFloorplanImage,
});

export const ScreenshotSuccess = () => ({
  type: SCREENSHOT_SUCCESS as typeof SCREENSHOT_SUCCESS,
});

export const ScreenshotFailure = (error: any) => ({
  type: SCREENSHOT_FAILURE as typeof SCREENSHOT_FAILURE,
  error,
});

export const DisposeDesigner = () => ({
  type: DISPOSE_DESIGNER as typeof DISPOSE_DESIGNER,
});

export const SetPhotosphere = (
  photosphere: Photosphere,
  editPhotosphere: boolean
) => ({
  type: SET_PHOTOSPHERE as typeof SET_PHOTOSPHERE,
  photosphere,
  editPhotosphere,
});

export const AutoRotatePhotosphereCamera = (autoRotate: boolean) => ({
  type: AUTO_ROTATE_PHOTOSPHERE_CAMERA as typeof AUTO_ROTATE_PHOTOSPHERE_CAMERA,
  autoRotate,
});

export const SetSaveDebounceTimeSeconds = (debounceTime: number) => ({
  type: SET_SAVE_DEBOUNCE_TIME_SECONDS as typeof SET_SAVE_DEBOUNCE_TIME_SECONDS,
  debounceTime,
});

export const Save = () => ({
  type: SAVE as typeof SAVE,
});

export const NeedSaveAction = (needSave: boolean) => ({
  type: NEED_SAVE as typeof NEED_SAVE,
  needSave,
});

export const SaveLayout = () => ({
  type: SAVE_LAYOUT as typeof SAVE_LAYOUT,
});

export const SaveFixture = () => ({
  type: SAVE_FIXTURE as typeof SAVE_FIXTURE,
});

export const SaveFloorPlan = () => ({
  type: SAVE_FLOORPLAN as typeof SAVE_FLOORPLAN,
});

export const LayoutLoading = (layoutLoading: boolean) => ({
  type: LAYOUT_LOADING as typeof LAYOUT_LOADING,
  layoutLoading,
});

export const ChangeCameraLayersState = (
  cameraLayersState: CameraLayers[],
  store: boolean
) => ({
  type: CAMERA_LAYERS_STATE as typeof CAMERA_LAYERS_STATE,
  cameraLayersState,
  store,
});

export const ChangeCopiedAssetsState = (copiedAssetsState: AssetGroup) => ({
  type: COPIED_ASSET_STATE as typeof COPIED_ASSET_STATE,
  copiedAssetsState,
});

export const LoadLayout = () => ({
  type: LOAD_LAYOUT as typeof LOAD_LAYOUT,
});

export const LoadFixturePlan = () => ({
  type: LOAD_FIXTURE_PLAN as typeof LOAD_FIXTURE_PLAN,
});

export const SetMultiSelect = (multiSelect: boolean) => ({
  type: SET_MULTISELECT as typeof SET_MULTISELECT,
  multiSelect,
});

export const SetSelectedItems = (selectedItems: Item[]) => ({
  type: SELECTED_ITEMS as typeof SELECTED_ITEMS,
  selectedItems,
});

export const SetSelectedLabelId = (selectedLabelId: string) => ({
  type: SELECTED_LABEL_ID as typeof SELECTED_LABEL_ID,
  selectedLabelId,
});

export const SetActiveController = (controllerType: ControllerType) => ({
  type: SET_ACTIVE_CONTROLLER as typeof SET_ACTIVE_CONTROLLER,
  controllerType,
});

export const SetSelectedSurfaces = (selectedSurfaces: Item[]) => ({
  type: SELECTED_SURFACES as typeof SELECTED_SURFACES,
  selectedSurfaces,
});

export const SetSelectedPoints = (selectedPoints: Points[]) => ({
  type: SELECTED_POINTS as typeof SELECTED_POINTS,
  selectedPoints,
});

export const SetControllerMode = (controllerMode: ControllerMode) => ({
  type: SET_CONTROLLER_MODE as typeof SET_CONTROLLER_MODE,
  controllerMode,
});

export const SetDrawingMode = (drawingMode: DrawingMode) => ({
  type: SET_DRAWING_MODE as typeof SET_DRAWING_MODE,
  drawingMode,
});

export const SetStats = (stats: BlueStats) => ({
  type: SET_STATS as typeof SET_STATS,
  stats,
});

export const ConfigureAsset = (asset: Asset) => ({
  type: CONFIGURE_ASSET as typeof CONFIGURE_ASSET,
  asset,
});

export const SetNextTableNumber = (tableNumber: number) => ({
  type: SET_TABLE_NUMBER as typeof SET_TABLE_NUMBER,
  tableNumber,
});

export const IncrementNextTableNumber = () => ({
  type: INCREMENT_NEXT_TABLE_NUMBER as typeof INCREMENT_NEXT_TABLE_NUMBER,
});

export const ToggleDeleteTableNumberModeAction = (
  deleteTableNumber: boolean
) => ({
  type: TOGGLE_DELETE_TABLE_NUMBER as typeof TOGGLE_DELETE_TABLE_NUMBER,
  deleteTableNumber,
});

export const SetIgnoreFixed = (ignoreFixed: boolean) => ({
  type: SET_IGNORE_FIXED as typeof SET_IGNORE_FIXED,
  ignoreFixed,
});

export const SetSectionView = (sectionView: boolean) => ({
  type: SET_SECTION_VIEW as typeof SET_SECTION_VIEW,
  sectionView,
});

export const InitBatchItem = (asset: Asset, cb?) => ({
  type: INIT_BATCH_ITEM as typeof INIT_BATCH_ITEM,
  asset,
  cb,
});

export const SetGridCellSize = (gridCellSize: GridCell) => ({
  type: SET_GRID_CELL_SIZE as typeof SET_GRID_CELL_SIZE,
  gridCellSize,
});

export const TakeEquirectangularPhotoAction = () => ({
  type: TAKE_EQUIRECTANGULAR_PHOTO as typeof TAKE_EQUIRECTANGULAR_PHOTO,
});

export const SelectEquirectangularPhotoAction = (url: string) => ({
  type: SELECT_EQUIRECTANGULAR_PHOTO as typeof SELECT_EQUIRECTANGULAR_PHOTO,
  url,
});

export const UpdateItemAction = (asset: Asset) => ({
  type: UPDATE_ITEM as typeof UPDATE_ITEM,
  asset,
});

export const HideChairAction = (attendee: Attendee) => ({
  type: HIDE_CHAIR as typeof HIDE_CHAIR,
  attendee,
});

export const BlueInitAction = (initialized: boolean = true) => ({
  type: BLUE_INIT as typeof BLUE_INIT,
  initialized,
});

export const SavingAction = (saving: boolean) => ({
  type: SAVING as typeof SAVING,
  saving,
});

export const Reset = () => ({
  type: RESET as typeof RESET,
});

export const sceneScanLoadedAction = () => ({
  type: SCENE_SCAN_LOADED as typeof SCENE_SCAN_LOADED,
});

export const ApplyBatch = () => ({
  type: APPLY_BATCH as typeof APPLY_BATCH,
});
export const CancelBatch = () => ({
  type: CANCEL_BATCH as typeof CANCEL_BATCH,
});
export const SetBatchSettings = (batchSettings?: any) => ({
  type: SET_BATCH_SETTINGS as typeof SET_BATCH_SETTINGS,
  batchSettings,
});

export const ZoomIn = () => ({
  type: ZOOM_IN as typeof ZOOM_IN,
});

export const ZoomOut = () => ({
  type: ZOOM_OUT as typeof ZOOM_OUT,
});

export const FitToView = () => ({
  type: FIT_TO_VIEW as typeof FIT_TO_VIEW,
});

export const RotateCamera = (degreeAngle) => ({
  type: ROTATE_CAMERA as typeof ROTATE_CAMERA,
  degreeAngle,
});

export const SetWatermark = (watermarkUrl: string) => ({
  type: SET_WATERMARK as typeof SET_WATERMARK,
  watermarkUrl,
});

export const SetWatermarkOpacity = (opacity: number) => ({
  type: SET_WATERMARK_OPACITY as typeof SET_WATERMARK_OPACITY,
  opacity,
});

export const SetWatermarkSize = (size: number) => ({
  type: SET_WATERMARK_SIZE as typeof SET_WATERMARK_SIZE,
  size,
});

export type InitDesignerAction = ReturnType<typeof InitDesigner>;
export type SetCameraTypeAction = ReturnType<typeof SetCameraType>;
export type SetShaderViewAction = ReturnType<typeof SetShaderView>;
export type SetControlsTypeAction = ReturnType<typeof SetControlsType>;
export type SetAutoRotateAction = ReturnType<typeof SetAutoRotate>;
export type SetPhotosphereAction = ReturnType<typeof SetPhotosphere>;
export type ScreenshotAction = ReturnType<typeof Screenshot>;
export type AutoRotatePhotosphereCameraAction = ReturnType<
  typeof AutoRotatePhotosphereCamera
>;
export type LayoutLoadingAction = ReturnType<typeof LayoutLoading>;
export type ChangeCameraLayersAction = ReturnType<
  typeof ChangeCameraLayersState
>;
export type LoadLayoutAction = ReturnType<typeof LoadLayout>;
export type LoadFixturePlanAction = ReturnType<typeof LoadFixturePlan>;
export type SetMultiSelectAction = ReturnType<typeof SetMultiSelect>;
export type ChangeCopiedAssetsAction = ReturnType<
  typeof ChangeCopiedAssetsState
>;
export type SetSelectedItemsAction = ReturnType<typeof SetSelectedItems>;
export type SetSelectedLabelId = ReturnType<typeof SetSelectedLabelId>;
export type SetActiveController = ReturnType<typeof SetActiveController>;
export type SetSelectedSurfaces = ReturnType<typeof SetSelectedSurfaces>;
export type SetSelectedPoints = ReturnType<typeof SetSelectedPoints>;
export type SetControllerMode = ReturnType<typeof SetControllerMode>;
export type SetDrawingMode = ReturnType<typeof SetDrawingMode>;
export type SetStatsAction = ReturnType<typeof SetStats>;
export type ConfigureAssetAction = ReturnType<typeof ConfigureAsset>;
export type SetNextTableNumberAction = ReturnType<typeof SetNextTableNumber>;
export type IncrementNextTableNumberAction = ReturnType<
  typeof IncrementNextTableNumber
>;
export type SetIgnoreFixedAction = ReturnType<typeof SetIgnoreFixed>;
export type SetSectionViewAction = ReturnType<typeof SetSectionView>;
export type InitBatchItemAction = ReturnType<typeof InitBatchItem>;
export type SetGridCellSizeAction = ReturnType<typeof SetGridCellSize>;
export type ToggleDeleteTableNumberModeAction = ReturnType<
  typeof ToggleDeleteTableNumberModeAction
>;
export type TakeEquirectangularPhotoAction = ReturnType<
  typeof TakeEquirectangularPhotoAction
>;
export type SelectEquirectangularPhotoAction = ReturnType<
  typeof SelectEquirectangularPhotoAction
>;
export type UpdateItemAction = ReturnType<typeof UpdateItemAction>;
export type HideChairAction = ReturnType<typeof HideChairAction>;
export type BlueInitAction = ReturnType<typeof BlueInitAction>;
export type SavingAction = ReturnType<typeof SavingAction>;
export type NeedSaveAction = ReturnType<typeof NeedSaveAction>;
export type SetSaveDebounceTimeSeconds = ReturnType<
  typeof SetSaveDebounceTimeSeconds
>;
export type SceneScanLoadedAction = ReturnType<typeof sceneScanLoadedAction>;
export type CancelBatchAction = ReturnType<typeof CancelBatch>;
export type ApplyBatchAction = ReturnType<typeof ApplyBatch>;
export type SetBatchSettingsAction = ReturnType<typeof SetBatchSettings>;
export type ZoomInAction = ReturnType<typeof ZoomIn>;
export type ZoomOutAction = ReturnType<typeof ZoomOut>;
export type FitToViewAction = ReturnType<typeof FitToView>;
export type RotateCameraAction = ReturnType<typeof RotateCamera>;
export type SetWatermarkAction = ReturnType<typeof SetWatermark>;
export type SetWatermarkOpacityAction = ReturnType<typeof SetWatermarkOpacity>;
export type SetWatermarkSizeAction = ReturnType<typeof SetWatermarkSize>;

export type Action =
  | SetCameraTypeAction
  | InitDesignerAction
  | SetShaderViewAction
  | SetControlsTypeAction
  | SetAutoRotateAction
  | ScreenshotAction
  | SetPhotosphereAction
  | LayoutLoadingAction
  | ChangeCameraLayersAction
  | LoadLayoutAction
  | LoadFixturePlanAction
  | SetMultiSelectAction
  | ChangeCopiedAssetsAction
  | SetSelectedItemsAction
  | SetSelectedLabelId
  | SetActiveController
  | SetSelectedSurfaces
  | SetControllerMode
  | SetStatsAction
  | ConfigureAssetAction
  | SetNextTableNumberAction
  | IncrementNextTableNumberAction
  | SetIgnoreFixedAction
  | SetSectionViewAction
  | InitBatchItemAction
  | SetGridCellSizeAction
  | TakeEquirectangularPhotoAction
  | UpdateItemAction
  | HideChairAction
  | SelectEquirectangularPhotoAction
  | BlueInitAction
  | SavingAction
  | NeedSaveAction
  | SceneScanLoadedAction
  | CancelBatchAction
  | ApplyBatchAction
  | SetBatchSettingsAction
  | ZoomInAction
  | ZoomOutAction
  | FitToViewAction
  | RotateCameraAction
  | SetWatermarkAction
  | SetWatermarkOpacityAction
  | SetWatermarkSizeAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [INIT_DESIGNER]: (state: State): State => ({
    ...state,
    designerReady: true,
  }),
  [DISPOSE_DESIGNER]: (state: State): State => ({
    ...state,
    designerReady: false,
    blueInitialized: false,
  }),
  [SET_CAMERA_TYPE]: (state: State, action: SetCameraTypeAction): State => ({
    ...state,
    cameraType: action.cameraType,
  }),
  [SET_SHADER_VIEW]: (state: State): State => state,
  [SET_SHADER_VIEW_SUCCESS]: (
    state: State,
    action: SetShaderViewAction
  ): State => ({
    ...state,
    shaderView: action.shaderView,
  }),
  [SET_SHADER_VIEW_FAILURE]: (state: State): State => state,
  [SET_CONTROLS_TYPE]: (state: State): State => state,
  [SET_CONTROLS_TYPE_SUCCESS]: (
    state: State,
    action: SetControlsTypeAction
  ): State => ({
    ...state,
    controlsType: action.controlsType,
  }),
  [SET_CONTROLS_TYPE_FAILURE]: (state: State): State => state,
  [SET_AUTO_ROTATE]: (state: State, action: SetAutoRotateAction): State => ({
    ...state,
    autoRotate: action.autoRotate,
  }),
  [SCREENSHOT]: (state: State, action: ScreenshotAction): State => state,
  [SCREENSHOT_SUCCESS]: (state: State): State => state,
  [SCREENSHOT_FAILURE]: (state: State): State => state,
  [SET_PHOTOSPHERE]: (state: State, action: SetPhotosphereAction): State => ({
    ...state,
    photosphere: action.photosphere,
  }),
  [AUTO_ROTATE_PHOTOSPHERE_CAMERA]: (
    state: State,
    action: AutoRotatePhotosphereCameraAction
  ): State => ({
    ...state,
    autoRotatePhotosphereCamera: action.autoRotate,
  }),
  [SET_SAVE_DEBOUNCE_TIME_SECONDS]: (
    state: State,
    action: SetSaveDebounceTimeSeconds
  ): State => ({
    ...state,
    saveDebounceTimeSeconds: action.debounceTime,
  }),
  [SAVE]: (state: State): State => ({
    ...state,
  }),
  [SAVING]: (state: State, action: SavingAction): State => ({
    ...state,
    saving: action.saving,
  }),
  [NEED_SAVE]: (state: State, action: NeedSaveAction): State => ({
    ...state,
    needSave: action.needSave,
  }),
  [SAVE_LAYOUT]: (state: State): State => ({
    ...state,
  }),
  [SAVE_FIXTURE]: (state: State): State => ({
    ...state,
  }),
  [SAVE_FLOORPLAN]: (state: State): State => ({
    ...state,
  }),
  [LAYOUT_LOADING]: (state: State, action: LayoutLoadingAction): State => ({
    ...state,
    layoutLoading: action.layoutLoading,
  }),
  [CAMERA_LAYERS_STATE]: (
    state: State,
    action: ChangeCameraLayersAction
  ): State => ({
    ...state,
    cameraLayers: action.cameraLayersState,
  }),
  [LOAD_LAYOUT]: (state: State): State => ({
    ...state,
  }),
  [LOAD_FIXTURE_PLAN]: (state: State): State => ({
    ...state,
  }),
  [SET_MULTISELECT]: (state: State, action: SetMultiSelectAction): State => ({
    ...state,
    multiSelect: action.multiSelect,
  }),
  [COPIED_ASSET_STATE]: (
    state: State,
    action: ChangeCopiedAssetsAction
  ): State => ({
    ...state,
    copiedAssets: action.copiedAssetsState,
  }),
  [SELECTED_ITEMS]: (state: State, action: SetSelectedItemsAction): State => ({
    ...state,
    selectedItems: action.selectedItems,
  }),
  [SELECTED_LABEL_ID]: (state: State, action: SetSelectedLabelId): State => ({
    ...state,
    selectedLabelId: action.selectedLabelId,
  }),
  [SET_ACTIVE_CONTROLLER]: (
    state: State,
    action: SetActiveController
  ): State => ({
    ...state,
    activeController: action.controllerType,
  }),
  [SELECTED_SURFACES]: (state: State, action: SetSelectedSurfaces): State => ({
    ...state,
    selectedSurfaces: action.selectedSurfaces,
  }),
  [SELECTED_POINTS]: (state: State, action: SetSelectedPoints): State => ({
    ...state,
    selectedPoints: action.selectedPoints,
  }),
  [SET_CONTROLLER_MODE]: (state: State, action: SetControllerMode): State => ({
    ...state,
    controllerMode: action.controllerMode,
  }),
  [SET_DRAWING_MODE]: (state: State, action: SetDrawingMode): State => ({
    ...state,
    drawingMode: action.drawingMode,
  }),
  [SET_STATS]: (state: State, action: SetStatsAction): State => ({
    ...state,
    stats: {
      ...state.stats,
      ...action.stats,
    },
  }),
  [CONFIGURE_ASSET]: (state: State, action: ConfigureAssetAction): State => ({
    ...state,
    configuredAssets: {
      ...state.configuredAssets,
      [action.asset.id]: action.asset,
    },
  }),
  [SET_TABLE_NUMBER]: (
    state: State,
    action: SetNextTableNumberAction
  ): State => ({
    ...state,
    nextTableNumber: action.tableNumber,
  }),
  [INCREMENT_NEXT_TABLE_NUMBER]: (
    state: State,
    action: IncrementNextTableNumberAction
  ): State => ({
    ...state,
    nextTableNumber: state.nextTableNumber + 1,
  }),
  [SET_IGNORE_FIXED]: (state: State, action: SetIgnoreFixedAction): State => ({
    ...state,
    ignoreFixed: action.ignoreFixed,
  }),
  [SET_SECTION_VIEW]: (state: State, action: SetSectionViewAction): State => ({
    ...state,
    sectionView: action.sectionView,
  }),
  [INIT_BATCH_ITEM]: (state: State): State => state,
  [SET_GRID_CELL_SIZE]: (
    state: State,
    action: SetGridCellSizeAction
  ): State => ({
    ...state,
    gridCellSize: action.gridCellSize,
  }),
  [TOGGLE_DELETE_TABLE_NUMBER]: (
    state: State,
    action: ToggleDeleteTableNumberModeAction
  ): State => ({
    ...state,
    deleteTableNumber: action.deleteTableNumber,
  }),
  [TAKE_EQUIRECTANGULAR_PHOTO]: (
    state: State,
    action: TakeEquirectangularPhotoAction
  ): State => state,
  [SELECT_EQUIRECTANGULAR_PHOTO]: (
    state: State,
    action: SelectEquirectangularPhotoAction
  ): State => ({
    ...state,
    selectedEquirectangularPhotoLink: action.url,
  }),
  [UPDATE_ITEM]: (state: State, action: UpdateItemAction): State => state,
  [HIDE_CHAIR]: (state: State, action: HideChairAction): State => state,
  [BLUE_INIT]: (state: State, action: BlueInitAction): State => ({
    ...state,
    blueInitialized: action.initialized,
  }),
  [RESET]: (state: State): State => state,
  [SCENE_SCAN_LOADED]: (state: State): State => ({
    ...state,
    sceneScanLoaded: true,
  }),
  [CANCEL_BATCH]: (state: State, action: CancelBatchAction): State => ({
    ...state,
  }),
  [APPLY_BATCH]: (state: State, action: ApplyBatchAction): State => ({
    ...state,
  }),
  [SET_BATCH_SETTINGS]: (
    state: State,
    action: SetBatchSettingsAction
  ): State => {
    if (action.batchSettings) {
      return {
        ...state,
        batchSettings: action.batchSettings,
      };
    }
    return {
      ...state,
    };
  },
  [ZOOM_IN]: (state: State, action: ZoomInAction): State => ({
    ...state,
  }),
  [ZOOM_OUT]: (state: State, action: ZoomOutAction): State => ({
    ...state,
  }),
  [FIT_TO_VIEW]: (state: State, action: FitToViewAction): State => ({
    ...state,
  }),
  [ROTATE_CAMERA]: (state: State, action: RotateCameraAction): State => ({
    ...state,
    degreeAngle: action.degreeAngle,
  }),
  [SET_WATERMARK]: (state: State, action: SetWatermarkAction): State => ({
    ...state,
    watermarkUrl: action.watermarkUrl,
  }),
  [SET_WATERMARK_OPACITY]: (
    state: State,
    action: SetWatermarkOpacityAction
  ): State => ({
    ...state,
    watermarkOpacity: action.opacity,
  }),
  [SET_WATERMARK_SIZE]: (
    state: State,
    action: SetWatermarkSizeAction
  ): State => ({
    ...state,
    watermarkSize: action.size,
  }),
});

export const getSelectedItems = (state: { blue: State }) => {
  return state.blue.selectedItems;
};

export const getBlueInitialized = (state: { blue: State }) => {
  return state.blue.blueInitialized;
};

export const getDesignerReady = (state: { blue: State }) => {
  return state.blue.designerReady;
};

export const getLayoutLoading = (state: { blue: State }) => {
  return state.blue.layoutLoading;
};

export const getSceneScanLoaded = (state: { blue: State }) => {
  return state.blue.sceneScanLoaded;
};

export const getSaveDebounceTimeSeconds = (state: { blue: State }) => {
  return state.blue.saveDebounceTimeSeconds;
};

export const needSave = (state: { blue: State }) => {
  return state.blue.needSave;
};

export const isSaving = (state: { blue: State }) => {
  return state.blue.saving;
};

export const getActiveController = (state: { blue: State }) => {
  return state.blue.activeController;
};
