import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import findInSearchableFeilds from '../../../sharing/utils/findInSearchableFeilds';
import { Clear, Search } from '@mui/icons-material';

import { Theme, Tooltip } from '@mui/material';

import { createStyles } from '@mui/styles';

import { Asset } from '../../../blue/items';
import { Input, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ItemList from '../../Blue/components/panels/AddItemPanel/ItemList';
import CustomAssetDialog from '../../Blue/components/CustomAssetDialog';
import { UniversalModalWrapper } from '../UniversalModalWrapper';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { AreYouSureDelete } from '../UniversalModal';
import { DeleteCustomAsset } from '../../../reducers/asset';

const gap = '6px';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    title: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(2),
      fontSize: '40px',
      textAlign: 'center',
    },
    heading: {
      ...theme.typography.h2,
      marginTop: theme.spacing(2),
      fontSize: '20px',
      height: '40px',
      backgroundColor: theme.palette.secondary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0px ${theme.spacing(3)}px`,
    },
    content: {
      paddingRight: 16,
      paddingLeft: 16,
    },
    field: {
      minWidth: '40%',
      margin: '10px 24px',
    },
    button: {
      padding: '4px 30px',
      borderRadius: '8px',
      width: '150px',
      height: '180px',
      margin: '8px',
      marginTop: '0px',
      marginBottom: '16px',
    },
    actions: {
      borderTop: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.palette.secondary.main,
    },
    container: {
      padding: theme.spacing(),
      textAlign: 'center',
    },
    imageDetails: {
      display: 'flex',
      justifyContent: 'flex-start',
    },
    logo: {},
    leftColumn: {
      flexDirection: 'column',
      width: '50%',
      padding: theme.spacing(),
    },
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputField: {
      marginBottom: '0px',
    },
    inputCheckField: {
      marginBottom: '-15px',
    },
    cardContainer: {
      // display: 'flex',
      // alignContent: 'start',
      // flexDirection: 'row',
      // flexWrap: 'wrap',
      // justifyContent: 'space-around',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridAutoRows: '112px',
      gap: gap,
      padding: gap,
      width: '100%',
      backgroundColor: theme.palette.background.shadow,
    },
    cardContainerAfter: {
      flex: 'auto',
    },
  })
);
interface Props {
  handleSelectedCatalog: Function;
  catalog: any[];
  selectedSku: string;
  allowEdit?: boolean;
  canDelete?: boolean;
  defaultSku?: string;
}

const ChairSelectForm = (props: Props) => {
  const [assetFilter, setAssetFilter] = useState('');

  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);

  const {
    catalog,
    selectedSku,
    handleSelectedCatalog,
    allowEdit,
    canDelete,
    defaultSku,
  } = props;

  const getAsset = (catalogItem): Asset => {
    const asset = assetsBySku[catalogItem.sku];
    if (!asset) {
      console.warn('SKU from catalog not found in Asset Collection');
    }
    return asset;
  };

  const formatCatalog = (catalog: { sku: string }[]): Asset[] => {
    return catalog
      .map((catalogItem) => getAsset(catalogItem))
      .filter(
        (asset: Asset) =>
          asset &&
          asset.extensionProperties &&
          !asset.extensionProperties.hidden
      )
      .filter((asset: Asset) => findInSearchableFeilds(asset, assetFilter));
  };

  const assets = useRef<Asset[]>(formatCatalog(props.catalog));

  useEffect(() => {
    const catalogItem = catalog.find((catalogItem) => {
      return catalogItem.sku === selectedSku;
    });
    if (catalogItem !== undefined) {
      const asset = getAsset(catalogItem);
      if (asset) {
        handleSelectedCatalog(getAsset(catalogItem));
      } else {
        handleSelectedCatalog(undefined);
      }
    }
    assets.current = formatCatalog(props.catalog);
  }, [assetsBySku, catalog]);

  const classes = styles(props);
  const dispatch = useDispatch();

  const selectedAsset = assets.current.find(
    (asset) => selectedSku === asset.id
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        flex: 1,
      }}
    >
      <Input
        placeholder="Search Library"
        id="adornment-password"
        value={assetFilter}
        onChange={(e) => {
          setAssetFilter(e.target.value);
        }}
        style={{ margin: '10px 20px', alignSelf: 'stretch' }}
        endAdornment={
          <>
            {assetFilter !== '' && (
              <IconButton
                onClick={(event) => {
                  setAssetFilter('');
                }}
              >
                <Clear />
              </IconButton>
            )}
            {assetFilter === '' && (
              <IconButton>
                <Search />
              </IconButton>
            )}
          </>
        }
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          alignItems: 'center',
        }}
      >
        <ItemList
          skus={catalog}
          selectedAsset={assets.current.find(
            (asset) => selectedSku === asset.id
          )}
          onSelect={(asset) => handleSelectedCatalog(asset)}
          onClearSelected={(asset) => handleSelectedCatalog(undefined)}
          cols={3}
          rowHeight={112}
          defaultSku={defaultSku}
          canDelete={canDelete}
        />
      </div>
      <div
        className={classes.panelFooter}
        style={{ display: 'grid', gap: '10px', margin: '10px' }}
      >
        {allowEdit && selectedAsset && (
          <CustomAssetDialog
            asset={assets.current.find((asset) => selectedSku === asset.id)}
          >
            <Tooltip title="Customize" placement="right">
              <PlacezActionButton>EditAsset</PlacezActionButton>
            </Tooltip>
          </CustomAssetDialog>
        )}
        {selectedAsset && (
          <UniversalModalWrapper
            onDelete={() =>
              dispatch(
                DeleteCustomAsset(
                  assets.current.find((asset) => selectedSku === asset.id).id
                )
              )
            }
            modalHeader="Are you sure?"
          >
            <Tooltip title="Delete Custom Item">
              <PlacezActionButton>Delete Custom</PlacezActionButton>
            </Tooltip>
            {AreYouSureDelete('a Custom Item')}
          </UniversalModalWrapper>
        )}
      </div>
    </div>
  );
};

export default ChairSelectForm;
