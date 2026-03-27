import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

// Models
import { Asset } from '../../blue/items';
import { Catalog } from '../../models';

// Components
import AssetCard from './AssetCard';
import { ModalConsumer } from '../Modals/ModalContext';
import ModelModal from '../Modals/ModelModal';
import { Sku } from '../../api';
import { ReduxState } from '../../reducers';
import { useSelector } from 'react-redux';
import { Fragment } from 'react';
import { AssetEditMode } from '../../views/Assets/AssetsPreview';

interface Props {
  subcategory?: any;
  assetsBySku: { [key: string]: Asset };
  globalFilter: string;
  showHidden?: boolean;
  selectedCatalog?: Catalog;
  onAssetClick: (asset: Asset) => void;
  assetEditMode: AssetEditMode;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      ...theme.PlacezBorderStyles,
      display: 'flex',
      alignContent: 'start',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto',
      width: '100%',
      padding: '20px 16px',
    },
    categoryHeader: {
      ...theme.typography.h5,
      margin: `0px 0px ${theme.spacing()}px ${theme.spacing(2)}px`,
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.primary.main,
    },
    subCategoryHeader: {
      margin: '0px 8px',
      fontSize: 14,
      fontWeight: 500,
    },
    categoryContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gridAutoRows: '220px',
    },
  })
);

const filterAsset =
  (filter: string, assetsBySku: { [item: string]: Asset }) =>
  (catalogSku: Sku): boolean => {
    const asset = assetsBySku[catalogSku.sku];
    if (!asset) {
      console.log(`${catalogSku.sku} sku not found in assets`);
      return false;
    }
    return (
      asset?.tags.find((tag) => tag.toLowerCase().includes(filter)) !==
        undefined || asset?.name.toLowerCase().includes(filter)
    );
  };

const CatalogDetail = (props: Props) => {
  const customSkus = useSelector((state: ReduxState) => state.asset.customSkus);

  const filterCatalog = (): { [key: string]: Sku } => {
    const { globalFilter, assetsBySku, selectedCatalog } = props;
    const globalFilterLC = globalFilter?.toLowerCase();

    const catalogAssetsFiltered = selectedCatalog.categories
      .reduce((a, b) => a.concat(...b.subCategories), [])
      .reduce((a, b) => a.concat(...b.itemSkus), [])
      .filter(filterAsset(globalFilter, assetsBySku))
      .reduce((a, b: Sku) => {
        a[b.sku] = b;
        return a;
      }, {});

    const customAssetsFiltered = customSkus
      .filter(filterAsset(globalFilterLC, assetsBySku))
      .reduce((a, b: Sku) => {
        a[b.sku] = b;
        return a;
      }, {});

    return { ...catalogAssetsFiltered, ...customAssetsFiltered };
  };

  const classes = styles(props);
  const {
    subcategory,
    assetsBySku,
    globalFilter,
    showHidden,
    onAssetClick,
    assetEditMode,
  } = props;
  if (!subcategory) return <></>;
  if (globalFilter) {
    const searchResult = filterCatalog();
    return (
      <div className={classes.root}>
        <ModalConsumer>
          {({ showModal, props }) => (
            <div>
              <h2 className={classes.categoryHeader}>Search results:</h2>
              <div className={classes.categoryContainer}>
                {Object.keys(searchResult).map((key, index) => {
                  return (
                    <AssetCard
                      key={key}
                      asset={assetsBySku[key]}
                      onShowAR={() =>
                        showModal(ModelModal, {
                          ...props,
                          item: searchResult[key],
                        })
                      }
                      onClick={() => onAssetClick(assetsBySku[key])}
                      assetEditMode={assetEditMode}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </ModalConsumer>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <ModalConsumer>
        {({ showModal, props }) =>
          subcategory?.subCategories?.map((subCategory, j) => (
            <div key={Math.random().toString()}>
              <h3 className={classes.subCategoryHeader}>{subCategory.name}</h3>
              <div className={classes.categoryContainer}>
                {subCategory.itemSkus.map((item, index) => {
                  const filteredCustomSkus = customSkus
                    .filter((customSku) => {
                      return (
                        customSku.asset?.extensionProperties?.progenitorId ===
                        item.sku
                      );
                    })
                    .filter((customSku) => {
                      return (
                        showHidden ||
                        !customSku.asset.extensionProperties ||
                        !customSku.asset?.extensionProperties?.hidden
                      );
                    });
                  const asset = assetsBySku[item.sku];
                  return (
                    <Fragment key={Math.random().toString()}>
                      {filteredCustomSkus.map((customSku) => {
                        const item = { sku: customSku.sku };
                        return (
                          <AssetCard
                            key={`${subCategory.name}-${customSku.sku}`}
                            asset={customSku.asset}
                            onShowAR={() =>
                              showModal(ModelModal, { ...props, item })
                            }
                            onClick={() => onAssetClick(customSku.asset)}
                            assetEditMode={assetEditMode}
                          />
                        );
                      })}
                      {asset &&
                        (showHidden ||
                          !asset.extensionProperties ||
                          (asset.extensionProperties &&
                            !asset.extensionProperties.hidden)) && (
                          <AssetCard
                            key={`${subCategory.name}-${item.sku}`}
                            asset={asset}
                            onShowAR={() =>
                              showModal(ModelModal, { ...props, item })
                            }
                            onClick={() => onAssetClick(asset)}
                            assetEditMode={assetEditMode}
                          />
                        )}
                    </Fragment>
                  );
                })}
              </div>
            </div>
          ))
        }
      </ModalConsumer>
    </div>
  );
};

export default CatalogDetail;
