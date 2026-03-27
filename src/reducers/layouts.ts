import createReducer from './helpers/createReducer';
import PlacezLayoutPlan from '../api/placez/models/PlacezLayoutPlan';
import { InvoiceLineItem } from '../components/Invoicing/InvoiceLineItemModel';

// Action Types
const GET_SCENE_LAYOUTS = 'GET_SCENE_LAYOUTS';
const GET_SCENE_LAYOUTS_SUCCESS = 'GET_SCENE_LAYOUTS_SUCCESS';
const GET_SCENE_LAYOUTS_FAILURE = 'GET_SCENE_LAYOUTS_FAILURE';

const UPDATE_LAYOUT = 'UPDATE_LAYOUT';
const UPDATE_LAYOUT_SUCCESS = 'UPDATE_LAYOUT_SUCCESS';
const UPDATE_LAYOUT_FAILURE = 'UPDATE_LAYOUT_FAILURE';

const UPDATE_LAYOUTS = 'UPDATE_LAYOUTS';
const UPDATE_LAYOUTS_SUCCESS = 'UPDATE_LAYOUTS_SUCCESS';

const CREATE_LAYOUT = 'CREATE_LAYOUT';
const CREATE_LAYOUT_SUCCESS = 'CREATE_LAYOUT_SUCCESS';
const CREATE_LAYOUT_FAILURE = 'CREATE_LAYOUT_FAILURE';

const DELETE_LAYOUT = 'DELETE_LAYOUT';
const DELETE_LAYOUT_SUCCESS = 'DELETE_LAYOUT_SUCCESS';
const DELETE_LAYOUT_FAILURE = 'DELETE_LAYOUT_FAILURE';

const GET_TEMPLATES = 'GET_TEMPLATES';
const GET_TEMPLATES_SUCCESS = 'GET_TEMPLATES_SUCCESS';
const GET_TEMPLATES_FAILURE = 'GET_TEMPLATES_FAILURE';

const UPDATE_INVOICE = 'UPDATE_INVOICE';

const TOGGLE_INCLUDE_IN_INVOICE = 'TOGGLE_INCLUDE_IN_INVOICE';

export const types = {
  GET_SCENE_LAYOUTS,
  GET_SCENE_LAYOUTS_SUCCESS,
  GET_SCENE_LAYOUTS_FAILURE,
  UPDATE_LAYOUT,
  UPDATE_LAYOUT_SUCCESS,
  UPDATE_LAYOUT_FAILURE,
  UPDATE_LAYOUTS,
  UPDATE_LAYOUTS_SUCCESS,
  CREATE_LAYOUT,
  CREATE_LAYOUT_SUCCESS,
  CREATE_LAYOUT_FAILURE,
  DELETE_LAYOUT,
  DELETE_LAYOUT_SUCCESS,
  DELETE_LAYOUT_FAILURE,
  GET_TEMPLATES,
  GET_TEMPLATES_SUCCESS,
  GET_TEMPLATES_FAILURE,
  UPDATE_INVOICE,
  TOGGLE_INCLUDE_IN_INVOICE,
};

type Types =
  | typeof GET_SCENE_LAYOUTS
  | typeof GET_SCENE_LAYOUTS_SUCCESS
  | typeof GET_SCENE_LAYOUTS_FAILURE
  | typeof UPDATE_LAYOUT
  | typeof UPDATE_LAYOUT_SUCCESS
  | typeof UPDATE_LAYOUT_FAILURE
  | typeof CREATE_LAYOUT
  | typeof CREATE_LAYOUT_SUCCESS
  | typeof CREATE_LAYOUT_FAILURE
  | typeof DELETE_LAYOUT
  | typeof DELETE_LAYOUT_SUCCESS
  | typeof DELETE_LAYOUT_FAILURE
  | typeof GET_TEMPLATES
  | typeof GET_TEMPLATES_SUCCESS
  | typeof GET_TEMPLATES_FAILURE
  | typeof UPDATE_LAYOUTS
  | typeof UPDATE_INVOICE
  | typeof UPDATE_LAYOUTS_SUCCESS
  | typeof TOGGLE_INCLUDE_IN_INVOICE;

// State
export type State = {
  layouts: PlacezLayoutPlan[];
  templates: PlacezLayoutPlan[];
  invoiceLineItems: InvoiceLineItem[];
  invoiceTotal: number;
  isFetchingTemplates: boolean;
};

const initialState: State = {
  layouts: [],
  templates: [],
  invoiceLineItems: [],
  invoiceTotal: 0,
  isFetchingTemplates: false
};

// Action Creators
export const GetSceneLayouts = (sceneId: number) => ({
  type: GET_SCENE_LAYOUTS as typeof GET_SCENE_LAYOUTS,
  sceneId,
});

export const GetSceneLayoutsSuccess = (layouts: PlacezLayoutPlan[]) => ({
  type: GET_SCENE_LAYOUTS_SUCCESS as typeof GET_SCENE_LAYOUTS_SUCCESS,
  layouts,
});

export const GetSceneLayoutsFailure = (error: any) => ({
  type: GET_SCENE_LAYOUTS_FAILURE as typeof GET_SCENE_LAYOUTS_FAILURE,
  error,
});

export const UpdateLayout = (layout: PlacezLayoutPlan) => ({
  type: UPDATE_LAYOUT as typeof UPDATE_LAYOUT,
  layout,
});

export const UpdateLayoutSuccess = (layout: PlacezLayoutPlan) => ({
  type: UPDATE_LAYOUT_SUCCESS as typeof UPDATE_LAYOUT_SUCCESS,
  layout,
});

export const UpdateLayoutFailure = (error: any) => ({
  type: UPDATE_LAYOUT_FAILURE as typeof UPDATE_LAYOUT_FAILURE,
  error,
});

export const UpdateLayouts = (layouts: PlacezLayoutPlan[]) => ({
  type: UPDATE_LAYOUTS as typeof UPDATE_LAYOUTS,
  layouts,
});

export const UpdateLayoutsSuccess = (layouts: PlacezLayoutPlan[]) => ({
  type: UPDATE_LAYOUTS_SUCCESS as typeof UPDATE_LAYOUTS_SUCCESS,
  layouts,
});

export const CreateLayout = (layout: PlacezLayoutPlan) => ({
  type: CREATE_LAYOUT as typeof CREATE_LAYOUT,
  layout,
});

export const CreateLayoutSuccess = (layout: PlacezLayoutPlan) => ({
  type: CREATE_LAYOUT_SUCCESS as typeof CREATE_LAYOUT_SUCCESS,
  layout,
});

export const CreateLayoutFailure = (error: any) => ({
  type: CREATE_LAYOUT_FAILURE as typeof CREATE_LAYOUT_FAILURE,
  error,
});

export const DeleteLayout = (layoutId: string) => ({
  type: DELETE_LAYOUT as typeof DELETE_LAYOUT,
  layoutId,
});

export const DeleteLayoutSuccess = (layoutId: string) => ({
  type: DELETE_LAYOUT_SUCCESS as typeof DELETE_LAYOUT_SUCCESS,
  layoutId,
});

export const DeleteLayoutFailure = (error: any) => ({
  type: DELETE_LAYOUT_FAILURE as typeof DELETE_LAYOUT_FAILURE,
  error,
});

export const GetTemplates = () => ({
  type: GET_TEMPLATES as typeof GET_TEMPLATES,
});

export const GetTemplatesSuccess = (templates: PlacezLayoutPlan[]) => ({
  type: GET_TEMPLATES_SUCCESS as typeof GET_TEMPLATES_SUCCESS,
  templates,
});

export const GetTemplatesFailure = (error: any) => ({
  type: GET_TEMPLATES_FAILURE as typeof GET_TEMPLATES_FAILURE,
  error,
});

export const UpdateInvoice = (
  invoiceLineItems: InvoiceLineItem[],
  invoiceTotal: number
) => ({
  type: UPDATE_INVOICE as typeof UPDATE_INVOICE,
  invoiceLineItems,
  invoiceTotal,
});

export const ToggleIncludeInInvoice = (layoutId: string) => ({
  type: TOGGLE_INCLUDE_IN_INVOICE as typeof TOGGLE_INCLUDE_IN_INVOICE,
  layoutId,
});

export type GetSceneLayoutsAction = ReturnType<typeof GetSceneLayouts>;
export type GetSceneLayoutsSuccessAction = ReturnType<
  typeof GetSceneLayoutsSuccess
>;
export type GetSceneLayoutsFailureAction = ReturnType<
  typeof GetSceneLayoutsFailure
>;
export type UpdateLayoutAction = ReturnType<typeof UpdateLayout>;
export type UpdateLayoutSuccessAction = ReturnType<typeof UpdateLayoutSuccess>;
export type UpdateLayoutFailureAction = ReturnType<typeof UpdateLayoutFailure>;
export type UpdateLayoutsAction = ReturnType<typeof UpdateLayouts>;
export type UpdateLayoutsSuccessAction = ReturnType<
  typeof UpdateLayoutsSuccess
>;
export type CreateLayoutAction = ReturnType<typeof CreateLayout>;
export type CreateLayoutSuccessAction = ReturnType<typeof CreateLayoutSuccess>;
export type CreateLayoutFailureAction = ReturnType<typeof CreateLayoutFailure>;
export type DeleteLayoutAction = ReturnType<typeof DeleteLayout>;
export type DeleteLayoutSuccessAction = ReturnType<typeof DeleteLayoutSuccess>;
export type DeleteLayoutFailureAction = ReturnType<typeof DeleteLayoutFailure>;
export type GetTemplatesAction = ReturnType<typeof GetTemplates>;
export type GetTemplatesSuccessAction = ReturnType<typeof GetTemplatesSuccess>;
export type GetTemplatesFailureAction = ReturnType<typeof GetTemplatesFailure>;
export type UpdateInvoiceAction = ReturnType<typeof UpdateInvoice>;
export type ToggleIncludeInInvoiceAction = ReturnType<
  typeof ToggleIncludeInInvoice
>;

export type Action =
  | GetSceneLayoutsAction
  | GetSceneLayoutsSuccessAction
  | GetSceneLayoutsFailureAction
  | UpdateLayoutAction
  | UpdateLayoutSuccessAction
  | UpdateLayoutFailureAction
  | CreateLayoutAction
  | CreateLayoutSuccessAction
  | CreateLayoutFailureAction
  | DeleteLayoutAction
  | DeleteLayoutSuccessAction
  | DeleteLayoutFailureAction
  | GetTemplatesAction
  | GetTemplatesSuccessAction
  | GetTemplatesFailureAction
  | UpdateLayoutsAction
  | UpdateInvoiceAction
  | UpdateLayoutsSuccessAction
  | ToggleIncludeInInvoiceAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_SCENE_LAYOUTS]: (
    state: State,
    action: GetSceneLayoutsAction
  ): State => ({
    ...state,
    layouts: undefined,
  }),
  [GET_SCENE_LAYOUTS_SUCCESS]: (
    state: State,
    action: GetSceneLayoutsSuccessAction
  ): State => ({
    ...state,
    layouts: action.layouts,
  }),
  [GET_SCENE_LAYOUTS_FAILURE]: (
    state: State,
    action: GetSceneLayoutsFailureAction
  ): State => state,
  [UPDATE_LAYOUT]: (state: State, action: UpdateLayoutAction): State => state,
  [UPDATE_LAYOUT_SUCCESS]: (
    state: State,
    action: UpdateLayoutSuccessAction
  ): State => ({
    ...state,
    layouts: state.layouts.map((layout) =>
      layout.id === action.layout.id ? { ...layout, ...action.layout } : layout
    ),
  }),
  [UPDATE_LAYOUTS]: (state: State, action: UpdateLayoutsAction): State => state,
  [UPDATE_LAYOUTS_SUCCESS]: (
    state: State,
    action: UpdateLayoutsSuccessAction
  ): State => ({
    ...state,
    layouts: state.layouts.map(
      (layout) =>
        action.layouts.find(
          (newLayout: PlacezLayoutPlan) => newLayout.id === layout.id
        ) ?? layout
    ),
  }),
  [UPDATE_LAYOUT_FAILURE]: (
    state: State,
    action: UpdateLayoutFailureAction
  ): State => state,
  [CREATE_LAYOUT]: (state: State, action: CreateLayoutAction): State => state,
  [CREATE_LAYOUT_SUCCESS]: (
    state: State,
    action: CreateLayoutSuccessAction
  ): State => ({
    ...state,
    layouts: state.layouts.concat([action.layout]),
  }),
  [CREATE_LAYOUT_FAILURE]: (
    state: State,
    action: CreateLayoutFailureAction
  ): State => state,
  [DELETE_LAYOUT]: (state: State, action: DeleteLayoutAction): State => state,
  [DELETE_LAYOUT_SUCCESS]: (
    state: State,
    action: DeleteLayoutSuccessAction
  ): State => {
    return {
      ...state,
      layouts: state.layouts.filter((layout) => layout.id !== action.layoutId),
    };
  },
  [DELETE_LAYOUT_FAILURE]: (
    state: State,
    action: DeleteLayoutFailureAction
  ): State => state,
  [GET_TEMPLATES]: (state: State, action: GetTemplatesAction): State => ({
    ...state,
    isFetchingTemplates: true,
  }),
  [GET_TEMPLATES_SUCCESS]: (
    state: State,
    action: GetTemplatesSuccessAction
  ): State => ({
    ...state,
    templates: action.templates,
    isFetchingTemplates: false,
  }),
  [GET_TEMPLATES_FAILURE]: (
    state: State,
    action: GetTemplatesFailureAction
  ): State => ({
    ...state,
    isFetchingTemplates: false
  }),
  [UPDATE_INVOICE]: (state: State, action: UpdateInvoiceAction): State => ({
    ...state,
    invoiceLineItems: action.invoiceLineItems,
    invoiceTotal: action.invoiceTotal,
  }),
  [TOGGLE_INCLUDE_IN_INVOICE]: (
    state: State,
    action: ToggleIncludeInInvoiceAction
  ): State => ({
    ...state,
    layouts: state.layouts.map((layout) =>
      layout.id === action.layoutId
        ? { ...layout, hideInInvoice: !layout.hideInInvoice }
        : layout
    ),
  }),
});

export const getLayouts = (state: { layouts: State }): PlacezLayoutPlan[] => {
  return state.layouts.layouts;
};

export const getLayoutById = (state: { layouts: State }, layoutId: string) => {
  return state.layouts.layouts.find((layout) => layout.id === layoutId);
};
