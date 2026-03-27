import createReducer from './helpers/createReducer';
import { Asset } from '../blue/items';
import { Catalog, CatalogLicense, CatalogType } from '../models';
import { normalizeArray, catalogConsolidation } from '../sharing/utils/normalizeArray';
import { Sku } from '../api';
import { Item } from '../blue/items/item';
import { AssetGroup } from '../blue/items/assetGroup';
const defaultCatalogId = 1;

// Action Types
const GET_ASSETS = 'GET_ASSETS';
const GET_ASSETS_SUCCESS = 'GET_ASSETS_SUCCESS';
const GET_ASSETS_FAILURE = 'GET_ASSETS_FAILURE';
const GET_CATALOGS = 'GET_CATALOGS';
const GET_CATALOGS_SUCCESS = 'GET_CATALOGS_SUCCESS';
const GET_CATALOGS_FAILURE = 'GET_CATALOGS_FAILURE';
const GET_CATALOG_LICENSES = 'GET_CATALOG_LICENSES';
const GET_CATALOG_LICENSES_SUCCESS = 'GET_CATALOG_LICENSES_SUCCESS';
const GET_CATALOG_LICENSES_FAILURE = 'GET_CATALOG_LICENSES_FAILURE';
const SELECT_CATALOG = 'SELECT_CATALOG';
const REFRESH_ASSETS = 'REFRESH_ASSETS';
const REFRESH_ASSETS_COMPLETE = 'REFRESH_ASSETS_COMPLETE';
const SET_ASSET_FILTER = 'SET_ASSET_FILTER';
const UPDATE_ASSET_ARRAY = 'UPDATE_ASSET_ARRAY';
const SAVE_CUSTOM_ASSET = 'SAVE_CUSTOM_ASSET';
const GET_CUSTOM_SKUS = 'GET_CUSTOM_SKUS';
const GET_CUSTOM_SKUS_SUCCESS = 'GET_CUSTOM_SKUS_SUCCESS';
const GET_CUSTOM_SKUS_FAILURE = 'GET_CUSTOM_SKUS_FAILURE';
const DELETE_CUSTOM_ASSET = 'DELETE_CUSTOM_ASSET';
const SAVE_ASSET_GROUP = 'SAVE_ASSET_GROUP';
const GET_ASSET_GROUPS = 'GET_ASSET_GROUPS';
const GET_ASSET_GROUPS_SUCCESS = 'GET_ASSET_GROUPS_SUCCES';
const GET_ASSET_GROUPS_FAILURE = 'GET_ASSET_GROUPS_FAILURE';
const DELETE_ASSET_GROUP = 'DELETE_ASSET_GROUP';
const UPDATE_ASSET_GROUP = 'UPDATE_ASSET_GROUP';

export const types = {
  GET_ASSETS,
  GET_ASSETS_SUCCESS,
  GET_ASSETS_FAILURE,
  GET_CATALOGS,
  GET_CATALOGS_SUCCESS,
  GET_CATALOGS_FAILURE,
  GET_CATALOG_LICENSES,
  GET_CATALOG_LICENSES_SUCCESS,
  GET_CATALOG_LICENSES_FAILURE,
  SELECT_CATALOG,
  REFRESH_ASSETS,
  REFRESH_ASSETS_COMPLETE,
  SET_ASSET_FILTER,
  UPDATE_ASSET_ARRAY,
  SAVE_CUSTOM_ASSET,
  GET_CUSTOM_SKUS,
  GET_CUSTOM_SKUS_SUCCESS,
  GET_CUSTOM_SKUS_FAILURE,
  DELETE_CUSTOM_ASSET,
  SAVE_ASSET_GROUP,
  GET_ASSET_GROUPS,
  GET_ASSET_GROUPS_SUCCESS,
  GET_ASSET_GROUPS_FAILURE,
  DELETE_ASSET_GROUP,
  UPDATE_ASSET_GROUP,
};

type Types =
  | typeof GET_ASSETS
  | typeof GET_ASSETS_SUCCESS
  | typeof GET_ASSETS_FAILURE
  | typeof GET_CATALOGS
  | typeof GET_CATALOGS_SUCCESS
  | typeof GET_CATALOGS_FAILURE
  | typeof GET_CATALOG_LICENSES
  | typeof GET_CATALOG_LICENSES_SUCCESS
  | typeof GET_CATALOG_LICENSES_FAILURE
  | typeof SELECT_CATALOG
  | typeof REFRESH_ASSETS
  | typeof REFRESH_ASSETS_COMPLETE
  | typeof SET_ASSET_FILTER
  | typeof UPDATE_ASSET_ARRAY
  | typeof SAVE_CUSTOM_ASSET
  | typeof GET_CUSTOM_SKUS
  | typeof GET_CUSTOM_SKUS_SUCCESS
  | typeof GET_CUSTOM_SKUS_FAILURE
  | typeof DELETE_CUSTOM_ASSET
  | typeof SAVE_ASSET_GROUP
  | typeof GET_ASSET_GROUPS
  | typeof GET_ASSET_GROUPS_SUCCESS
  | typeof GET_ASSET_GROUPS_FAILURE
  | typeof DELETE_ASSET_GROUP
  | typeof UPDATE_ASSET_GROUP;

// State
export type State = {
  catalogsLoading: boolean;
  catalogs: Catalog[];
  allCatalogs: Catalog[];
  catalogLicenses: CatalogLicense[];
  licensesLoading: boolean;
  catalogsById: { [key: string]: Catalog };
  bySku: { [key: string]: Asset };
  assetsLoading: boolean;
  assetsLoaded: boolean;
  selectedCatalogId: number;
  assetFilter: string;
  customSkus: Sku[];
  assetGroups: AssetGroup[];
};

const initialState: State = {
  catalogsLoading: false,
  catalogs: [],
  allCatalogs: [],
  licensesLoading: false,
  catalogLicenses: [],
  catalogsById: {},
  bySku: {},
  assetsLoading: false,
  assetsLoaded: false,
  selectedCatalogId: defaultCatalogId,
  assetFilter: '',
  customSkus: [],
  assetGroups: [],
};

// Action Creators
export const GetAssets = () => ({
  type: GET_ASSETS as typeof GET_ASSETS,
});

export const GetAssetsSuccess = (assets: Asset[]) => ({
  type: GET_ASSETS_SUCCESS as typeof GET_ASSETS_SUCCESS,
  assets,
});

export const GetAssetsFailure = (error: any) => ({
  type: GET_ASSETS_FAILURE as typeof GET_ASSETS_FAILURE,
  error,
});

export const GetCatalogs = () => ({
  type: GET_CATALOGS as typeof GET_CATALOGS,
});

export const GetCatalogsSuccess = (
  catalogs: Catalog[],
  allCatalogs: Catalog[]
) => ({
  type: GET_CATALOGS_SUCCESS as typeof GET_CATALOGS_SUCCESS,
  catalogs,
  allCatalogs,
});

export const GetCatalogsFailure = (error: any) => ({
  type: GET_CATALOGS_FAILURE as typeof GET_CATALOGS_FAILURE,
  error,
});

export const GetCatalogLicenses = () => ({
  type: GET_CATALOG_LICENSES as typeof GET_CATALOG_LICENSES,
});

export const GetCatalogLicensesSuccess = (licenses: CatalogLicense[]) => ({
  type: GET_CATALOG_LICENSES_SUCCESS as typeof GET_CATALOG_LICENSES_SUCCESS,
  licenses,
});

export const GetCatalogLicensesFailure = (error: any) => ({
  type: GET_CATALOG_LICENSES_FAILURE as typeof GET_CATALOG_LICENSES_FAILURE,
  error,
});

export const SelectCatalog = (selectCatalogId: number) => ({
  type: SELECT_CATALOG as typeof SELECT_CATALOG,
  selectCatalogId,
});

export const RefreshAssets = () => ({
  type: REFRESH_ASSETS as typeof REFRESH_ASSETS,
});

export const RefreshAssetsComplete = () => ({
  type: REFRESH_ASSETS_COMPLETE as typeof REFRESH_ASSETS_COMPLETE,
});

export const SetAssetFilter = (filter: string) => ({
  type: SET_ASSET_FILTER as typeof SET_ASSET_FILTER,
  filter,
});

export const UpdateAssetArray = (assetArray: { [key: string]: Asset }) => ({
  type: UPDATE_ASSET_ARRAY as typeof UPDATE_ASSET_ARRAY,
  assetArray,
});

export const SaveCustomAsset = (asset: Asset) => ({
  type: SAVE_CUSTOM_ASSET as typeof SAVE_CUSTOM_ASSET,
  asset,
});

export const GetCustomSkus = () => ({
  type: GET_CUSTOM_SKUS as typeof GET_CUSTOM_SKUS,
});

export const GetCustomSkusSuccess = (customSkus: Sku[]) => ({
  type: GET_CUSTOM_SKUS as typeof GET_CUSTOM_SKUS,
  customSkus,
});

export const GetCustomSkusFailure = (error: any) => ({
  type: GET_CUSTOM_SKUS_FAILURE as typeof GET_CUSTOM_SKUS_FAILURE,
  error,
});

export const DeleteCustomAsset = (id: number) => ({
  type: DELETE_CUSTOM_ASSET as typeof DELETE_CUSTOM_ASSET,
  id,
});

export const SaveAssetGroupAction = (items: Item[], label: string) => ({
  type: SAVE_ASSET_GROUP as typeof SAVE_ASSET_GROUP,
  items,
  label,
});

export const UpdateAssetGroupAction = (newAssetGroup: AssetGroup) => ({
  type: UPDATE_ASSET_GROUP as typeof UPDATE_ASSET_GROUP,
  newAssetGroup,
});

export const GetAssetGroupsAction = () => ({
  type: GET_ASSET_GROUPS as typeof GET_ASSET_GROUPS,
});

export const GetAssetGroupsSuccess = (assetGroups: AssetGroup[]) => ({
  type: GET_ASSET_GROUPS_SUCCESS as typeof GET_ASSET_GROUPS_SUCCESS,
  assetGroups,
});

export const GetAssetGroupsFailure = (error: any) => ({
  type: GET_ASSET_GROUPS_FAILURE as typeof GET_ASSET_GROUPS_FAILURE,
  error,
});

export const DeleteAssetGroupAction = (id: string) => ({
  type: DELETE_ASSET_GROUP as typeof DELETE_ASSET_GROUP,
  id,
});

export type GetAssetsAction = ReturnType<typeof GetAssets>;
export type GetAssetsSuccessAction = ReturnType<typeof GetAssetsSuccess>;
export type GetAssetsFailureAction = ReturnType<typeof GetAssetsFailure>;
export type GetCatalogsAction = ReturnType<typeof GetCatalogs>;
export type GetCatalogsSuccessAction = ReturnType<typeof GetCatalogsSuccess>;
export type GetCatalogsFailureAction = ReturnType<typeof GetCatalogsFailure>;
export type GetCatalogLicensesAction = ReturnType<typeof GetCatalogLicenses>;
export type GetCatalogLicensesSuccessAction = ReturnType<
  typeof GetCatalogLicensesSuccess
>;
export type GetCatalogLicensesFailureAction = ReturnType<
  typeof GetCatalogLicensesFailure
>;
export type SelectCatalogAction = ReturnType<typeof SelectCatalog>;
export type RefreshAssetsAction = ReturnType<typeof RefreshAssets>;
export type RefreshAssetsCompleteAction = ReturnType<
  typeof RefreshAssetsComplete
>;
export type SetAssetFilterAction = ReturnType<typeof SetAssetFilter>;
export type UpdateAssetArray = ReturnType<typeof UpdateAssetArray>;
export type SaveCustomAssetAction = ReturnType<typeof SaveCustomAsset>;
export type GetCustomSkusAction = ReturnType<typeof GetCustomSkus>;
export type GetCustomSkusSuccessAction = ReturnType<
  typeof GetCustomSkusSuccess
>;
export type GetCustomSkusFailureAction = ReturnType<
  typeof GetCustomSkusFailure
>;
export type DeleteCustomAssetAction = ReturnType<typeof DeleteCustomAsset>;
export type SaveAssetGroupAction = ReturnType<typeof SaveAssetGroupAction>;
export type GetAssetGroupsAction = ReturnType<typeof GetAssetGroupsAction>;
export type GetAssetGroupsSuccess = ReturnType<typeof GetAssetGroupsSuccess>;
export type GetAssetGroupsFailure = ReturnType<typeof GetAssetGroupsFailure>;
export type DeleteAssetGroupAction = ReturnType<typeof DeleteAssetGroupAction>;
export type UpdateAssetGroupAction = ReturnType<typeof UpdateAssetGroupAction>;

export type Action =
  | GetAssetsAction
  | GetAssetsSuccessAction
  | GetAssetsFailureAction
  | GetCatalogsAction
  | GetCatalogsSuccessAction
  | GetCatalogsFailureAction
  | GetCatalogLicensesAction
  | GetCatalogLicensesSuccessAction
  | GetCatalogLicensesFailureAction
  | SelectCatalogAction
  | RefreshAssetsAction
  | RefreshAssetsCompleteAction
  | SetAssetFilterAction
  | UpdateAssetArray
  | SaveCustomAssetAction
  | GetCustomSkusAction
  | GetCustomSkusSuccessAction
  | DeleteCustomAssetAction
  | SaveAssetGroupAction
  | GetAssetGroupsAction
  | GetAssetGroupsSuccess
  | GetAssetGroupsFailure
  | DeleteAssetGroupAction
  | UpdateAssetGroupAction;

// ---- Constants ----
export const CATALOG_NAME = "Banquet Library";

export const CATEGORY = {
  EVENT: "Event",
  AV: "AV",
  AUDIO_VISUALS: "Audio Visuals",
  WALL_DECOR: "Wall Decor",
  DECOR: "Décor",
  KITCHEN: "Kitchen",
  RACKS: "Racks",
  SERVING: "Serving",
  PROPS: "Props",
  BALLOONS: "Balloons",
  STORAGE: "Storage",
  TENTS: "Tents",
} as const;


// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_ASSETS]: (state: State, action: GetAssetsAction): State => ({
    ...state,
    assetsLoading: true,
  }),
  [GET_ASSETS_SUCCESS]: (
    state: State,
    action: GetAssetsSuccessAction
  ): State => ({
    ...state,
    assetsLoading: false,
    assetsLoaded: true,
    bySku: normalizeArray(action.assets, 'sku'),
  }),
  [GET_ASSETS_FAILURE]: (
    state: State,
    action: GetAssetsFailureAction
  ): State => ({
    ...state,
    assetsLoading: false,
  }),
  [GET_CATALOGS]: (state: State, action: GetCatalogsAction): State => ({
    ...state,
    catalogsLoading: true,
  }),
  [GET_CATALOGS_SUCCESS]: (
    state: State,
    action: GetCatalogsSuccessAction
  ): State => {
    const consolidationCatalog = catalogConsolidation(normalizeArray(action.catalogs, 'id'));
    return ({
      ...state,
      catalogs: action.catalogs,
      allCatalogs: action.allCatalogs,
      catalogsById: consolidationCatalog,
      catalogsLoading: false,
    })
  },
  [GET_CATALOGS_FAILURE]: (
    state: State,
    action: GetCatalogsFailureAction
  ): State => ({
    ...state,
    catalogsLoading: false,
  }),

  [GET_CATALOG_LICENSES]: (
    state: State,
    action: GetCatalogLicensesAction
  ): State => ({
    ...state,
    licensesLoading: true,
  }),
  [GET_CATALOG_LICENSES_SUCCESS]: (
    state: State,
    action: GetCatalogLicensesSuccessAction
  ): State => ({
    ...state,
    catalogLicenses: action.licenses,
    licensesLoading: false,
  }),
  [GET_CATALOG_LICENSES_FAILURE]: (
    state: State,
    action: GetCatalogLicensesFailureAction
  ): State => ({
    ...state,
    licensesLoading: false,
  }),
  [SELECT_CATALOG]: (state: State, action: SelectCatalogAction): State => ({
    ...state,
    selectedCatalogId: action.selectCatalogId,
  }),
  [REFRESH_ASSETS]: (state: State, action: RefreshAssetsAction): State => ({
    ...state,
  }),
  [REFRESH_ASSETS_COMPLETE]: (
    state: State,
    action: RefreshAssetsCompleteAction
  ): State => ({
    ...state,
  }),
  [SET_ASSET_FILTER]: (state: State, action: SetAssetFilterAction): State => ({
    ...state,
    assetFilter: action.filter,
  }),
  [UPDATE_ASSET_ARRAY]: (state: State, action: UpdateAssetArray): State => ({
    ...state,
    bySku: action.assetArray,
  }),
  [SAVE_CUSTOM_ASSET]: (
    state: State,
    action: SaveCustomAssetAction
  ): State => ({
    ...state,
  }),
  [GET_CUSTOM_SKUS]: (state: State, action: GetCustomSkusAction): State => ({
    ...state,
  }),
  [GET_CUSTOM_SKUS_SUCCESS]: (
    state: State,
    action: GetCustomSkusSuccessAction
  ): State => ({
    ...state,
    customSkus: action.customSkus,
  }),
  [GET_CUSTOM_SKUS_FAILURE]: (
    state: State,
    action: GetCustomSkusFailureAction
  ): State => ({
    ...state,
  }),
  [DELETE_CUSTOM_ASSET]: (
    state: State,
    action: DeleteCustomAssetAction
  ): State => ({
    ...state,
  }),
  [SAVE_ASSET_GROUP]: (state: State, action: SaveAssetGroupAction): State => ({
    ...state,
  }),
  [GET_ASSET_GROUPS]: (state: State, action: GetAssetGroupsAction): State => ({
    ...state,
  }),
  [GET_ASSET_GROUPS_SUCCESS]: (
    state: State,
    action: GetAssetGroupsSuccess
  ): State => ({
    ...state,
    assetGroups: action.assetGroups,
  }),
  [GET_ASSET_GROUPS_FAILURE]: (
    state: State,
    action: GetAssetGroupsFailure
  ): State => ({
    ...state,
  }),
  [DELETE_ASSET_GROUP]: (
    state: State,
    action: DeleteAssetGroupAction
  ): State => ({
    ...state,
  }),
  [UPDATE_ASSET_GROUP]: (
    state: State,
    action: UpdateAssetGroupAction
  ): State => ({
    ...state,
  }),
});

// Selectors
export const getCatalogsByType = (
  state: { asset: State },
  catalogType: CatalogType
): Catalog[] => {
  return state.asset.catalogs.filter(
    (catalog) => catalog.catalogType === catalogType
  );
};

export const getAssetsLoaded = (state: { asset: State }) => {
  return state.asset.assetsLoaded;
};

export const getAssetsLoading = (state: { asset: State }) => {
  return state.asset.assetsLoading;
};
