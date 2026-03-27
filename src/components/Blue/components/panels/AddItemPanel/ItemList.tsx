import { Theme, createStyles, useTheme, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Asset } from '../../../../../blue/items/asset';
import { Sku } from '../../../../../api';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../../reducers';
import { useEffect, useState } from 'react';
import AssetTile from '../../../../Modals/TableConfigModal/AssetTile'

const gap = '12px';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
      width: '100%',
      minWidth: '0px',
      rowGap: '2px',
      padding: '4px',
    },
    itemList: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: gap,
      padding: gap,
      width: '100%',
      backgroundColor: theme.palette.background.shadow,
    },
  })
);

interface Props {
  skus: Sku[];
  includeCustomSkus?: boolean;
  onSelect?: (asset) => void;
  onDragAsset?: (event: any, dragType: string, asset: Asset) => void;
  cols?: number;
  rowHeight?: number;
  categories?: boolean;
  selectedAsset: Asset;
  onClearSelected?: (asset) => void;
  defaultSku?: string;
  canDelete?: boolean;
}

const ItemList = (props: Props) => {
  const { selectedAsset, defaultSku, canDelete } = props;
  const classes = styles(props);
  const theme: Theme = useTheme();

  const dispatch = useDispatch();

  const configuredAssets = useSelector(
    (state: ReduxState) => state.blue.configuredAssets
  );
  const assetBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const customSkus = useSelector((state: ReduxState) => state.asset.customSkus);

  const { onDragAsset, skus } = props;

  const onSelect = (asset: Asset) => {
    props?.onSelect(
      configuredAssets[asset.id]
        ? { ...configuredAssets[asset.id] }
        : { ...asset }
    );
  };

  type Sku = {
    asset: Asset;
    sku: string;
    sortOrder: number;
  };

  const [combinedSkus, setCombinedSkus] = useState([]);

  const listItems = () => {
    let combinedSkus = [];

    // First map: Assign asset and filter custom SKUs
    const assignedAndFiltered = skus
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((catalogSku: Sku) => {
        if (!('asset' in catalogSku)) {
          (catalogSku as Sku).asset = assetBySku[(catalogSku as Sku).sku];
        }

        let filteredCustomSkus = [];
        if (props.includeCustomSkus) {
          filteredCustomSkus = customSkus.filter((customSku) => {
            return (
              customSku.asset.extensionProperties?.progenitorId ===
              catalogSku.sku
            );
          });
        }

        return {
          catalogSku,
          filteredCustomSkus,
        };
      });
    assignedAndFiltered.forEach(({ catalogSku, filteredCustomSkus }) => {
      combinedSkus.push({ catalogSku, filteredCustomSkus });
    });

    // Second map: Return the appropriate items
    combinedSkus = combinedSkus.flatMap(
      ({ catalogSku, filteredCustomSkus }) => {
        if (filteredCustomSkus.length > 0) {
          return [
            ...filteredCustomSkus.map((customSku) => (
              <AssetTile
                key={customSku.asset.id}
                asset={customSku.asset}
                onDragAsset={onDragAsset}
                selectedAsset={selectedAsset}
                onAssetSelect={onSelect}
                configuredAssets={configuredAssets}
                isDefaultAsset={false}
                canDelete={canDelete}
              />
            )),
            <AssetTile
              key={catalogSku.sku}
              asset={catalogSku.asset}
              onDragAsset={onDragAsset}
              selectedAsset={selectedAsset}
              onAssetSelect={onSelect}
              configuredAssets={configuredAssets}
              isDefaultAsset={catalogSku.sku === defaultSku}
              canDelete={canDelete}
            />,
          ];
        } else {
          return [
            <AssetTile
              asset={catalogSku.asset}
              key={catalogSku.sku}
              onDragAsset={onDragAsset}
              selectedAsset={selectedAsset}
              onAssetSelect={onSelect}
              configuredAssets={configuredAssets}
              isDefaultAsset={catalogSku.sku === defaultSku}
              canDelete={canDelete}
            />,
          ];
        }
      }
    );
    if (props.onClearSelected) {
      combinedSkus.unshift(
        <Button
          key="clear-selected"
          color="primary"
          variant="contained"
          disabled={selectedAsset === undefined}
          onClick={props.onClearSelected}
          style={{ fontSize: '12px' }}
        >
          Clear Selection
        </Button>
      );
    }

    return combinedSkus;
  };

  useEffect(() => {
    setCombinedSkus(listItems());
  }, [skus, assetBySku, customSkus, selectedAsset, defaultSku]);

  //   const formattedListItems = useMemo(() => {
  //   return listItems();
  // }, [skus, assetBySku, customSkus]);

  return (
    <>
      <div className={classes.itemList} style={{gridTemplateColumns: `repeat(${props.cols ?? 4}, 1fr)`, gridAutoRows: `${props.rowHeight}px`}}>
        {combinedSkus}
      </div>
    </>
  );
};

export default ItemList;
