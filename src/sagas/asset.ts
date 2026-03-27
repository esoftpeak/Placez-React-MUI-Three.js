import {
  all,
  takeLatest,
  put,
  call,
  take,
  race,
} from 'redux-saga/effects';
import {
  types,
  GetAssetsAction,
  GetCatalogsAction,
  GetCatalogLicensesAction,
  RefreshAssetsAction,
  SaveCustomAssetAction,
  DeleteCustomAssetAction,
  SaveAssetGroupAction,
  DeleteAssetGroupAction,
  UpdateAssetGroupAction,
} from '../reducers/asset';

import { SagaReady } from '../reducers/lifecycle';

// Api
import { placezApi,  AssetCollection, AssetCatalog } from '../api';

// Models
import { Asset } from '../blue/items';

import {
  Catalog,
  CatalogLicense,
  UnlicensedCatalog,
  applyLicense,
} from '../models';
import { types as uiTypes } from '../reducers/ui';
import { createAssetGroupFromItems } from '../blue/three/controller';
import AssetModifierHelper from '../blue/itemModifiers/AssetModifierHelper'

// Utils
export default function* assetSaga() {
  yield all([
    takeLatest(types.GET_ASSETS, getAssetsEffect),
    takeLatest(types.GET_CATALOGS, getCatalogs),
    takeLatest(types.GET_CATALOG_LICENSES, getCatalogLicenses),
    takeLatest(types.REFRESH_ASSETS, refreshAssets),
    takeLatest(types.SAVE_CUSTOM_ASSET, saveCustomAsset),
    takeLatest(types.GET_CUSTOM_SKUS, getCustomSkus),
    takeLatest(types.DELETE_CUSTOM_ASSET, deleteCustomAsset),
    takeLatest(types.SAVE_ASSET_GROUP, saveAssetGroup),
    takeLatest(types.GET_ASSET_GROUPS, getAssetGroups),
    takeLatest(types.DELETE_ASSET_GROUP, deleteAssetGroup),
    takeLatest(types.UPDATE_ASSET_GROUP, updateAssetGroup),
  ]);
  yield put({ type: types.REFRESH_ASSETS });
  yield put(SagaReady('asset'));
}

function* refreshAssets(action: RefreshAssetsAction) {
  yield put({ type: types.GET_ASSETS });
  yield race([take(types.GET_ASSETS_SUCCESS), take(types.GET_ASSETS_FAILURE)]);

  yield put({ type: types.GET_CATALOGS });
  yield race([
    take(types.GET_CATALOGS_SUCCESS),
    take(types.GET_CATALOGS_FAILURE),
  ]);

  yield put({ type: types.GET_CUSTOM_SKUS });
  yield race([
    take(types.GET_CUSTOM_SKUS_SUCCESS),
    take(types.GET_CUSTOM_SKUS_FAILURE),
  ]);

  yield put({ type: types.GET_ASSET_GROUPS });
  yield race([
    take(types.GET_ASSET_GROUPS_SUCCESS),
    take(types.GET_ASSET_GROUPS_FAILURE),
  ]);

  yield put({ type: types.REFRESH_ASSETS_COMPLETE });
}

function* getAssetsEffect(action: GetAssetsAction) {
  try {
    const response = yield call(placezApi.getMediaAssets);
    const assets = response.parsedBody as Asset[];
    yield put({ type: types.GET_ASSETS_SUCCESS, assets });
  } catch (error) {
    yield put({ type: types.GET_ASSETS_FAILURE, error });
  }
}

function* getCatalogs(action: GetCatalogsAction) {
  try {
    const response = yield call(placezApi.getAssetCatalog);
    const assetCatalogs = response.parsedBody as AssetCatalog[];
    const catalogs = assetCatalogs.map(
      (assetCatalog) => new UnlicensedCatalog(assetCatalog)
    );
    // FIXME Catalogs should be presorted from API
    yield call(sortCatalogs, catalogs);
    let potentialCatalogs = [] as UnlicensedCatalog[];
    try {
      const response = yield call(placezApi.getAssetCollections);
      const collections = response.parsedBody as AssetCollection[];
      const licenses = collections.map(
        (collection) => new CatalogLicense(collection)
      );
      yield call(licenseCatalogs, catalogs, licenses);
      potentialCatalogs = yield call(nonPrivate, catalogs, licenses);
      yield put({ type: types.GET_CATALOG_LICENSES_SUCCESS, licenses });
    } catch (error) {
      yield put({ type: types.GET_CATALOG_LICENSES_FAILURE, error });
    }

    // TODO Handle broken skus
    yield put({
      type: types.GET_CATALOGS_SUCCESS,
      catalogs: potentialCatalogs,
      allCatalogs: catalogs,
    });
  } catch (error) {
    yield put({ type: types.GET_CATALOGS_FAILURE, error });
  }
}

function sortCatalogs(catalogs: Catalog[]) {
  catalogs
    .sort(sortOrder)
    .forEach((catalog) =>
      catalog.categories
        .sort(sortOrder)
        .forEach((category) => category.subCategories.sort(sortOrder))
    );
}

function sortOrder(a: { sortOrder: number }, b: { sortOrder: number }) {
  return a.sortOrder - b.sortOrder;
}

function licenseCatalogs(catalogs: Catalog[], licenses: CatalogLicense[]) {
  catalogs.forEach(catalog => {
    const validLicenses = licenses.filter(
      license => license.catalogCode === catalog.catalogCode);
    if (validLicenses.length > 0) {
      applyLicense(catalog, validLicenses[0]);
    }
  });
}

function nonPrivate(catalogs: Catalog[], licenses: CatalogLicense[]) {
  return catalogs.filter((catalog) => {
    if (!catalog.private) {
      return true;
    }
    if (catalog.private && licenses.some(licenseCatalog => {
      return licenseCatalog.catalogCode === catalog.catalogCode;
    })) {
      return true;
    }
    return false;
  });
}

function* getCatalogLicenses(action: GetCatalogLicensesAction) {
  try {
    const response = yield call(placezApi.getAssetCollections);
    const collections = response.parsedBody as AssetCollection[];
    const licenses = collections.map(
      (collection) => new CatalogLicense(collection)
    );

    yield put({ type: types.GET_CATALOG_LICENSES_SUCCESS, licenses });
  } catch (error) {
    yield put({ type: types.GET_CATALOG_LICENSES_FAILURE, error });
  }
}

const EmptyGuid = '00000000-0000-0000-0000-000000000000';

function* saveCustomAsset(action: SaveCustomAssetAction) {
  try {
    yield put({
      type: uiTypes.TOAST_MESSAGE,
      message: 'Saving Custom Asset',
    });
    const cleanedAsset = {
      ...action.asset,
      id: 0,
      instanceId: EmptyGuid,
      layoutId: EmptyGuid,
      custom: true,
      modifiers: AssetModifierHelper.clearAllModifierFields(action.asset.modifiers),
      materialMask: action.asset.materialMask?.map((material) =>
        material ? {
        ...material,
        id: EmptyGuid,
        mediaAssetID: null,
        placedAssetId: null,
        organizationId: null,
        } : null),
    }
    yield call(placezApi.postCustomAsset, cleanedAsset);
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Custom Asset Saved' });
    yield put({ type: types.REFRESH_ASSETS });
  } catch (error) {}
}

function* getCustomSkus() {
  try {
    const assets = yield call(placezApi.getCustomAssets);

    const customSkus = assets.parsedBody.map((asset: Asset) => {
      return {
        sku: asset.sku,
        asset: {
          ...asset,
          custom: true,
        },
      };
    });
    yield put({ type: types.GET_CUSTOM_SKUS_SUCCESS, customSkus });
  } catch (error) {
    yield put({ type: types.GET_CUSTOM_SKUS_FAILURE, error });
  }
}

function* deleteCustomAsset(action: DeleteCustomAssetAction) {
  try {
    yield put({
      type: uiTypes.TOAST_MESSAGE,
      message: 'Deleting Custom Asset',
    });

    yield call(placezApi.deleteCustomAsset, action.id);
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Custom Asset Deleted' });
    yield put({ type: types.REFRESH_ASSETS });
    yield put({ type: types.GET_CUSTOM_SKUS });
  } catch (error) {
    console.error('Saga: Error deleting custom asset:', error);
    yield put({
      type: uiTypes.TOAST_MESSAGE,
      message: `Error deleting custom asset: ${error.message || error}`
    });
  }
}

function* saveAssetGroup(action: SaveAssetGroupAction) {
  const assetGroup = createAssetGroupFromItems(action.items, action.label);

  try {
    yield put({
      type: uiTypes.TOAST_MESSAGE,
      message: `Saving ${action.label} Group`,
    });
    yield call(placezApi.postGroup, assetGroup);
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Group Saved' });
    yield put({ type: types.GET_ASSET_GROUPS });
  } catch (error) {}
}

function* updateAssetGroup(action: UpdateAssetGroupAction) {
  try {
    yield put({
      type: uiTypes.TOAST_MESSAGE,
      message: `Saving ${action.newAssetGroup.name} Group`,
    });
    yield call(placezApi.postGroup, action.newAssetGroup);
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Group Saved' });
    yield put({ type: types.GET_ASSET_GROUPS });
  } catch (error) {}
}

function* getAssetGroups() {
  try {
    const getAssetGroups = yield call(placezApi.getAssetGroups);
    const assetGroups = getAssetGroups.parsedBody;
    yield put({ type: types.GET_ASSET_GROUPS_SUCCESS, assetGroups });
  } catch (error) {}
}

function* deleteAssetGroup(action: DeleteAssetGroupAction) {
  try {
    yield call(placezApi.deleteAssetGroup, action.id);
    yield put({ type: types.GET_ASSET_GROUPS });
  } catch (error) {}
}
