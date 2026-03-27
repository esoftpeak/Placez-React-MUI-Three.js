import { useState } from 'react';

import { Theme, useTheme } from '@mui/material';

import { createStyles } from '@mui/styles';

import { CardMedia, CardContent, Typography, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';

// Model
import { Asset } from '../../blue/items';
import CustomAssetDialog from '../Blue/components/CustomAssetDialog';
import {
  Delete,
  EditOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Utils } from '../../blue/core/utils';
import { AssetEditMode } from '../../views/Assets/AssetsPreview';
import { OpenARIcon } from '../../assets/icons';
import PlacezIconButton from '../PlacezUIComponents/PlacezIconButton';

interface Props {
  asset: Asset;
  onClick: () => void;
  disableSave?: boolean;
  assetEditMode?: AssetEditMode;
  onShowAR?: () => void;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(),
      cursor: 'pointer',
    },
    paper: {
      ...theme.PlacezBorderStyles,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    image: {
      flex: 1,
      height: '100%',
    },
    label: {
      padding: '5px !important',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
    },
    name: {
      ...theme.typography.body2,
      padding: '0px',
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
    overlayContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'end',
      height: '100%',
    },
    options: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDiv: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: 'white',
    },
    customGradient: {
      flex: 1,
      // background: `radial-gradient(${theme.palette.background.default}, ${theme.palette.primary.main} 160%)`,
      background: `radial-gradient(${theme.palette.background.default}, ${theme.palette.grey[500]} 160%)`,
    },
    normalGradient: {
      flex: 1,
      background: `radial-gradient(${theme.palette.background.default}, ${theme.palette.grey[500]} 160%)`,
    },
  })
);

const AssetCard = (props: Props) => {
  const [editMode, setEditMode] = useState(false);

  const handleEditMode = (e) => {
    e.stopPropagation();
    setEditMode(!editMode);
  };

  const onClickIcon = (e) => {
    e.stopPropagation();
    props.onClick();
  };

  const classes = styles(props);

  const { asset, disableSave, assetEditMode, onShowAR } = props;
  const visible = !asset?.extensionProperties?.hidden;

  const theme: Theme = useTheme();

  const fontSize = 32;
  return (
    <div className={classes.root}>
      {asset && (visible || assetEditMode === AssetEditMode.ShowHide) ? (
        <div className={classes.paper}>
          <div
            className={
              asset.custom ? classes.customGradient : classes.normalGradient
            }
          >
            <CardMedia
              className={classes.image}
              image={Utils.buildPath(asset ? asset.previewPath : '')}
              title="image"
              onClick={handleEditMode}
            >
              <div className={classes.overlayContainer}>
                {assetEditMode === AssetEditMode.Delete && asset.custom && (
                  <PlacezIconButton onClick={onClickIcon}>
                    <Delete
                      sx={{
                        fontSize,
                        color: 'rgba(255, 0, 0, 1.0)',
                      }}
                    />
                  </PlacezIconButton>
                )}
                {assetEditMode === AssetEditMode.ShowHide &&
                  asset.extensionProperties?.hidden && (
                    <PlacezIconButton onClick={onClickIcon}>
                      <VisibilityOff
                        sx={{
                          fontSize,
                        }}
                      />
                    </PlacezIconButton>
                  )}
                {assetEditMode === AssetEditMode.ShowHide &&
                  !asset.extensionProperties?.hidden && (
                    <PlacezIconButton onClick={onClickIcon}>
                      <Visibility
                        sx={{
                          fontSize,
                          color: theme.palette.primary.main,
                        }}
                      />
                    </PlacezIconButton>
                  )}
                <div className={classes.options}>
                  {assetEditMode === AssetEditMode.Normal && editMode && (
                    <div className={classes.buttonDiv}>
                      <Tooltip title="Show" placement="right">
                        <PlacezIconButton color="primary" onClick={onShowAR}>
                          <OpenARIcon />
                        </PlacezIconButton>
                      </Tooltip>
                      <CustomAssetDialog
                        asset={asset}
                        disableSave={disableSave}
                      >
                        <Tooltip title="Customize" placement="right">
                          <PlacezIconButton>
                            <EditOutlined />
                          </PlacezIconButton>
                        </Tooltip>
                      </CustomAssetDialog>
                    </div>
                  )}
                </div>
              </div>
            </CardMedia>
          </div>
          <CardContent className={classes.label}>
            <Typography className={classes.name} noWrap color="inherit">
              {asset.name}
            </Typography>
          </CardContent>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default AssetCard;
