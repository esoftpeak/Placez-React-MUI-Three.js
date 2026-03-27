import { Asset } from '../../../../../blue/items';
import { Theme, Typography, createStyles, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../../../reducers';
import { makeStyles } from '@mui/styles';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
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
        color: theme.palette.secondary.main,
      },
      margin: '3px',
    },
    item: {
      cursor: 'grab',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      overflow: 'hidden',
      minHeight: '116px',
      width: '100%',
    },
    selectedImageContainer: {
      border: `solid 3px ${theme.palette.primary.main}`,
      display: 'flex',
      position: 'relative',
      width: '112px',
      height: '112px',
      maxWidth: '112px',
      maxHeight: '112px',
      borderRadius: '8px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderColor: theme.palette.primary.main,
      borderStyle: 'solid',
    },
    imageContainer: {
      // border: 'solid 2px transparent',
      display: 'flex',
      position: 'relative',
      minWidth: '100%',
      widht: '100%',
      minHeight: '112px',
      maxHeight: '112px',
      borderRadius: '8px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      '&:hover': {
        borderColor: theme.palette.secondary.main,
        borderStyle: 'solid',
      },
    },
    itemText: {
      maxWidth: '112px',
      marginTop: 4,
      fontWeight: 'bold',
      fontSize: 12,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      textAlign: 'center',
    },
    progress: {
      position: 'absolute',
      top: '35px',
      left: '35px',
    },
  })
);

interface Props {
  catalogSku: any;
  onDragAsset?: (event: any, dragType: string, asset: Asset) => void;
  selectedAsset?: Asset;
  onSelect?: (asset) => void;
}

const ListItem = (props: Props) => {
  const {
    catalogSku,
    onDragAsset,
    selectedAsset,
    onSelect,
  } = props;
  const classes = styles(props);
  const theme = useTheme();
  const dispatch = useDispatch();
  const configuredAssets = useSelector(
    (state: ReduxState) => state.blue.configuredAssets
  );

  return (
    catalogSku.asset !== undefined &&
    (!catalogSku.asset?.extensionProperties ||
      !catalogSku.asset.extensionProperties?.hidden) && (
      <div
        className={classes.item}
        key={catalogSku.sku}
        draggable={true}
        onMouseDown={
          onDragAsset
            ? (e: any) => {
                onSelect(catalogSku.asset);
              }
            : () => {}
        }
        onDragEnd={
          onDragAsset
            ? (e: any) => onDragAsset(e, 'stop', selectedAsset)
            : () => {}
        }
        onTouchStart={
          onDragAsset
            ? (e: any) => {
                onSelect(catalogSku.asset);
              }
            : () => {}
        }
        onTouchEnd={
          onDragAsset
            ? (e: any) => onDragAsset(e, 'stop', selectedAsset)
            : () => {}
        }
        onClick={() => onSelect(catalogSku.asset)}
      >
        <div
          className={
            catalogSku.asset.id === selectedAsset?.id
              ? classes.selectedImageContainer
              : classes.imageContainer
          }
          style={{
            // backgroundImage: `url(${import.meta.env.VITE_APP_PLACEZ_API_URL}/${configuredAssets && configuredAssets[catalogSku.asset.id] ? configuredAssets[catalogSku.asset.id].previewPath : catalogSku.asset.previewPath}), radial-gradient(${theme.palette.background.paper}, ${theme.palette.background.default})`,
            backgroundImage: `url(${import.meta.env.VITE_APP_PLACEZ_API_URL}/${
              configuredAssets && configuredAssets[catalogSku.asset.id]
                ? configuredAssets[catalogSku.asset.id].previewPath
                : catalogSku.asset.previewPath
            })`,
          }}
        >
        </div>
        <Typography className={classes.itemText}>
          {catalogSku.asset.name}
        </Typography>
      </div>
    )
  );
};

export default ListItem;
