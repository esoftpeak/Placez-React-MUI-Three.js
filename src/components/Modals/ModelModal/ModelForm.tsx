import React, { useEffect } from 'react';
import { WithModalContext } from '../withModalContext';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import { Asset } from '../../../blue/items/asset';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { DialogActions, DialogContent } from '@mui/material';
import { Sku } from '../../../api/';
import ModelViewer from '../../Google/ModelViewer';
import { AssetClassType } from '../../../blue/items/factory';
import { ItemPreview } from '../../../blue/ItemPreview';
import { Utils } from '../../../blue/core/utils';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { Object3D } from 'three'

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    viewer: {
      display: 'flex',
      width: '600',
      height: '420',
      maxWidth: '100%',
      padding: '0px !important',
    },
    button: {
      padding: '4px 30px',
      borderRadius: theme.shape.borderRadius,
      width: '120px',
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
  })
);

interface Props extends WithModalContext {
  item: Sku;
}

const ModelForm = (props: Props) => {
  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const userProfile = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );

  const [asset, setAsset] = React.useState<Asset>(undefined);
  const [gltfUrl, setGLTFUrl] = React.useState<string>(undefined);
  const [modifiedAsset, setModifiedAsset] = React.useState<Asset>({
    id: 0,
    name: '',
    modifiedOn: '',
    sku: '',
    spacing: 0,
    tags: [],
    species: '',
    previewPath: '',
    transformation: [],
    classType: AssetClassType.FloorItem,
    createdOn: '',
    resizable: false,
    showLabel: true,
    labels: {
      titleLabel: '',
    },
    extensionProperties: {},
    materialMask: undefined,
  });

  useEffect(() => {
    const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
    const mediaAssetUrl = `${host}/Organization/${userProfile.organization_id}/MediaAssetFile/${modifiedAsset.sku}`;
    if (asset?.materialMask) {
      new ItemPreview(mediaAssetUrl, asset, undefined, getGLTFForModelView);
    }
  }, [asset]);

  useEffect(() => {
    const asset = assetsBySku[props.item.sku];
    setAsset(asset);
    setModifiedAsset(asset);
    setGLTFUrl(Utils.buildPath(asset.resourcePath));
  }, []);

  const getGLTFForModelView = (item: Object3D) => () => {
    Utils.exportGLB(item, (blob) => {
      setGLTFUrl(`data:application/octet-stream;base64,${blob}`);
    });
  };

  const { hideModal } = props.modalContext;
  const classes = styles(props);
  return (
    <>
      <DialogContent className={classes.viewer}>
        <ModelViewer modelUrl={gltfUrl} />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <PlacezActionButton onClick={hideModal}>Close</PlacezActionButton>
      </DialogActions>
    </>
  );
};

export default ModelForm;
