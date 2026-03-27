import createReducer from './helpers/createReducer';
import { normalizeArray } from '../sharing/utils/normalizeArray';
import { PlacezMaterial } from '../api/placez/models/PlacezMaterial';

// Action Types
const GET_MATERIALS = 'GET_MATERIALS';
const GET_MATERIALS_SUCCESS = 'GET_MATERIALS_SUCCESS';
const GET_MATERIALS_FAILURE = 'GET_MATERIALS_FAILURE';
const SAVE_MATERIAL = 'SAVE_MATERIAL';
const DELETE_MATERIAL = 'DELETE_MATERIAL';

export const types = {
  GET_MATERIALS,
  GET_MATERIALS_SUCCESS,
  GET_MATERIALS_FAILURE,
  SAVE_MATERIAL,
  DELETE_MATERIAL,
};

type Types =
  | typeof GET_MATERIALS
  | typeof GET_MATERIALS_SUCCESS
  | typeof GET_MATERIALS_FAILURE
  | typeof SAVE_MATERIAL
  | typeof DELETE_MATERIAL;

// State
export type State = {
  materials: PlacezMaterial[];
  byId: { [key: string]: PlacezMaterial };
  materialsLoading: boolean;
  assetFilter: string;
};

const initialState: State = {
  materials: [],
  byId: {},
  materialsLoading: false,
  assetFilter: '',
};

// Action Creators
export const GetMaterials = () => ({
  type: GET_MATERIALS as typeof GET_MATERIALS,
});

export const GetMaterialsSuccess = (materials: PlacezMaterial[]) => ({
  type: GET_MATERIALS_SUCCESS as typeof GET_MATERIALS_SUCCESS,
  materials,
});

export const GetMaterialsFailure = (error: any) => ({
  type: GET_MATERIALS_FAILURE as typeof GET_MATERIALS_FAILURE,
  error,
});

export const SaveMaterial = (material: PlacezMaterial) => ({
  type: SAVE_MATERIAL as typeof SAVE_MATERIAL,
  material,
});

export const DeleteMaterial = (id: string) => ({
  type: DELETE_MATERIAL as typeof DELETE_MATERIAL,
  id,
});

export type GetMaterialsAction = ReturnType<typeof GetMaterials>;
export type GetMaterialsSuccessAction = ReturnType<typeof GetMaterialsSuccess>;
export type GetMaterialsFailureAction = ReturnType<typeof GetMaterialsFailure>;
export type SaveMaterialAction = ReturnType<typeof SaveMaterial>;
export type DeleteMaterialAction = ReturnType<typeof DeleteMaterial>;

export type Action = GetMaterialsAction | GetMaterialsSuccessAction;
// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_MATERIALS]: (state: State, action: GetMaterialsAction): State => ({
    ...state,
    materialsLoading: true,
  }),
  [GET_MATERIALS_SUCCESS]: (
    state: State,
    action: GetMaterialsSuccessAction
  ): State => ({
    ...state,
    materialsLoading: false,
    materials: action.materials,
    byId: normalizeArray(action.materials, 'id'),
  }),
  [GET_MATERIALS_FAILURE]: (
    state: State,
    action: GetMaterialsFailureAction
  ): State => ({
    ...state,
    materialsLoading: false,
  }),
  [SAVE_MATERIAL]: (state: State, action: SaveMaterialAction): State => ({
    ...state,
  }),
  [DELETE_MATERIAL]: (state: State, action: DeleteMaterialAction): State => ({
    ...state,
  }),
});
