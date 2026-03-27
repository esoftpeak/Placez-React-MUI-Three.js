import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';

import { Theme, useTheme } from '@mui/material';

import { createStyles } from '@mui/styles';

// Components
import { CircularProgress, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CatalogDetail from '../../components/AssetCatalog/CatalogDetail';

// Models
import { Delete, VisibilityOff } from '@mui/icons-material';
import CatalogSelect from '../../components/AssetCatalog/CatalogSelect';
import SubcategoryList from '../../components/AssetCatalog/SubcategoryList';
import { Asset } from '../../blue/items';
import { DeleteCustomAsset, SaveCustomAsset } from '../../reducers/asset';
import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      padding: '0px 80px',
      paddingBottom: '0px',
      display: 'grid',
      height: '100%',
      overflow: 'hidden',
      gridTemplateColumns: '400px auto',
    },
    list: {
      height: '100%',
      paddingRight: theme.spacing(),
      overflow: 'hidden',
    },
    detail: {
      height: '100%',
      paddingLeft: theme.spacing(),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    listHeading: {
      ...theme.typography.h6,
      margin: 0,
      paddingLeft: theme.spacing(),
    },
    detailHeading: {
      ...theme.typography.h6,
      margin: 0,
      paddingLeft: theme.spacing(),
    },
    sortFilter: {
      display: 'flex',
      flexDirection: 'column',
      width: '70%',
    },
    settingLabel: {
      flex: 1,
    },
    setting: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '5px',
    },
    noAssets: {
      padding: theme.spacing(),
    },
    button: {
      minHeight: '80px !important',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
  })
);

export enum AssetEditMode {
  Normal,
  Delete,
  ShowHide,
}

interface Props {}

const AssetsPreview = (props: Props) => {
  const classes = styles(props);
  const dispatch = useDispatch();
  const theme = useTheme();

  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [showHidden, setShowHidden] = useState(false);

  const catalogsById = useSelector(
    (state: ReduxState) => state.asset.catalogsById
  );
  const catalogsLoading = useSelector(
    (state: ReduxState) => state.asset.catalogsLoading
  );
  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const assetsLoading = useSelector(
    (state: ReduxState) => state.asset.assetsLoading
  );
  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const [editMode, setEditMode] = useState(AssetEditMode.Normal);

  useEffect(() => {
    selectDefaultCatalog();
    if (selectedCatalog) {
      setSelectedSubcategory(selectedCatalog.categories[0].name);
    }
  }, [catalogsById, selectedCatalog]);

  const selectDefaultCatalog = () => {
    if (!assetsLoading && !catalogsLoading && !selectedCatalog) {
      const catalogIds = Object.values(catalogsById);
      if (catalogIds.length > 0) {
        selectCatalog(
          catalogIds.find((catalog) => catalog.name === 'Banquet Library').id
        );
      }
    }
  };

  const selectCatalog = (catalogId) => {
    setSelectedCatalog(catalogsById[catalogId]);
  };

  const onAssetClick = (asset: Asset) => {
    switch (editMode) {
      case AssetEditMode.Delete:
        dispatch(DeleteCustomAsset(asset.id));
        break;
      case AssetEditMode.ShowHide:
        const customAsset = {
          ...asset,
          extensionProperties: {
            ...asset.extensionProperties,
            hidden: !asset.extensionProperties.hidden,
          },
        };
        dispatch(SaveCustomAsset(customAsset));
        break;
      default:
        break;
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.list}>
        <div style={{ display: 'flex', alignItems: 'center', height: '80px' }}>
          {catalogsLoading ? (
            <CircularProgress color="primary" />
          ) : (
            <CatalogSelect
              selectedId={selectedCatalog?.id ?? 3}
              onCardClick={selectCatalog}
              catalogsById={catalogsById}
            />
          )}
        </div>
        {!globalFilter && (
          <SubcategoryList
            subcategories={selectedCatalog?.categories ?? []}
            selectedSubcategory={selectedSubcategory}
            handleSelect={(subcategory) => setSelectedSubcategory(subcategory)}
          />
        )}
      </div>
      <div className={classes.detail}>
        <div className={classes.button}>
          <Tooltip title="Show Hide">
            <PlacezIconButton
              sx={{
                color:
                  editMode === AssetEditMode.ShowHide
                    ? theme.palette.primary.main
                    : '',
              }}
              onClick={() =>
                editMode !== AssetEditMode.ShowHide
                  ? setEditMode(AssetEditMode.ShowHide)
                  : setEditMode(AssetEditMode.Normal)
              }
            >
              <VisibilityOff />
            </PlacezIconButton>
          </Tooltip>
          <Tooltip title="Delete Mode">
            <PlacezIconButton
              sx={{
                color:
                  editMode === AssetEditMode.Delete
                    ? theme.palette.primary.main
                    : '',
              }}
              onClick={() =>
                editMode !== AssetEditMode.Delete
                  ? setEditMode(AssetEditMode.Delete)
                  : setEditMode(AssetEditMode.Normal)
              }
            >
              <Delete fontSize="small" />
            </PlacezIconButton>
          </Tooltip>
        </div>
        {assetsLoading && catalogsLoading && !selectedCatalog ? (
          <CircularProgress color="primary" />
        ) : selectedCatalog && selectedCatalog.assetCount <= 0 ? (
          <Typography variant="body1" className={classes.noAssets}>
            No Assets
          </Typography>
        ) : (
          <CatalogDetail
            subcategory={selectedCatalog?.categories?.find(
              (category) => category.name === selectedSubcategory
            )}
            assetsBySku={assetsBySku}
            globalFilter={globalFilter}
            showHidden={editMode === AssetEditMode.ShowHide}
            selectedCatalog={selectedCatalog}
            assetEditMode={editMode}
            onAssetClick={onAssetClick}
          />
        )}
      </div>
    </div>
  );
};

export default AssetsPreview;
