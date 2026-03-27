import { useDispatch, useSelector } from 'react-redux';
import {
  Theme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { createStyles, makeStyles } from '@mui/styles';

import { CameraLayers } from '../../../models/BlueState';

import { ToggleButton, ToggleButtonGroup } from '@mui/lab';
import { AccountCircle, EventSeat } from '@mui/icons-material';

import { Asset, AssetModifiers } from '../../../blue/items/asset';
import {
  TableTypes,
  ChairParams,
  defaultChairParams,
} from '../../../blue/itemModifiers/ChairMod';
import { defaultPlaceSettingParams } from '../../../blue/itemModifiers/PlaceSettingMod';
import TabsPanel from './TabsPanel';
import TabsContent from './TabsContent';
import { ReduxState } from '../../../reducers';

import { TablePreview } from '../../../blue/TablePreview';
import { ConfigureAsset } from '../../../reducers/blue';
import { UnseatAttendee } from '../../../reducers/attendee';
import { createRef, useEffect, useRef, useState } from 'react';
import formModalStyles from '../../Styles/FormModal.css';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';

interface Props {
  asset: Asset;
  tableConfigModalOpen: boolean;
  onTableConfigured: Function;
  onConfigureCancel: Function;
  configuredItems?: { [assetId: string]: Asset };
}

const defaultTableType: TableTypes = TableTypes.Round;
const defaultNumberOfCenterpieces: number = 1;
const defaultCenterpiecePositions: number[] = [];
const defaultSku: any = 'default';
const defaultUrl: any = '';
const defaultSeats: number = 0;

const defaultChairState: ChairParams = {
  seatWidth: 50,
};

let blueRef;

const TableConfigModal = (props: Props) => {
  const assetsBySku = useSelector((state: ReduxState) => state.asset.bySku);
  const catalogs = useSelector((state: ReduxState) => state.asset.allCatalogs);
  const userProfile = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );
  const attendees = useSelector(
    (state: ReduxState) => state.attendee.attendees
  );

  const dispatch = useDispatch();

  const blueElementRef = createRef<HTMLDivElement>();

  const [tableConfigTabIndex, setTableConfigTabIndex] = useState(0);
  const [cameraLayers, setCameraLayers] = useState([]);

  const prevModifiers = useRef<AssetModifiers>();

  const [modifiers, setModifiers] = useState<AssetModifiers>({});

  useEffect(() => {
    if (
      prevModifiers.current === undefined ||
      JSON.stringify(prevModifiers.current) !== JSON.stringify(modifiers)
    ) {
      blueRef?.update(updateAssetByModifiers(props.asset, modifiers));
      prevModifiers.current = modifiers;
    }
  }, [modifiers]);

  useEffect(() => {
    blueRef?.setCameraLayers(cameraLayers);
  }, [cameraLayers]);

  const handleModifierAssetChange =
    <
      modifierKey extends keyof AssetModifiers,
      modifierParamKey extends keyof AssetModifiers[modifierKey],
    >(
      assetModifierKey: modifierKey,
      keyOfAssetModifierKey: modifierParamKey
    ) =>
    (asset: Asset) => {
      setModifiers({
        ...modifiers,
        [assetModifierKey]: {
          ...modifiers[assetModifierKey],
          assetModifierKey: asset,
          [keyOfAssetModifierKey]: asset,
        },
      });
    };

  const handleAssetModOnChange =
    <
      modifierKey extends keyof AssetModifiers,
      modifierParamKey extends keyof AssetModifiers[modifierKey],
    >(
      assetModifierKey: modifierKey,
      keyOfAssetModifierKey: modifierParamKey
    ) =>
    (event, value: AssetModifiers[modifierKey][modifierParamKey]) => {
      setModifiers({
        ...modifiers,
        [assetModifierKey]: {
          ...modifiers[assetModifierKey],
          [keyOfAssetModifierKey]: value,
        },
      });
    };

  const handleToggleSeatHidden = (chairIndex: number) => (event?: any) => {
    dispatch(UnseatAttendee(chairIndex, props.asset.instanceId, true));
  };

  const handleModifiersChanged = (newModifiers: AssetModifiers) => {
    // if you check anything else will infinite loop
    if (
      newModifiers?.chairMod?.seatPositions !== undefined &&
      JSON.stringify(newModifiers?.chairMod?.seatPositions) !==
        JSON.stringify(prevModifiers.current?.chairMod?.seatPositions)
    ) {
      setModifiers(newModifiers);
    }
  };

  const handleSwitchChange =
    <
      modifierKey extends keyof AssetModifiers,
      modifierParamKey extends keyof AssetModifiers[modifierKey],
    >(
      assetModifierKey: modifierKey,
      keyOfAssetModifierKey: modifierParamKey
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setModifiers({
        ...modifiers,
        [assetModifierKey]: {
          ...modifiers[assetModifierKey],
          [keyOfAssetModifierKey]: event.target.checked,
        },
      });
    };

  const onModalClose = () => {
    setTableConfigTabIndex(0);
    const updatedItem = updateAssetByModifiers(props.asset, modifiers);
    blueRef.takePic((previewPath: string) => {
      updatedItem.previewPath = previewPath;
      dispatch(ConfigureAsset(updatedItem));
      props.onTableConfigured(updatedItem);
    });
  };

  const onModalCancel = () => {
    setTableConfigTabIndex(0);
    props.onConfigureCancel();
  };

  const updateAssetByModifiers = (
    asset: Asset,
    modifiers: AssetModifiers
  ): Asset => {
    const newModifiers: AssetModifiers = {};

    if (asset?.modifiers?.chairMod) {
      const chairMod = asset.modifiers.chairMod;
      newModifiers.chairMod = {
        ...chairMod,
        chairAsset: modifiers?.chairMod?.chairAsset,
        chairAssetId: modifiers?.chairMod?.chairAsset?.id,
        seats: modifiers?.chairMod?.seats,
        seatWidth: modifiers?.chairMod?.seatWidth ?? 50,
        distance: modifiers?.chairMod?.distance ?? 0,
        top: modifiers?.chairMod?.top ?? true,
        bottom: modifiers?.chairMod?.bottom ?? true,
        left: modifiers?.chairMod?.left ?? true,
        right: modifiers?.chairMod?.right ?? true,
        equalSpacing: modifiers?.chairMod?.equalSpacing ?? true,
        seatPositions: modifiers?.chairMod?.seatPositions ?? [],
      };
    }

    if (asset?.modifiers?.centerpieceMod) {
      const centerpieceMod = asset.modifiers.centerpieceMod;

      newModifiers.centerpieceMod = {
        ...centerpieceMod,
        centerpieceAsset: modifiers?.centerpieceMod?.centerpieceAsset,
        centerpieceAssetId: modifiers?.centerpieceMod?.centerpieceAsset?.id,
        tableType: modifiers?.chairMod?.tableType,
        numberOfCenterpieces: defaultNumberOfCenterpieces,
        centerpiecePositions: centerpieceMod.centerpiecePositions
          ? centerpieceMod.centerpiecePositions
          : defaultCenterpiecePositions,
        transformation: modifiers?.centerpieceMod?.transformation,
      };
    }

    if (asset?.modifiers?.placeSettingMod) {
      const placeSettingMod = asset.modifiers.placeSettingMod;

      newModifiers.placeSettingMod = {
        ...placeSettingMod,
        placeSettingAsset: modifiers?.placeSettingMod?.placeSettingAsset,
        placeSettingAssetId: modifiers?.placeSettingMod?.placeSettingAsset?.id,
        distance: modifiers?.placeSettingMod?.distance ?? 0,
      };
    }

    if (asset?.modifiers?.linenMod) {
      const linenMod = asset.modifiers.linenMod;

      newModifiers.linenMod = {
        ...linenMod,
        linenAsset: modifiers?.linenMod?.linenAsset,
        linenAssetId: modifiers?.linenMod?.linenAsset?.id,
        transformation: modifiers?.linenMod?.transformation,
      };
    }

    return {
      ...asset,
      modifiers: newModifiers,
    };
  };

  useEffect(() => {
    setModifierFromAsset(props.asset);
  }, [props.asset]);

  const setModifierFromAsset = (asset: Asset) => {
    const modifiers = {
      chairMod: {
        ...defaultChairParams,
        ...asset?.modifiers?.chairMod,
        top: asset?.modifiers?.chairMod?.top ?? true,
        bottom: asset?.modifiers?.chairMod?.bottom ?? true,
        left: asset?.modifiers?.chairMod?.left ?? true,
        right: asset?.modifiers?.chairMod?.right ?? true,
        equalSpacing: asset?.modifiers?.chairMod?.equalSpacing ?? true,
      },
      placeSettingMod: {
        ...defaultPlaceSettingParams,
        ...asset?.modifiers?.placeSettingMod,
      },
      linenMod: {
        ...asset?.modifiers?.linenMod,
      },
      centerpieceMod: {
        ...asset?.modifiers?.centerpieceMod,
      },
    };

    if (
      asset?.modifiers?.chairMod &&
      asset.modifiers.chairMod.chairAsset === null &&
      asset.modifiers.chairMod?.seats === null
    ) {
      modifiers.chairMod.chairAsset = assetsBySku['CHR-5630B436'];
    }
    if (
      asset?.modifiers?.chairMod &&
      asset.modifiers.chairMod?.seats === null
    ) {
      modifiers.chairMod.seats = asset?.modifiers?.chairMod?.maxSeats;
    }

    setTableConfigTabIndex(0);
    setCameraLayers([]);
    setModifiers(modifiers);
  };

  const initBlueRef = () => {
    const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
    const mediaAssetUrl = `${host}/Organization/${userProfile.organization_id}/MediaAssetFile/${asset.sku}`;
    blueRef = new TablePreview(
      mediaAssetUrl,
      props.asset,
      blueElementRef.current,
      handleToggleSeatHidden,
      handleModifiersChanged,
      attendees
    );
  };

  const handleClose = () => {
    blueRef.dispose();
  };

  const { tableConfigModalOpen, asset } = props;

  const localClasses = localStyles(props);
  const styles = makeStyles<Theme>(formModalStyles);
  const classes = {
    ...styles(props),
    ...localClasses,
  };

  return (
    <Dialog
      classes={{
        paper: classes.modal,
        paperScrollPaper: classes.paperScrollPaper,
      }}
      open={tableConfigModalOpen}
      aria-labelledby="scene-place-modal"
      fullWidth={true}
      TransitionProps={{
        onEntered: initBlueRef,
      }}
      onClose={handleClose}
      maxWidth="lg"
      disableEscapeKeyDown={true}
    >
      <DialogTitle className={classes.dialogTitle}>Table Wizard</DialogTitle>
      <DialogContent className={classes.dialogContentRoot}>
        <div className={classes.left} id="contentViewer" ref={blueElementRef} />
        <div className={classes.panel}>
          <div className={classes.panelUpper}>
            <TabsPanel
              modifiers={modifiers}
              handleTabChange={(e, v) => setTableConfigTabIndex(v)}
              handleAssetModOnChange={handleAssetModOnChange}
              handleSwitchChange={handleSwitchChange}
              tableConfigTabIndex={tableConfigTabIndex}
            />
          </div>
          <div className={classes.panelLower}>
            <TabsContent
              modifiers={modifiers}
              asset={asset}
              tableConfigTabIndex={tableConfigTabIndex}
              catalogs={catalogs}
              handleModifierAssetChange={handleModifierAssetChange}
            />
          </div>
        </div>
        <ToggleButtonGroup
          style={{
            position: 'absolute',
            top: '70px',
            left: '5px',
            marginBottom: '-48px',
          }}
          value={cameraLayers}
          onChange={(e, v) => setCameraLayers(v)}
        >
          <ToggleButton value={CameraLayers.ChairNumberLabel} aria-label="list">
            <EventSeat />
          </ToggleButton>
          <ToggleButton value={CameraLayers.AttendeeLabel} aria-label="module">
            <AccountCircle />
          </ToggleButton>
        </ToggleButtonGroup>
        {modifiers?.chairMod?.seats > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '68px',
              left: '320px',
              pointerEvents: 'none',
            }}
          >
            *Click Chair To Hide
          </div>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <PlacezActionButton className={classes.button} onClick={onModalCancel}>
          Cancel
        </PlacezActionButton>
        <PlacezActionButton className={classes.button} onClick={onModalClose}>
          Confirm
        </PlacezActionButton>
      </DialogActions>
    </Dialog>
  );
};

const localStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '5px',
      overflow: 'hidden',
    },
    modal: {},
    paperScrollPaper: {
      height: '80%',
    },
    button: {
      padding: '4px 30px',
      borderRadius: theme.shape.borderRadius,
      width: '120px',
    },
    dialogContentRoot: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      padding: '0px !important',
      overflow: 'hidden',
    },
    actions: {
      borderTop: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      margin: 0,
      padding: theme.spacing(2),
      fontSize: '40px',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
    left: {
      flex: 3,
      minWidth: 0,
      backgroundImage: 'radial-gradient(#f5f5f5, #909090)',
    },
    panel: {
      width: '400px !important',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.paper,
      overflow: 'hidden',
      minHeight: '0px !important',
    },
    panelUpper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      flexShrink: 0,
    },
    panelLower: {
      height: '100%',
      overFlowY: 'auto',
      overflowX: 'hidden',

      // flex: '1 1 0px',
      // minHeight: '0px !important',
      // display: 'flex',
      // flexDirection: 'column',
      // padding: '0px',
      // width: '100%',
    },
    panelFooter: {
      display: 'flex',
      flexShink: 0,
      flexDirection: 'column',
      alignItems: 'stretch',
      backgroundColor: theme.palette.background.paper,
    },
  })
);

export default TableConfigModal;
