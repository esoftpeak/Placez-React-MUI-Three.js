import {
  all,
  put,
  take,
  takeLatest,
  call,
  race,
  select,
} from 'redux-saga/effects';
import { placezApi, PlacezLayoutPlan, PlacezFixturePlan } from '../api';
import {
  types,
  GetDesignerLayoutFailure,
  GetDesignerLayoutSuccess,
  GetDesignerFloorPlanFailure,
  GetDesignerFloorPlanSuccess,
  GetDesignerLayoutAction,
  GetDesignerFloorPlanAction,
  CreateDesignerLayoutAction,
  ExportDesignAction,
  UploadExportedDesignAction,
  UploadExportedDesign,
  UploadExportedDesignSuccess,
  UploadExportedDesignFailure,
  getExportedDesignFile,
  InitializeLayoutDesignAction,
  GetDesignerLayout,
  ResetLayoutAction,
  InitializeFloorPlanDesignAction,
  GetDesignerFloorPlan,
} from '../reducers/designer';

import { getLayoutById, UpdateLayout } from '../reducers/layouts';

import {
  LoadLayout,
  LoadFixturePlan,
} from '../reducers/blue';

import {
  getFloorPlans,
  UpdateFloorPlan,
} from '../reducers/floorPlans';

import { ReduxState } from '../reducers/index';

import { SagaReady } from '../reducers/lifecycle';
import { GetScene, getSceneById, GetSceneSuccess } from '../reducers/scenes';
import { DefaultSceneLayout } from '../components/Blue/models'

export default function* designerSaga() {
  yield all([
    takeLatest(types.GET_DESIGNER_LAYOUT, getDesignerLayout),
    takeLatest(types.GET_DESIGNER_FLOOR_PLAN, getDesignerFloorPlan),
    takeLatest(types.CREATE_DESIGNER_LAYOUT, createDesignerLayout),
    takeLatest(types.EXPORT_DESIGN, exportDesign),
    takeLatest(types.UPLOAD_EXPORTED_DESIGN, uploadExportedDesign),
    takeLatest(types.INITIALIZE_LAYOUT_DESIGN, initializeLayoutDesigner),
    takeLatest(types.INITIALIZE_FLOOR_PLAN_DESIGN, initializeFloorPlanDesign),
    takeLatest(types.RESET_LAYOUT, resetLayout),
    takeLatest(types.RESET_FIXTURE_PLAN, resetFixturePlan),
  ]);
  yield put(SagaReady('designer'));
}

function* initializeLayoutDesigner(action: InitializeLayoutDesignAction) {
  yield put(GetDesignerLayout(action.layoutId));
}

function* initializeFloorPlanDesign(action: InitializeFloorPlanDesignAction) {
  yield put(GetDesignerFloorPlan(action.floorplanId));
}

function* createDesignerLayout(action: CreateDesignerLayoutAction) {
  const layout = new DefaultSceneLayout(
    action.scene.id,
    action.scene.name,
    action.floorPlan.id
  );
  yield put(GetDesignerLayoutSuccess(layout));
}

function* getDesignerLayout(action: GetDesignerLayoutAction) {
  try {
    let layout = yield select(getLayoutById, action.layoutId)
    if (!layout) {
      const response = yield call(placezApi.getLayout, action.layoutId);
      layout = response.parsedBody as PlacezLayoutPlan;
    }

    const scene = yield select(getSceneById, layout.sceneId);
    if (!scene) {
      yield put(GetScene(layout.sceneId));
      yield take(GetSceneSuccess);
    }

    yield put(GetDesignerFloorPlan(layout.floorPlanId));
    yield take(GetDesignerFloorPlanSuccess);
    yield put(GetDesignerLayoutSuccess(layout));

    if (action.countLayoutView) {
      yield call(placezApi.viewLayout, action.layoutId);
    }
  } catch (error) {
    yield put(GetDesignerLayoutFailure(error));
  }
}

function* getDesignerFloorPlan(action: GetDesignerFloorPlanAction) {
  try {
    const floorplans = yield select(getFloorPlans);
    let floorplan = floorplans?.[action.floorPlanId];
    if (!floorplan) {
      const response = yield call(placezApi.getFloorPlan, action.floorPlanId);
      floorplan = response.parsedBody as PlacezFixturePlan;
    }
    yield put(GetDesignerFloorPlanSuccess(floorplan));
  } catch (error) {
    yield put(GetDesignerFloorPlanFailure(error));
  }
}

function* exportDesign(action: ExportDesignAction) {
  yield take(types.EXPORT_DESIGN_COMPLETE);
  const exportFile = yield select(getExportedDesignFile);
  yield put(UploadExportedDesign(exportFile));
  yield race([
    take(types.UPLOAD_EXPORTED_DESIGN_SUCCESS),
    take(types.UPLOAD_EXPORTED_DESIGN_FAILURE),
  ]);
}

function* uploadExportedDesign(action: UploadExportedDesignAction) {
  try {
    const formData = new FormData();
    formData.append('file', action.exportFile, action.exportFile.name);
    const response = yield call(placezApi.postBlob, formData);
    const exportPath = response.parsedBody.path as string;
    yield put(UploadExportedDesignSuccess(exportPath));

    const currentLayout: PlacezLayoutPlan = yield select(
      (state: ReduxState) => state.designer.layout
    );
    const layoutWithNewArLink: PlacezLayoutPlan = {
      ...currentLayout,
      arPath: exportPath,
    };
    yield put(UpdateLayout(layoutWithNewArLink));
  } catch (error) {
    yield put(UploadExportedDesignFailure(error));
  }
}

function* resetLayout(action: ResetLayoutAction) {
  const layoutBak = yield select((state: ReduxState) => state.designer.layoutBak);
  const formattedLayoutBak = {
    ...layoutBak,
    startUtcDateTime: new Date(layoutBak.startUtcDateTime),
    endUtcDateTime: new Date(layoutBak.endUtcDateTime),
  }
  yield put(LoadLayout())
  yield put(UpdateLayout(formattedLayoutBak));
}

function* resetFixturePlan() {
  const floorPlanBak = yield select((state: ReduxState) => state.designer.floorPlanBak);
  yield put(LoadFixturePlan());
  yield put(UpdateFloorPlan(floorPlanBak));
}
