import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate, useParams } from 'react-router';

import { Theme } from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { Grid, Slider, Button } from '@mui/material';
import { AssetClassType } from '../../blue/items/factory';
import {
  Asset,
  AssetModifierKeys,
  SkuType,
} from '../../blue/items/asset';
import FileSelector from '../../components/Utils/FileSelector';
import { ReduxState } from '../../reducers';
import Jumbotron from '../../components/Jumbotron';
import { TablePreview } from '../../blue/TablePreview';
import EditChairMod from './EditChairMod';
import EditLinenMod from './EditLinenMod ';
import EditUplightMod from '../../components/Blue/components/panels/EditUplightMod';
import EditPlaceSettingMod from './EditPlaceSettingMod';
import EditCenterpieceMod from './EditCenterpieceMod';
import EditArchitectureMod from './EditArchitectureMod';
import { ToastMessage } from '../../reducers/ui'
import { placezApi } from '../../api'

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      width: '100%',
      overflow: 'scroll',
    },
    formContainer: {
      margin: '20px',
    },
    form: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
    },
    column: {
      flex: '1 1 25%',
      padding: '10px',
      width: '100%',
      height: '100%',
      minWidth: 500,
    },
    detailsColumn: {
      marginRight: '20px',
      paddingRight: '20px',
    },
    fieldContainer: {
      padding: '10px',
      lineHeight: '20px',
    },
    field: {
      width: '100%',
      minWidth: '300px',
    },
    imagePreviewContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePreview: {
      width: '500px',
    },
    cameraColumn: {
      display: 'inline-flex',
      flexDirection: 'row',
    },
    actions: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-evenly',
    },
    actionButton: {
      padding: `${theme.spacing()}px ${theme.spacing()}px`,
      margin: theme.spacing(),
      borderRadius: theme.shape.borderRadius,
      width: '150px',
      height: 40,
    },
  })
);

type Props = {};

const EditProductAsset = (props: Props) => {
  const dispatch = useDispatch();
  const classes = styles(props);
  const navigate = useNavigate();
  const { id } = useParams();

  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const userProfile = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );

  const blueElementRef = useRef<HTMLDivElement>();

  const [blueRef, setBlueRef] = useState(undefined);

  // id: string;
  // skuType?: string;
  // previewPath?: string;
  // previewUrl?: string;
  // resourcePath?: string;
  // classType: AssetClassType;
  // species: string;
  // tags: string[];
  // name: string;
  // createdOn: string;
  // modifiedOn: string;
  // transformation: number[];
  // spacing: number;
  // groupId?: number;
  // fromScene?: boolean;
  // gltf?: THREE.Mesh;
  // resizable: boolean;
  // modifiers?: AssetModifiers;
  // description?: string;
  // vendor?: string;
  // vendorSku?: string;
  // extensionProperties: ExtensionProperties;
  // instanceId?: string;
  // showLabel: boolean;
  // labels: Labels;
  // materialMask: PlacezMaterial[];
  // custom?: boolean;
  // children?: THREE.Mesh[];
  // price?: number;
  // priceRateInHours?: number;
  // cost?: number;

  // TODO convert to Asset Object to use generics with hooks
  const [modifiedAsset, setModifiedAsset] = useState<Asset>({
    id: undefined,
    sku: '',
    skuType: undefined,
    species: '',
    name: '',
    tags: [],
    resourcePath: '',
    previewPath: '',
    spacing: 0,
    classType: AssetClassType.FloorItem,
    extensionProperties: {
      enviromentMap: false,
    },
    resizable: false,
    modifiers: {
      chairMod: undefined,
      centerpieceMod: undefined,
      linenMod: undefined,
      placeSettingMod: undefined,
      architectureMod: undefined,
      uplightMod: undefined,
    },
    vendor: '',
    vendorSku: '',
    description: '',
    showLabel: true,
    createdOn: '',
    modifiedOn: '',
    transformation: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    labels: {
      titleLabel: '',
    },
    materialMask: [],
  });

  useEffect(() => {
    if (
      modifiedAsset.modifiers &&
      Object.keys(modifiedAsset.modifiers)?.length > 0
    ) {
      if (
        Object.keys(modifiedAsset.modifiers).every(
          (key) => modifiedAsset.modifiers[key] === undefined
        )
      ) {
        setModifiedAsset({
          ...modifiedAsset,
          modifiers: undefined,
        });
      }
    }
  }, [modifiedAsset]);

  const [stayOnAsset, setStayOnAsset] = useState(false);

  useEffect(() => {
    if (id) {
      placezApi.getMediaAsset(+id).then(response => {
        const asset = response.parsedBody;
        if (asset.extensionProperties === null) {
          asset.extensionProperties = {};
        }

        setModifiedAsset({
          ...asset,
        });

        const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
        const mediaAssetUrl = `${host}/Organization/${userProfile.organization_id}/MediaAssetFile/${asset.sku}`;
        setBlueRef(
          new TablePreview(mediaAssetUrl, asset, blueElementRef.current)
        );
      });
    }
    return function cleanup() {
      if (blueRef) {
        blueRef.dispose();
      }
    };
  }, []);

  const screenCapture = () => {
    blueRef.getBlob((blob) => {
      const formData = new FormData();
      formData.append('file', blob, `${modifiedAsset.sku}.png`);
      placezApi
        .postBlob(formData)
        .then((data) =>
          handleAssetPropChange('preveiwPath', data.parsedBody.path)
        );
    });
  };

  const handleCreate = () => {
    const asset: Asset = {
      ...modifiedAsset,
      modifiedOn: new Date().toString(),
      transformation: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      createdOn: id ? modifiedAsset.createdOn : new Date().toString(),
      modifiers: { ...modifiedAsset.modifiers },
      showLabel: true,
      materialMask: [],
      labels: {
        titleLabel: modifiedAsset.name,
      },
    };

    if (id) {
      placezApi.postMediaAsset(asset).then((response) => {
        alert('update successful');
        if (!stayOnAsset) {
          navigate(-1);
        }
      });
    } else {
      placezApi.postMediaAsset(asset).then((response) => {
        alert('update successful');
        navigate(-1);
      });
    }
  };

  const handleAssetPropChange = (prop, value) => {
    setModifiedAsset({
      ...modifiedAsset,
      [prop]: value,
    });
  };

  const handleAssetModifierChange =
    (modifier: AssetModifierKeys) => (prop, value) => {
      setModifiedAsset({
        ...modifiedAsset,
        modifiers: {
          ...modifiedAsset.modifiers,
          [prop]: value,
        },
      });
    };

  const handleAssetModifierPropChange =
    (modifier: AssetModifierKeys) => (prop, value) => {
      setModifiedAsset({
        ...modifiedAsset,
        modifiers: {
          ...modifiedAsset.modifiers,
          [modifier]: {
            ...modifiedAsset.modifiers[modifier],
            [prop]: value,
          },
        },
      });
    };

  const handleExtensionChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    setModifiedAsset({
      ...modifiedAsset,
      extensionProperties: {
        ...modifiedAsset.extensionProperties,
        [name]: value,
      },
    });
  };

  const handleGLTFSubmit = (files: FileList) => {
    const formData = new FormData();
    formData.append('file', files[0], files[0].name);

    dispatch(ToastMessage('Uploading File'));
    placezApi.postBlob(formData).then((data) => {
      dispatch(ToastMessage('Upload Complete'));
      setModifiedAsset({
        ...modifiedAsset,
        resourcePath: data.parsedBody.path,
      });
    });
  };

  const handleCancel = (e) => {
    navigate(-1);
  };

  const handleDelete = (e) => {
    placezApi.deleteMediaAsset(modifiedAsset.id).then((data) => {
      navigate(-1);
    });
  };

  const color = '#9e9e9e'; // Future capability to override color

  return (
    <div className={classes.root}>
      <Jumbotron title="Edit Product Details" />
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <div className={classes.column}>
            <div className={classes.detailsColumn}>
              <Grid
                style={{
                  display: 'grid',
                  gridTemplateColumns: '125px 250px',
                }}
              >
                <Grid item xs={3}>
                  Stay On Asset
                </Grid>
                <Grid item xs={9}>
                  <input
                    type="checkbox"
                    name="stayOnAsset"
                    checked={stayOnAsset}
                    onChange={(e) => setStayOnAsset(e.target.checked)}
                  />
                </Grid>
                <Grid item xs={3}>
                  ID
                </Grid>
                <Grid item xs={9}>
                  {modifiedAsset.sku}
                </Grid>
                {!id && (
                  <Grid item xs={3}>
                    SKU Type
                  </Grid>
                )}
                {!id && (
                  <Grid item xs={9}>
                    <select
                      name="skuType"
                      value={modifiedAsset.skuType}
                      onChange={(e) =>
                        handleAssetPropChange('skuType', e.target.value)
                      }
                    >
                      {Object.entries(SkuType).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </Grid>
                )}
                <Grid item xs={3}>
                  Item Type
                </Grid>
                <Grid item xs={9}>
                  <select
                    name="classType"
                    value={modifiedAsset.classType}
                    onChange={(e) =>
                      handleAssetPropChange('classType', e.target.value)
                    }
                  >
                    <option value={AssetClassType.OnFloorItem}>
                      OnFloorItem (Rugs)
                    </option>
                    <option value={AssetClassType.FloorItem}>FloorItem</option>
                    <option value={AssetClassType.InWallFloorItem}>
                      InWallFloorItem (Doors)
                    </option>
                    <option value={AssetClassType.InWallItem}>
                      InWallItem (Windows)
                    </option>
                    <option value={AssetClassType.WallItem}>
                      WallItem (Paintings, lightFixtures, drapes, ...)
                    </option>
                    <option value={AssetClassType.WallFloorItem}>
                      WallFloorItem (Barn Doors, lower cabinets, fireplaces,
                      ...)
                    </option>
                    <option value={AssetClassType.CeilingItem}>
                      CeilingItem (chandelier, fans, lights, ...)
                    </option>
                  </select>
                </Grid>
                <Grid item xs={3}>
                  Name
                </Grid>
                <Grid item xs={9}>
                  <input
                    name="name"
                    type="text"
                    className={classes.field}
                    value={modifiedAsset.name}
                    onChange={(e) =>
                      handleAssetPropChange('name', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  Tags
                </Grid>
                <Grid item xs={9}>
                  <input
                    name="tags"
                    type="text"
                    className={classes.field}
                    value={modifiedAsset.tags.toString()}
                    onChange={(e) =>
                      handleAssetPropChange('tags', e.target.value.split(','))
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  Vendor
                </Grid>
                <Grid item xs={9}>
                  <input
                    name="vendor"
                    type="text"
                    className={classes.field}
                    value={modifiedAsset.vendor}
                    onChange={(e) =>
                      handleAssetPropChange('vendor', e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  Vendor SKU
                </Grid>
                <Grid item xs={9}>
                  <input
                    name="vendorSku"
                    type="text"
                    className={classes.field}
                    value={modifiedAsset.vendorSku}
                    onChange={(e) =>
                      handleAssetPropChange('vendorSku', e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  Description
                </Grid>
                <Grid item xs={9}>
                  <input
                    name="description"
                    type="text"
                    className={classes.field}
                    value={modifiedAsset.description}
                    onChange={(e) =>
                      handleAssetPropChange('description', e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  Environment Map
                </Grid>
                <Grid item xs={9}>
                  <input
                    type="checkbox"
                    name="enviromentMap"
                    checked={modifiedAsset.extensionProperties.enviromentMap}
                    onChange={handleExtensionChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  Resizable
                </Grid>
                <Grid item xs={9}>
                  <input
                    type="checkbox"
                    name="resizable"
                    checked={modifiedAsset.resizable}
                    onChange={(e) =>
                      handleAssetPropChange('resizable', e.target.checked)
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  Spacing
                </Grid>
                <Grid item xs={9}>
                  <Slider
                    value={modifiedAsset.spacing}
                    step={1}
                    min={0}
                    max={72}
                    valueLabelDisplay="auto"
                    onChange={(e, v) => handleAssetPropChange('spacing', v)}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={3}>
                  Modifiers
                </Grid>
                <div className={classes.tabPanel}>
                  <EditChairMod
                    modifier={AssetModifierKeys.chairMod}
                    params={modifiedAsset?.modifiers}
                    onModifierChange={handleAssetModifierChange(
                      AssetModifierKeys.chairMod
                    )}
                    nullable
                  />
                  <EditLinenMod
                    modifier={AssetModifierKeys.linenMod}
                    params={modifiedAsset?.modifiers}
                    onModifierChange={handleAssetModifierChange(
                      AssetModifierKeys.linenMod
                    )}
                    nullable
                  />
                  <EditPlaceSettingMod
                    modifier={AssetModifierKeys.placeSettingMod}
                    params={modifiedAsset?.modifiers}
                    onModifierChange={handleAssetModifierChange(
                      AssetModifierKeys.placeSettingMod
                    )}
                    nullable
                  />
                  <EditCenterpieceMod
                    modifier={AssetModifierKeys.centerpieceMod}
                    params={modifiedAsset?.modifiers}
                    onModifierChange={handleAssetModifierChange(
                      AssetModifierKeys.centerpieceMod
                    )}
                    nullable
                  />
                  <EditArchitectureMod
                    modifier={AssetModifierKeys.architectureMod}
                    params={modifiedAsset?.modifiers}
                    onModifierChange={handleAssetModifierChange(
                      AssetModifierKeys.architectureMod
                    )}
                    nullable
                  />
                  <EditUplightMod
                    modifier={AssetModifierKeys.uplightMod}
                    params={modifiedAsset?.modifiers}
                    onModifierChange={handleAssetModifierChange(
                      AssetModifierKeys.uplightMod
                    )}
                    nullable
                  />
                </div>

                <Grid item xs={3}>
                  GLB
                </Grid>
                <Grid item xs={9}>
                  <div>
                    <FileSelector
                      customID="loadGLTF"
                      handleFileSubmit={handleGLTFSubmit}
                      accept=".glb,.gltf"
                    />
                  </div>
                </Grid>
                <Grid item xs={3}></Grid>
                <Grid item xs={9}>
                  <input
                    name="scale"
                    type="text"
                    className={classes.field}
                    value={`${import.meta.env.VITE_APP_PLACEZ_API_URL}/Organization/${userProfile.organization_id}/MediaAssetFile/${modifiedAsset.sku}`}
                  />
                </Grid>
              </Grid>
              <div className={classes.actions}>
                <Button
                  onClick={handleCreate}
                  className={classes.actionButton}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  className={classes.actionButton}
                  variant="contained"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className={classes.actionButton}
                  variant="contained"
                  color="secondary"
                >
                  Delete
                </Button>
              </div>
              <div className={classes.column}>
                <div className={classes.imagePreviewContainer}>
                  <img
                    className={classes.imagePreview}
                    src={`${import.meta.env.VITE_APP_PLACEZ_API_URL}/${modifiedAsset.previewPath}`}
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={classes.column}>
            <div className={classes.detailsColumn}>
              <div className={classes.cameraColumn}>
                <div
                  id="contentViewer"
                  ref={blueElementRef}
                  style={{
                    background: `radial-gradient(#ffffff, ${color})`,
                    width: '600px',
                    height: '400px',
                  }}
                />
                <button onClick={screenCapture}>Take Picture</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductAsset;
