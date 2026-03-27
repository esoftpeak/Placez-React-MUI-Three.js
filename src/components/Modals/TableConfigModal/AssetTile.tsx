import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme, Tooltip, useTheme } from '@mui/material';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Asset } from '../../../blue/items';
import { DeleteCustomAsset } from '../../../reducers/asset';
import CustomAssetDialog from '../../Blue/components/CustomAssetDialog';
import PlacezIconButton from '../../PlacezUIComponents/PlacezIconButton';
import { UniversalModalWrapper } from '../UniversalModalWrapper';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
      width: '100%',
      minWidth: '0px',
      gridTemplateColumns: '1fr',
      rowGap: '2px',
    },
    settings: {
      position: 'absolute',
      cursor: 'pointer',
      right: 0,
      top: 0,
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.secondary.main,
      },
      margin: '3px',
    },
    delete: {
      position: 'absolute',
      cursor: 'pointer',
      right: 0,
      bottom: 0,
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.primary.main,
      },
      margin: '3px',
      zIndex: 10,
      '& .MuiIconButton-root': {
        '&:hover': {
          backgroundColor: theme.palette.secondary.main,
        },
      },
    },
    edit: {
      position: 'absolute',
      cursor: 'pointer',
      right: 0,
      top: 0,
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.primary.main,
      },
      margin: '3px',
      zIndex: 11,
      '& .MuiIconButton-root': {
        '&:hover': {
          backgroundColor: theme.palette.secondary.main,
        },
      },
    },
    item: {
      cursor: 'grab',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      minHeight: '100px',
      overflow: 'hidden',
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      '&:hover': {
        border: `2px solid ${theme.palette.secondary.main}`,
      },
    },
    selectedItem: {
      border: `2px solid ${theme.palette.primary.main}`,
      cursor: 'grab',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      minHeight: '75px',
      overflow: 'hidden',
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    imageContainer: {
      // border: 'solid 2px transparent',
      display: 'flex',
      position: 'relative',
      minWidth: '100%',
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    itemText: {
      maxWidth: '112px',
      fontWeight: 'bold',
      fontSize: 10,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      textAlign: 'center',
      margin: '5px 0px',
    },
    progress: {
      position: 'absolute',
      top: '35px',
      left: '35px',
    },
  })
);

interface Props {
  asset?: Asset;
  onDragAsset?: (event: any, dragType: string, asset: Asset) => void;
  selectedAsset?: Asset;
  onAssetSelect?: (asset) => void;
  configuredAssets?: any;
  canDelete?: boolean;
  allowEdit?: boolean;
  isDefaultAsset?: boolean;
  onResetDefault?: (asset: Asset) => void;
}

const AssetTile = (props: Props) => {
  const classes = styles(props);
  const {
    asset,
    onDragAsset,
    selectedAsset,
    configuredAssets,
    canDelete,
    allowEdit,
    onAssetSelect,
    isDefaultAsset,
  } = props;
  const [selected, setSelected] = useState(selectedAsset);

  const preferConfigruedAssets = (asset) => {
    if (configuredAssets && configuredAssets[asset.id]) {
      return configuredAssets[asset.id];
    }
    return asset;
  };

  const onSelect = (asset) => {
    setSelected(asset);
    onAssetSelect(asset);
  };

  useEffect(() => {
    setSelected(selectedAsset);
  }, [props.selectedAsset]);

  const dispatch = useDispatch();
  const theme = useTheme();

  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onDragAsset) {
      setStartPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (onDragAsset) {
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - startPosition.x, 2) +
          Math.pow(e.clientY - startPosition.y, 2)
      );
      if (moveDistance < 10) {
        // Threshold to consider it a drag or click
        onSelect(asset);
      } else {
        onDragAsset(e, 'stop', asset);
      }
    }
  };

  const handleTouchStart = (e) => {
    if (onDragAsset) {
      const touch = e.touches[0];
      setStartPosition({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e) => {
    if (onDragAsset) {
      const touch = e.changedTouches[0];
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - startPosition.x, 2) +
          Math.pow(touch.clientY - startPosition.y, 2)
      );
      if (moveDistance < 10) {
        // Threshold to consider it a drag or click
        onSelect(asset);
      } else {
        onDragAsset(e, 'stop', preferConfigruedAssets(asset));
      }
    }
  };

  const handleDragEnd = (e) => {
    if (onDragAsset) {
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - startPosition.x, 2) +
          Math.pow(e.clientY - startPosition.y, 2)
      );
      if (moveDistance < 10) {
        // Threshold to consider it a drag or click
        onSelect(asset);
      } else {
        onDragAsset(e, 'stop', preferConfigruedAssets(asset));
      }
    }
  };

  const configured = configuredAssets && configuredAssets?.[asset?.id];

  return (
    asset !== undefined &&
    (!asset?.extensionProperties || !asset.extensionProperties?.hidden) && (
      <div
        className={
          asset.id === selected?.id ? classes.selectedItem : classes.item
        }
        style={{
          backgroundColor: configured
            ? theme.palette.secondary.main
            : theme.palette.background.paper,
        }}
        key={asset.sku}
        draggable={true}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={() => onAssetSelect(asset)}
        onTouchStart={handleTouchStart}
        onDragEnd={handleDragEnd}
        onTouchEnd={handleTouchEnd}
      >
        <Tooltip placement="top" title="Drag and Drop">
          <div
            className={classes.imageContainer}
            style={{
              backgroundImage: `
              url(${import.meta.env.VITE_APP_PLACEZ_API_URL}/${
                configured
                  ? configuredAssets[asset.id].previewPath
                  : asset.previewPath
              })
            `,
            }}
          >
            {(allowEdit || isDefaultAsset) && (
              <CustomAssetDialog asset={asset}>
                <Tooltip title="Customize" placement="right">
                  <PlacezIconButton
                    className={classes.edit}
                    style={{ zIndex: 13 }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <EditOutlined style={{ color: 'inherit' }} />
                  </PlacezIconButton>
                </Tooltip>
              </CustomAssetDialog>
            )}

            {canDelete && !isDefaultAsset && asset?.custom && (
              <UniversalModalWrapper
                onDelete={() => dispatch(DeleteCustomAsset(asset.id))}
                modalHeader="Are you sure?"
              >
              <Tooltip title="Delete Custom Item" placement="left">
                <PlacezIconButton
                  className={classes.delete}
                  style={{
                    color:
                      configuredAssets && configuredAssets[asset.id]
                        ? theme.palette.primary.main
                        : '',
                  }}
                >
                  <DeleteOutlined style={{ color: 'inherit' }} />
                </PlacezIconButton>
              </Tooltip>
                Are you sure you want to delete this item?
              </UniversalModalWrapper>
            )}
          </div>
        </Tooltip>
        <div className={classes.itemText}>{asset.name}</div>
      </div>
    )
  );
};

export default AssetTile;
