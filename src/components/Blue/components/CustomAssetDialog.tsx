import { Asset } from '../../../blue/items/asset';
import {
  DefaultMaterial,
  PlacezMaterial,
} from '../../../api/placez/models/PlacezMaterial';
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ItemPreview } from '../../../blue/ItemPreview';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import { Utils } from '../../../blue/core/utils';
import MaterialPanel from './MaterialPanel';
import ItemInfoPanel from './ItemInfoPanel';
import { SaveCustomAsset } from '../../../reducers/asset';
import produce from 'immer';
import {
  cloneElement,
  createRef,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import EditSize from './utility/EditSize';
import { Matrix4, Vector3 } from 'three';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import AssetModifierHelper from '../../../blue/itemModifiers/AssetModifierHelper';
import ColorPanel from './ColorPanel';
import ActiveMaterial from './ActiveMaterial';
import { getOrgTheme } from '../../../api/placez/models/UserSetting';

const localStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    paper: {
      ...theme.PlacezBorderStyles,
      '& .MuiDialog-paper': {
        ...theme.PlacezBorderStyles,
        maxWidth: '555px',
        width: '100%',
      },
    },
    root: {
      margin: 0,
      padding: '0 !important',
      overflowX: 'hidden',
    },
    dialogTitle: {
      background: `${theme.palette.primary.main}33`,
      padding: '8px 16px !important',
      color: theme.palette.text.primary,
      textAlign: 'center',
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
    },
    viewer: {
      width: '100%',
      height: '250px',
      cursor: 'pointer',
      backgroundImage: 'radial-gradient(#f5f5f5, #909090)',
    },
    tabsContainer: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    tabs: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      borderTop: `1px solid ${theme.palette.divider}`,
      '& .MuiTabs-indicator': {
        display: 'none', // Hide indicator line completely
      },
    },
    tabContent: {
      height: '278px',
      overflow: 'hidden',
    },
    tabLabel: {
      minWidth: 'auto',
      padding: theme.spacing(1, 2),
      color: theme.palette.text.secondary,
      borderRadius: '4px 4px 0 0',
      transition: 'background-color 0.3s ease',
      margin: '0 1px',
      fontWight: 500,
      '&.MuiButtonBase-root.MuiTab-root': {
        backgroundColor: '#e9e8e8',
        color: theme.palette.text.secondary,
        transition: 'background-color 0.3s ease',
        textTransform: 'none',
      },
      '&.MuiButtonBase-root.MuiTab-root.Mui-selected': {
        backgroundColor: '#ffffff',
        color: theme.palette.primary.main,
        textTransform: 'none',
      },
    },
    button: {
      margin: '5px',
      cursor: 'pointer',
      '&:hover': {
        color: theme.palette.secondary.main,
      },
    },
    saveButton: {
      width: '160px',
      backgroundColor: `${getOrgTheme().primaryColor}`,
      color: 'white',
    },
  })
);

interface Props {
  asset: Asset;
  onSaveAsset?(asset: Asset): void;
  disableSave?: boolean;
}

const CustomAssetDialog = (props: PropsWithChildren<Props>) => {
  const { asset, disableSave } = props;
  const localClasses = localStyles(props);
  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = {
    ...styles(props),
    ...localClasses,
  };
  const blueElementRef = createRef<HTMLDivElement>();
  const blueRef = useRef<any>(null);

  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [materialsBak, setMaterialsBak] = useState([]);
  const [customAsset, setCustomAsset] = useState(undefined);
  const selectMaterial = customAsset?.materialMask?.[0]
    ? customAsset.materialMask[0]
    : DefaultMaterial;
  const [actualDimensions, setActualDimensions] = useState({
    width: 0,
    height: 0,
    depth: 0,
  });
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState<number>(0);
  const [selectedMaterial, setSelectedMaterial] =
    useState<PlacezMaterial>(selectMaterial);
  const userProfile = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );

  const handleOpen = (e) => {
    e.stopPropagation();
    setOpen(true);
    setCustomAsset(produce(props.asset, (draft) => draft));
  };

  useEffect(() => {
    setCustomAsset(produce(props.asset, (draft) => draft));
  }, []);

  const saveAs = (newSave: boolean) => () => {
    const { onSaveAsset } = props;

    blueRef?.current?.takePic((previewPath: string) => {
      let transformation = null;
      let sku = customAsset.sku;
      let id = customAsset.id;
      const extensionProperties = { ...customAsset.extensionProperties };
      const modifiers = { ...customAsset.modifiers };
      let materialMask = customAsset.materialMask;
      let assetModifiers = customAsset.modifiers;

      if (newSave) {
        if (
          customAsset.transformation &&
          customAsset.transformation.length > 0
        ) {
          transformation = [...customAsset.transformation];
          transformation[3] = 0;
          transformation[7] = 0;
          transformation[11] = 0;
        }
        sku = Utils.guid();

        if (!extensionProperties.progenitorId) {
          extensionProperties.progenitorId = customAsset.sku;
        }
      } else {
        if (customAsset.transformation) {
          transformation = [...customAsset.transformation];
        }
      }

      if (newSave || !customAsset.custom) {
        id = 0;
        materialMask = customAsset.materialMask.map((material) =>
          material
            ? {
              ...material,
              id: Utils.guid(),
              mediaAssetId: null,
            }
            : null
        );

        assetModifiers = AssetModifierHelper.clearAllModifierFields(modifiers);
      }

      const modifiedAsset = {
        ...customAsset,
        id,
        sku,
        transformation,
        previewPath,
        extensionProperties,
        modifiers: assetModifiers,
        materialMask,
      };

      setCustomAsset(modifiedAsset);

      if (onSaveAsset && !newSave && customAsset.custom) {
        onSaveAsset(modifiedAsset);
      } else {
        dispatch(SaveCustomAsset(modifiedAsset));
      }
      handleClose(true)();
    });
  };

  const handleClose = (keepChanges: boolean) => () => {
    blueRef?.current?.dispose();
    setOpen(false);
    setMaterialsBak([]);
    setSelectedTab(0);
  };

  const initBlueRef = () => {
    const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
    const mediaAssetUrl = `${host}/Organization/${userProfile.organization_id}/MediaAssetFile/${props.asset.sku}`;
    blueRef.current = new ItemPreview(
      mediaAssetUrl,
      props.asset,
      blueElementRef.current,
      getMaterialsBak
    );
  };

  useEffect(() => {
    if (
      !actualDimensions?.height &&
      typeof blueRef?.current?.getSizeFromGeometry === 'function'
    ) {
      setActualDimensions({
        width: blueRef?.current.getSizeFromGeometry().width,
        height: blueRef?.current.getSizeFromGeometry().height,
        depth: blueRef?.current.getSizeFromGeometry().depth,
      });
    }
  }, [blueRef?.current]);

  useEffect(() => {
    blueRef?.current?.update(customAsset, getMaterialsBak);
  }, [customAsset]);

  const getMaterialsBak = (item) => () => {
    const materialsBak = blueRef?.current?.getMaterialsBak();
    setMaterialsBak(materialsBak);
    const newMaterialMask =
      customAsset.materialMask && customAsset.materialMask?.length !== 0
        ? customAsset.materialMask
        : materialsBak.map(() => null);
    setCustomAsset(
      produce(customAsset, (draft) => {
        draft.materialMask = newMaterialMask;
      })
    );
  };

  const handleTabSelect = (event, index: number) => {
    if (index !== selectedTab) {
      setSelectedTab(index);
    }
  };

  const updateCustomAssetMaterialMask = (materialMask: PlacezMaterial[]) => {
    setCustomAsset(
      produce(customAsset, (draft) => {
        draft.materialMask = materialMask;
      })
    );
  };

  const updateAssetInfo = (asset: Asset) => {
    setCustomAsset(
      produce(asset, (draft) => {
        draft.materialMask = customAsset.materialMask;
      })
    );
  };

  const updateAssetTransformation = (transformation: Matrix4) => {
    const transformationArray = new Matrix4()
      .copy(transformation)
      .multiplyScalar(1 / 100)
      .toArray();
    setCustomAsset(
      produce(customAsset, (draft) => {
        draft.transformation = transformationArray;
      })
    );
  };

  return (
    <>
      {asset && (
        <>
          {props.children &&
            cloneElement(props.children as ReactElement, {
              onClick: handleOpen,
            })}
          <Dialog
            className={classes.paper}
            open={open}
            aria-labelledby="material-editor-title"
            aria-describedby="material-editor-description"
            TransitionProps={{ onEntered: initBlueRef }}
            maxWidth="sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DialogTitle className={classes.dialogTitle}>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                textAlign="left"
              >
                <Grid item xs={6}>
                  Material Editor
                </Grid>
                <Grid item xs={6} textAlign="right" fontSize={16}>
                  {customAsset?.name || ''}
                </Grid>
              </Grid>
            </DialogTitle>

            <DialogContent
              style={{ overflow: 'hidden' }}
              classes={{ root: classes.root }}
            >
              <div className={classes.contentContainer}>
                <div
                  id="contentViewer"
                  ref={blueElementRef}
                  className={classes.viewer}
                />

                <div className={classes.tabsContainer}>
                  <Tabs
                    className={classes.tabs}
                    value={selectedTab}
                    onChange={handleTabSelect}
                    variant="fullWidth"
                    aria-label="asset editor tabs"
                  >
                    <Tab label="Details" className={classes.tabLabel} />
                    <Tab label="Materials" className={classes.tabLabel} />
                    <Tab label="Colors" className={classes.tabLabel} />
                    {/* Show or hide Measurements tab on based resizable attribute */}
                    {customAsset?.resizable ? (
                      <Tab label="Measurements" className={classes.tabLabel} />
                    ) : null}
                  </Tabs>

                  <div className={classes.tabContent}>
                    {selectedTab === 0 && (
                      <ItemInfoPanel
                        asset={customAsset}
                        updateAsset={updateAssetInfo}
                      />
                    )}
                    <Grid container>
                      <Grid
                        item
                        xs={3}
                      // style={{
                      //   borderRight: '1px solid #DEDBDB',
                      // }}
                      >
                        {selectedTab !== 0 && (
                          <ActiveMaterial
                            materialsBak={materialsBak}
                            asset={customAsset}
                            selectedMaterialIndex={selectedMaterialIndex}
                            setSelectedMaterialIndex={setSelectedMaterialIndex}
                            selectedMaterial={selectedMaterial}
                            setSelectedMaterial={setSelectedMaterial}
                            updateMaterialMask={updateCustomAssetMaterialMask}
                          />
                        )}
                      </Grid>
                      <Grid item xs={9}>
                        {selectedTab === 1 && (
                          <MaterialPanel
                            materialsBak={materialsBak}
                            asset={customAsset}
                            selectedMaterialIndex={selectedMaterialIndex}
                            setSelectedMaterialIndex={setSelectedMaterialIndex}
                            selectedMaterial={selectedMaterial}
                            setSelectedMaterial={setSelectedMaterial}
                            updateMaterialMask={updateCustomAssetMaterialMask}
                          />
                        )}
                        {selectedTab === 2 && (
                          <ColorPanel
                            materialsBak={materialsBak}
                            asset={customAsset}
                            selectedMaterialIndex={selectedMaterialIndex}
                            setSelectedMaterialIndex={setSelectedMaterialIndex}
                            selectedMaterial={selectedMaterial}
                            setSelectedMaterial={setSelectedMaterial}
                            updateMaterialMask={updateCustomAssetMaterialMask}
                          />
                        )}
                        {selectedTab === 3 && (
                          <EditSize
                            width={
                              actualDimensions.width ||
                              (blueRef?.current?.getSize()?.width ?? 1)
                            }
                            depth={
                              actualDimensions.depth ||
                              (blueRef?.current?.getSize()?.depth ?? 1)
                            }
                            height={
                              actualDimensions.height ||
                              (blueRef?.current?.getSize()?.height ?? 1)
                            }
                            onChange={(width, depth, height) => {
                              setActualDimensions({ width, depth, height });
                              const scaleVec = new Vector3(
                                width / blueRef?.current.getSize().width,
                                height / blueRef?.current.getSize().height,
                                depth / blueRef?.current.getSize().depth
                              );
                              blueRef?.current.item.scale.copy(
                                scaleVec.multiplyScalar(100)
                              );
                              blueRef?.current.item.updateMatrix();
                              updateAssetTransformation(
                                blueRef?.current.item.matrix
                              );
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button
                color="primary"
                className={classes.saveButton}
                variant="contained"
                onClick={saveAs(true)}
              >
                Create New
              </Button>
              <PlacezActionButton onClick={handleClose(false)}>
                Cancel
              </PlacezActionButton>
              <Button
                className={classes.saveButton}
                variant="contained"
                disabled={disableSave}
                onClick={saveAs(false)}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default CustomAssetDialog;
