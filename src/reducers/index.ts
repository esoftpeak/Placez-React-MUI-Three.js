import { combineReducers, Reducer } from 'redux';
import { UserState, reducer as oidc } from 'redux-oidc';
import scenes, { State as ScenesState } from './scenes';
import lifecycle, { State as LifecycleState } from './lifecycle';
import place, { State as PlaceState } from './place';
import client, { State as ClientState } from './client';
import dashboard, { State as DashboardState } from './dashboard';
import globalstate, { State as GlobalStateState } from './globalState';
import settings, { State as SettingsState } from './settings';
import designer, { State as DesignerState } from './designer';
import layouts, { State as LayoutsState } from './layouts';
import floorPlans, { State as FloorPlansState } from './floorPlans';
import asset, { State as AssetState } from './asset';
import chat, { State as ChatState } from './chat';
import blue, { State as BlueState } from './blue';
import attendee, { State as AttendeeState } from './attendee';
import material, { State as MaterialState } from './material';
import undoRedo, { State as UndoRedoState } from './undoRedo';
import label, { State as LabelState } from './label';
import payment, { State as PaymentState } from './payment';
import floorPlan, { State as FloorPlanState } from './floorPlan';
import ui, { State as UIState } from './ui'

const reducer: Reducer = combineReducers({
  oidc,
  client,
  scenes,
  lifecycle,
  place,
  settings,
  dashboard,
  designer,
  layouts,
  floorPlans,
  asset,
  attendee,
  chat,
  globalstate,
  blue,
  material,
  undoRedo,
  label,
  payment,
  floorPlan,
  ui,
});

export type ReduxState = {
  oidc: UserState;
  client: ClientState;
  scenes: ScenesState;
  lifecycle: LifecycleState;
  place: PlaceState;
  settings: SettingsState;
  dashboard: DashboardState;
  designer: DesignerState;
  layouts: LayoutsState;
  floorPlans: FloorPlansState;
  asset: AssetState;
  attendee: AttendeeState;
  material: MaterialState;
  chat: ChatState;
  globalstate: GlobalStateState;
  blue: BlueState;
  undoRedo: UndoRedoState;
  label: LabelState;
  payment: PaymentState;
  floorPlan: FloorPlanState;
  ui: UIState;
};

export default reducer;
