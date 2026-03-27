import createReducer from './helpers/createReducer';
import { PlacezLayoutPlan, PlacezFixturePlan, Scene } from '../api';
import { ExportStatus } from '../components/Blue/models';

// Action Types
const INITIALIZE_LAYOUT_DESIGN = 'INITIALIZE_LAYOUT_DESIGN';
const INITIALIZE_FLOOR_PLAN_DESIGN = 'INITIALIZE_FLOOR_PLAN_DESIGN';
const DESIGNER_READY = 'DESIGNER_READY';

const GET_DESIGNER_LAYOUT = 'GET_DESIGNER_LAYOUT';
const GET_DESIGNER_LAYOUT_SUCCESS = 'GET_DESIGNER_LAYOUT_SUCCESS';
const GET_DESIGNER_LAYOUT_FAILURE = 'GET_DESIGNER_LAYOUT_FAILURE';
const SET_LAYOUT = 'SET_LAYOUT';
const RESET_LAYOUT = 'RESET_LAYOUT';

const GET_DESIGNER_FLOOR_PLAN = 'GET_DESIGNER_FLOOR_PLAN';
const GET_DESIGNER_FLOOR_PLAN_SUCCESS = 'GET_DESIGNER_FLOOR_PLAN_SUCCESS';
const GET_DESIGNER_FLOOR_PLAN_FAILURE = 'GET_DESIGNER_FLOOR_PLAN_FAILURE';
const SET_FLOORPLAN = 'SET_FLOORPLAN';

const CREATE_DESIGNER_LAYOUT = 'CREATE_DESIGNER_LAYOUT';

const EXPORT_DESIGN = 'EXPORT_DESIGN';
const EXPORT_DESIGN_COMPLETE = 'EXPORT_DESIGN_COMPLETE';
const UPLOAD_EXPORTED_DESIGN = 'UPLOAD_EXPORTED_DESIGN';
const UPLOAD_EXPORTED_DESIGN_SUCCESS = 'UPLOAD_EXPORTED_DESIGN_SUCCESS';
const UPLOAD_EXPORTED_DESIGN_FAILURE = 'UPLOAD_EXPORTED_DESIGN_FAILURE';
const REQUIRE_NEW_DESIGN_EXPORT = 'REQUIRE_NEW_DESIGN_EXPORT';
const RESET_FIXTURE_PLAN = 'RESET_FIXTURE_PLAN';
const REFRESH_FIXTURE_PLAN = 'REFRESH_FIXTYRE_PLAN';

export const types = {
  INITIALIZE_LAYOUT_DESIGN,
  INITIALIZE_FLOOR_PLAN_DESIGN,
  DESIGNER_READY,
  GET_DESIGNER_LAYOUT,
  GET_DESIGNER_LAYOUT_SUCCESS,
  GET_DESIGNER_LAYOUT_FAILURE,
  GET_DESIGNER_FLOOR_PLAN,
  GET_DESIGNER_FLOOR_PLAN_SUCCESS,
  GET_DESIGNER_FLOOR_PLAN_FAILURE,
  CREATE_DESIGNER_LAYOUT,
  EXPORT_DESIGN,
  EXPORT_DESIGN_COMPLETE,
  UPLOAD_EXPORTED_DESIGN,
  UPLOAD_EXPORTED_DESIGN_SUCCESS,
  UPLOAD_EXPORTED_DESIGN_FAILURE,
  REQUIRE_NEW_DESIGN_EXPORT,
  SET_FLOORPLAN,
  SET_LAYOUT,
  RESET_LAYOUT,
  RESET_FIXTURE_PLAN,
  REFRESH_FIXTURE_PLAN,
};

type Types =
  | typeof INITIALIZE_LAYOUT_DESIGN
  | typeof INITIALIZE_FLOOR_PLAN_DESIGN
  | typeof DESIGNER_READY
  | typeof GET_DESIGNER_LAYOUT
  | typeof GET_DESIGNER_LAYOUT_SUCCESS
  | typeof GET_DESIGNER_LAYOUT_FAILURE
  | typeof GET_DESIGNER_FLOOR_PLAN
  | typeof GET_DESIGNER_FLOOR_PLAN_SUCCESS
  | typeof GET_DESIGNER_FLOOR_PLAN_FAILURE
  | typeof CREATE_DESIGNER_LAYOUT
  | typeof CREATE_DESIGNER_LAYOUT
  | typeof EXPORT_DESIGN
  | typeof EXPORT_DESIGN_COMPLETE
  | typeof UPLOAD_EXPORTED_DESIGN
  | typeof UPLOAD_EXPORTED_DESIGN_SUCCESS
  | typeof UPLOAD_EXPORTED_DESIGN_FAILURE
  | typeof REQUIRE_NEW_DESIGN_EXPORT
  | typeof SET_FLOORPLAN
  | typeof SET_LAYOUT
  | typeof RESET_LAYOUT
  | typeof REFRESH_FIXTURE_PLAN
  | typeof RESET_FIXTURE_PLAN;

// State
export type State = {
  exportFile: any;
  exportPath: string;
  exportStatus: ExportStatus;
  ready: boolean;
  layout: PlacezLayoutPlan;
  layoutLoading: boolean;
  layoutBak: PlacezLayoutPlan;
  floorPlan: PlacezFixturePlan;
  floorPlanLoading: boolean;
  floorPlanBak: PlacezFixturePlan;
};

const initialState: State = {
  exportFile: null,
  exportPath: '',
  exportStatus: ExportStatus.ExportRequired,
  ready: false,
  layout: null,
  layoutLoading: false,
  floorPlan: null,
  floorPlanLoading: false,
  layoutBak: null,
  floorPlanBak: null,
};

// Action Creators
export const InitializeLayoutDesign = (
  layoutId: string,
  countLayoutView?: boolean
) => ({
  type: INITIALIZE_LAYOUT_DESIGN as typeof INITIALIZE_LAYOUT_DESIGN,
  layoutId,
  countLayoutView,
});

export const InitializeFloorPlanDesign = (floorplanId: string) => ({
  type: INITIALIZE_FLOOR_PLAN_DESIGN as typeof INITIALIZE_FLOOR_PLAN_DESIGN,
  floorplanId,
});

export const DesignerReady = () => ({
  type: DESIGNER_READY as typeof DESIGNER_READY,
  ready: true,
});

export const GetDesignerLayout = (
  layoutId: string,
  countLayoutView?: boolean
) => ({
  type: GET_DESIGNER_LAYOUT as typeof GET_DESIGNER_LAYOUT,
  layoutId,
  countLayoutView,
});

export const GetDesignerLayoutSuccess = (layout: PlacezLayoutPlan) => ({
  type: GET_DESIGNER_LAYOUT_SUCCESS as typeof GET_DESIGNER_LAYOUT_SUCCESS,
  layout,
});

export const GetDesignerLayoutFailure = (error: any) => ({
  type: GET_DESIGNER_LAYOUT_FAILURE as typeof GET_DESIGNER_LAYOUT_FAILURE,
  error,
});

export const SetLayout = (layout: Partial<PlacezLayoutPlan>) => ({
  type: SET_LAYOUT as typeof SET_LAYOUT,
  layout,
});

export const GetDesignerFloorPlan = (floorPlanId: string) => ({
  type: GET_DESIGNER_FLOOR_PLAN as typeof GET_DESIGNER_FLOOR_PLAN,
  floorPlanId,
});

export const GetDesignerFloorPlanSuccess = (floorPlan: PlacezFixturePlan) => ({
  type: GET_DESIGNER_FLOOR_PLAN_SUCCESS as typeof GET_DESIGNER_FLOOR_PLAN_SUCCESS,
  floorPlan,
});

export const GetDesignerFloorPlanFailure = (error: any) => ({
  type: GET_DESIGNER_FLOOR_PLAN_FAILURE as typeof GET_DESIGNER_FLOOR_PLAN_FAILURE,
  error,
});

export const SetFloorPlan = (floorPlan: Partial<PlacezFixturePlan>) => ({
  type: SET_FLOORPLAN as typeof SET_FLOORPLAN,
  floorPlan,
});

export const CreateDesignerLayout = (
  scene: Scene,
  floorPlan: PlacezFixturePlan
) => ({
  type: CREATE_DESIGNER_LAYOUT as typeof CREATE_DESIGNER_LAYOUT,
  scene,
  floorPlan,
});

export const ExportDesign = () => ({
  type: EXPORT_DESIGN as typeof EXPORT_DESIGN,
});

export const ExportDesignComplete = (exportFile: any) => ({
  type: EXPORT_DESIGN_COMPLETE as typeof EXPORT_DESIGN_COMPLETE,
  exportFile,
});

export const UploadExportedDesign = (exportFile: any) => ({
  type: UPLOAD_EXPORTED_DESIGN as typeof UPLOAD_EXPORTED_DESIGN,
  exportFile,
});

export const UploadExportedDesignSuccess = (exportPath: string) => ({
  type: UPLOAD_EXPORTED_DESIGN_SUCCESS as typeof UPLOAD_EXPORTED_DESIGN_SUCCESS,
  exportPath,
});

export const UploadExportedDesignFailure = (error: any) => ({
  type: UPLOAD_EXPORTED_DESIGN_FAILURE as typeof UPLOAD_EXPORTED_DESIGN_FAILURE,
  error,
});

export const RequireNewDesignExport = () => ({
  type: REQUIRE_NEW_DESIGN_EXPORT as typeof REQUIRE_NEW_DESIGN_EXPORT,
});

export const ResetLayout = (layout?: PlacezLayoutPlan) => ({
  type: RESET_LAYOUT as typeof RESET_LAYOUT,
  layout,
});

export const ResetFixturePlan = (fixturePlan?: PlacezFixturePlan) => ({
  type: RESET_FIXTURE_PLAN as typeof RESET_FIXTURE_PLAN,
  fixturePlan,
});

export const RefreshFixturePlan = () => ({
  type: REFRESH_FIXTURE_PLAN as typeof REFRESH_FIXTURE_PLAN,
});

export type InitializeLayoutDesignAction = ReturnType<
  typeof InitializeLayoutDesign
>;
export type InitializeFloorPlanDesignAction = ReturnType<
  typeof InitializeFloorPlanDesign
>;
export type DesignerReadyAction = ReturnType<typeof DesignerReady>;
export type GetDesignerLayoutAction = ReturnType<typeof GetDesignerLayout>;
export type GetDesignerLayoutSuccessAction = ReturnType<
  typeof GetDesignerLayoutSuccess
>;
export type GetDesignerLayoutFailureAction = ReturnType<
  typeof GetDesignerLayoutFailure
>;
export type GetDesignerFloorPlanAction = ReturnType<
  typeof GetDesignerFloorPlan
>;
export type GetDesignerFloorPlanSuccessAction = ReturnType<
  typeof GetDesignerFloorPlanSuccess
>;
export type GetDesignerFloorPlanFailureAction = ReturnType<
  typeof GetDesignerFloorPlanFailure
>;
export type CreateDesignerLayoutAction = ReturnType<
  typeof CreateDesignerLayout
>;
export type ExportDesignAction = ReturnType<typeof ExportDesign>;
export type ExportDesignCompleteAction = ReturnType<
  typeof ExportDesignComplete
>;
export type UploadExportedDesignAction = ReturnType<
  typeof UploadExportedDesign
>;
export type UploadExportedDesignSuccessAction = ReturnType<
  typeof UploadExportedDesignSuccess
>;
export type UploadExportedDesignFailureAction = ReturnType<
  typeof UploadExportedDesignFailure
>;
export type RequireNewDesignExportAction = ReturnType<
  typeof RequireNewDesignExport
>;
export type SetFloorPlanAction = ReturnType<typeof SetFloorPlan>;
export type SetLayoutAction = ReturnType<typeof SetLayout>;
export type ResetLayoutAction = ReturnType<typeof ResetLayout>;
export type ResetFixturePlanAction = ReturnType<typeof ResetFixturePlan>;
export type RefreshFixturePlanAction = ReturnType<typeof RefreshFixturePlan>;

export type Action =
  | InitializeLayoutDesignAction
  | InitializeFloorPlanDesignAction
  | DesignerReadyAction
  | GetDesignerLayoutAction
  | GetDesignerLayoutSuccessAction
  | GetDesignerLayoutFailureAction
  | GetDesignerFloorPlanAction
  | GetDesignerFloorPlanSuccessAction
  | GetDesignerFloorPlanFailureAction
  | CreateDesignerLayoutAction
  | CreateDesignerLayoutAction
  | ExportDesignAction
  | ExportDesignCompleteAction
  | UploadExportedDesignAction
  | UploadExportedDesignSuccessAction
  | UploadExportedDesignFailureAction
  | RequireNewDesignExportAction
  | SetLayoutAction
  | SetFloorPlanAction
  | ResetLayoutAction
  | ResetFixturePlanAction
  | RefreshFixturePlanAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [INITIALIZE_LAYOUT_DESIGN]: (
    state: State,
    action: InitializeLayoutDesignAction
  ): State => ({
    ...initialState,
    floorPlanLoading: true,
  }),
  [INITIALIZE_FLOOR_PLAN_DESIGN]: (
    state: State,
    action: InitializeFloorPlanDesignAction
  ): State => ({
    ...initialState,
    floorPlanLoading: true,
  }),
  [DESIGNER_READY]: (state: State, action: DesignerReadyAction): State => ({
    ...state,
    ready: action.ready,
  }),
  [GET_DESIGNER_LAYOUT]: (
    state: State,
    action: GetDesignerLayoutAction
  ): State => ({
    ...state,
    layoutLoading: true,
  }),
  [GET_DESIGNER_LAYOUT_SUCCESS]: (
    state: State,
    action: GetDesignerLayoutSuccessAction
  ): State => ({
    ...state,
    layout: action.layout,
    layoutBak: JSON.parse(JSON.stringify(action.layout)),
    layoutLoading: false,
    exportPath: action.layout ? action.layout.arPath : initialState.exportPath,
    exportStatus:
      !!action.layout && !!action.layout.arPath
        ? ExportStatus.Uploaded
        : state.exportStatus,
  }),
  [GET_DESIGNER_LAYOUT_FAILURE]: (
    state: State,
    action: GetDesignerLayoutFailureAction
  ): State => ({
    ...state,
    layoutLoading: false,
  }),
  [SET_LAYOUT]: (state: State, action: SetLayoutAction): State => ({
    ...state,
    layout: {
      ...state.layout,
      ...action.layout,
    },
    layoutLoading: false,
    exportPath: action.layout ? action.layout.arPath : initialState.exportPath,
    exportStatus:
      !!action.layout && !!action.layout.arPath
        ? ExportStatus.Uploaded
        : state.exportStatus,
  }),
  [GET_DESIGNER_FLOOR_PLAN]: (
    state: State,
    action: GetDesignerFloorPlanAction
  ): State => ({
    ...state,
    floorPlanLoading: true,
  }),
  [GET_DESIGNER_FLOOR_PLAN_SUCCESS]: (
    state: State,
    action: GetDesignerFloorPlanSuccessAction
  ): State => ({
    ...state,
    floorPlan: action.floorPlan,
    floorPlanBak: JSON.parse(JSON.stringify(action.floorPlan)),
    floorPlanLoading: false,
  }),
  [GET_DESIGNER_FLOOR_PLAN_FAILURE]: (
    state: State,
    action: GetDesignerFloorPlanFailureAction
  ): State => ({
    ...state,
    floorPlanLoading: false,
  }),
  [SET_FLOORPLAN]: (state: State, action: SetFloorPlanAction): State => ({
    ...state,
    floorPlan: {
      ...state.floorPlan,
      ...action.floorPlan,
    },
    floorPlanLoading: false,
  }),
  [CREATE_DESIGNER_LAYOUT]: (
    state: State,
    action: CreateDesignerLayoutAction
  ): State => state,
  [EXPORT_DESIGN]: (state: State, action: ExportDesignAction): State => ({
    ...state,
    exportFile: initialState.exportFile,
    exportPath: initialState.exportPath,
    exportStatus: ExportStatus.Exporting,
  }),
  [EXPORT_DESIGN_COMPLETE]: (
    state: State,
    action: ExportDesignCompleteAction
  ): State => ({
    ...state,
    exportFile: action.exportFile,
    exportStatus: ExportStatus.Exported,
  }),
  [UPLOAD_EXPORTED_DESIGN]: (
    state: State,
    action: UploadExportedDesignAction
  ): State => ({
    ...state,
    exportPath: initialState.exportPath,
    exportStatus: ExportStatus.Uploading,
  }),
  [UPLOAD_EXPORTED_DESIGN_SUCCESS]: (
    state: State,
    action: UploadExportedDesignSuccessAction
  ): State => ({
    ...state,
    exportPath: action.exportPath,
    exportStatus: ExportStatus.Uploaded,
  }),
  [UPLOAD_EXPORTED_DESIGN_FAILURE]: (
    state: State,
    action: UploadExportedDesignFailureAction
  ): State => ({
    ...state,
    exportStatus: ExportStatus.Exported,
  }),
  [REQUIRE_NEW_DESIGN_EXPORT]: (
    state: State,
    action: RequireNewDesignExportAction
  ): State => ({
    ...state,
    exportFile: initialState.exportFile,
    exportPath: initialState.exportPath,
    exportStatus: ExportStatus.ExportRequired,
  }),
  [RESET_LAYOUT]: (state: State, action: ResetLayoutAction): State => ({
    ...state,
    layout: JSON.parse(JSON.stringify(state.layoutBak)),
  }),
  [RESET_FIXTURE_PLAN]: (
    state: State,
    action: ResetFixturePlanAction
  ): State => ({
    ...state,
    floorPlan: JSON.parse(JSON.stringify(state.floorPlanBak)),
  }),
  [REFRESH_FIXTURE_PLAN]: (
    state: State,
    action: RefreshFixturePlanAction
  ): State => ({
    ...state,
  }),
});

// selector
export const getExportedDesignFile = (state: { designer: State }) => {
  return state.designer.exportFile;
};

export const getLayout = (state: { designer: State }) => {
  return state.designer.layout;
};

export const getFloorPlan = (state: { designer: State }) => {
  return state.designer.floorPlan;
};
