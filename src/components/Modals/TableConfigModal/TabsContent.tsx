import { Theme, createStyles } from '@mui/material';
import { makeStyles } from '@mui/styles';

import ChairSelectForm from './ChairSelectForm';
import { Catalog } from '../../../models/Catalog';
import { Asset } from '../../../blue/items';
import { Sku } from '../../../api';
import { ReduxState } from '../../../reducers';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { AssetModifierKeys, AssetModifiers } from '../../../blue/items/asset';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    content: {
      display: 'flex',
      alignContent: 'center-justified',
    },
  })
);

interface Props {
  asset: Asset;

  tableConfigTabIndex: number;
  catalogs: Catalog[];
  modifiers?: AssetModifiers;
  handleModifierAssetChange?: <
    modifierKey extends keyof AssetModifiers,
    modifierParamKey extends keyof AssetModifiers[modifierKey],
  >(
    assetModifierKey: modifierKey,
    keyOfAssetModifierKey: modifierParamKey
  ) => (asset: Asset) => void;
}

const getCustomSkus = (state, props) => {
  return state.asset.customSkus;
};

const getCatalogs = (state, props: Props) => {
  return props.catalogs;
};

const getAsset = (state, props: Props) => {
  return props.asset;
};

const getChairs = createSelector(
  [getCustomSkus, getCatalogs],
  (customSkus, catalogs) => {
    const chairs = catalogs
      .find((catalog) => {
        return catalog.name === 'PlacezDefault';
      })
      .categories.find((primaryCategory) => {
        return primaryCategory.name === 'Table';
      })
      .subCategories.find((secondaryCategory) => {
        return secondaryCategory.name === 'Chairs';
      }).itemSkus;
    if (chairs) {
      const customChairs = customSkus.filter((sku: Sku) => {
        return chairs.find((chair) => {
          return (
            sku.asset.extensionProperties !== null &&
            sku.asset.extensionProperties.progenitorId === chair.sku
          );
        });
      });

      return customChairs.concat(chairs);
    }
    return [];
  }
);

const getCenterPieces = createSelector(
  [getCustomSkus, getCatalogs],
  (customSkus, catalogs) => {
    const centerPieces = catalogs
      .find((catalog) => {
        return catalog.name === 'PlacezDefault';
      })
      .categories.find((primaryCategory) => {
        return primaryCategory.name === 'Table';
      })
      .subCategories.find((secondaryCategory) => {
        return secondaryCategory.name === 'Center Pieces';
      }).itemSkus;
    if (centerPieces) {
      const customCenterPieces = customSkus.filter((sku: Sku) => {
        return centerPieces.find((centerPiece) => {
          return (
            sku.asset.extensionProperties !== null &&
            sku.asset.extensionProperties.progenitorId === centerPiece.sku
          );
        });
      });

      return customCenterPieces.concat(centerPieces);
    }
    return [];
  }
);

const getPlaceSettings = createSelector(
  [getCustomSkus, getCatalogs],
  (customSkus, catalogs) => {
    const placeSettings = catalogs
      .find((catalog) => {
        return catalog.name === 'PlacezDefault';
      })
      .categories.find((primaryCategory) => {
        return primaryCategory.name === 'Table';
      })
      .subCategories.find((secondaryCategory) => {
        return secondaryCategory.name === 'Plates';
      }).itemSkus;
    if (placeSettings) {
      const customPlaceSettings = customSkus.filter((sku: Sku) => {
        return placeSettings.find((placeSetting) => {
          return (
            sku.asset.extensionProperties !== null &&
            sku.asset.extensionProperties.progenitorId === placeSetting.sku
          );
        });
      });

      return customPlaceSettings.concat(placeSettings);
    }
    return [];
  }
);

const getLinen = createSelector(
  [getCustomSkus, getAsset],
  (customSkus, asset) => {
    if (!asset.modifiers.linenMod?.linenDefaultSku) return [];
    const linens = [
      {
        sku: asset.modifiers.linenMod.linenDefaultSku,
      },
    ];
    const customLinens = customSkus.filter((sku: Sku) => {
      return linens.find((linen) => {
        return (
          sku.asset.extensionProperties !== null &&
          sku.asset.extensionProperties.progenitorId === linen.sku
        );
      });
    });

    return customLinens.concat(linens);
  }
);

const TabsContent = (props: Props) => {
  const allChairs = useSelector((state: ReduxState) => getChairs(state, props));
  const allPlaceSettings = useSelector((state: ReduxState) =>
    getPlaceSettings(state, props)
  );
  const allCenterPieces = useSelector((state: ReduxState) =>
    getCenterPieces(state, props)
  );
  const allLinen = useSelector((state: ReduxState) => getLinen(state, props));
  const classes = styles(props);

  const { tableConfigTabIndex, handleModifierAssetChange, modifiers } = props;

  return (
    <>
      {tableConfigTabIndex === 0 && (
        <ChairSelectForm
          handleSelectedCatalog={handleModifierAssetChange(
            AssetModifierKeys.chairMod,
            'chairAsset'
          )}
          catalog={allChairs}
          selectedSku={modifiers?.chairMod?.chairAsset?.sku}
        />
      )}
      {tableConfigTabIndex === 1 && ( // NFC why tabPanel isn't doing this properly. tableConfigTabIndex logged correct maybe 1 is truthy?
        <ChairSelectForm
          handleSelectedCatalog={handleModifierAssetChange(
            AssetModifierKeys.centerpieceMod,
            'centerpieceAsset'
          )}
          catalog={allCenterPieces}
          selectedSku={modifiers?.centerpieceMod?.centerpieceAsset?.sku}
        />
      )}
      {tableConfigTabIndex === 2 && (
        <ChairSelectForm
          handleSelectedCatalog={handleModifierAssetChange(
            AssetModifierKeys.placeSettingMod,
            'placeSettingAsset'
          )}
          catalog={allPlaceSettings}
          selectedSku={modifiers?.placeSettingMod?.placeSettingAsset?.sku}
        />
      )}
      {tableConfigTabIndex === 3 && (
        <ChairSelectForm
          handleSelectedCatalog={handleModifierAssetChange(
            AssetModifierKeys.linenMod,
            'linenAsset'
          )}
          catalog={allLinen}
          selectedSku={modifiers?.linenMod?.linenAsset?.sku}
          canDelete
          allowEdit
          defaultSku={props.asset.modifiers.linenMod?.linenDefaultSku}
        />
      )}
    </>
  );
};

export default TabsContent;
