import React, { useState, MouseEvent } from 'react';
import {
  createStyles,
  IconButton,
  Input,
  Popover,
  styled,
  Theme,
  Tooltip,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import {
  Add,
  AspectRatio,
  DoneAll,
  Lock,
  LockOpen,
  Remove,
  RemoveDone,
  RotateLeft,
  RotateRight,
  ThreeDRotation,
} from '@mui/icons-material';

import classnames from 'classnames';
import { ReduxState } from '../../../../reducers';
import { GridCell, Utils } from '../../../../blue/core/utils';
import { CameraLayers } from '../../../../models/BlueState';
import { GlobalViewState, ViewState } from '../../../../models/GlobalState';
import { useDispatch, useSelector } from 'react-redux';
import {
  AutoRotatePhotosphereCamera,
  ChangeCopiedAssetsState,
  FitToView,
  NeedSaveAction,
  RotateCamera,
  SetAutoRotate,
  SetMultiSelect,
  ZoomIn,
  ZoomOut,
  ChangeCameraLayersState,
} from '../../../../reducers/blue';
import { canEditLayout } from '../../../../reducers/globalState';
import {
  LocalStorageKey,
  useLocalStorageState,
} from '../../../Hooks/useLocalStorageState';
import { ClearClipboardIcon } from '../../../../assets/icons';
import LockToggle from './ViewOptionsBar/LockToggle';
import SectionViewToggle from './ViewOptionsBar/SectionViewToggle';
import { ControlsType } from '../../models';
import {
  FloorPlanModes,
  SetFloorPlanMode,
} from '../../../../reducers/floorPlan';
import VisibilityPanel from './VisibilityPanelBar';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

interface Props {
  fullScreen?: boolean;
  globalState: GlobalViewState;
}

export const ZoomIconButton = styled(IconButton)(({ theme }) => ({
  ...theme.PlacezLightBorderStyles,
  width: '32px',
  height: '32px',
  margin: '4px',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
}));

const DesignerBottomBar = (props: Props) => {
  const rotateBy: number = 22.5;
  const dispatch = useDispatch();

  const designerRotation: number = useSelector(
    (state: ReduxState) =>
      state.designer?.floorPlan?.cameraState?.orthographicState?.rotation
  );
  const layoutRotation: number = useSelector(
    (state: ReduxState) =>
      state.designer?.layout?.cameraState?.orthographicState?.rotation
  );
  const degreeAngle: number = useSelector(
    (state: ReduxState) => state.blue?.degreeAngle
  );

  const gridCellSize: GridCell = useSelector(
    (state: ReduxState) => state.blue.gridCellSize
  );
  const cameraLayers: CameraLayers[] = useSelector(
    (state: ReduxState) => state.blue.cameraLayers
  );
  const viewState: ViewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );
  const allowUpdateLayout: boolean = useSelector((state: ReduxState) =>
    canEditLayout(state)
  );

  const [gridCellLocked, setGridCellLocked] = useLocalStorageState(
    LocalStorageKey.GridCellLocked
  );

  const [dimensionCutoff, setDimensionCutoff] = useLocalStorageState(
    LocalStorageKey.DimensionCutoff,
    3
  );

  const [dimensionLabelWidth, setDimensionLabelWidth] = useLocalStorageState(
    LocalStorageKey.DimensionLabelWidth,
    230
  );

  const autoRotate = useSelector((state: ReduxState) => state.blue.autoRotate);
  const autoRotatePhotosphereCamera = useSelector(
    (state: ReduxState) => state.blue.autoRotatePhotosphereCamera
  );
  const controlsType = useSelector(
    (state: ReduxState) => state.blue.controlsType
  );
  const copiedAssets = useSelector(
    (state: ReduxState) => state.blue.copiedAssets
  );
  const multiSelect = useSelector(
    (state: ReduxState) => state.blue.multiSelect
  );

  const { fullScreen } = props;

  const classes = styles(props);
  const theme = useTheme();

  const rotateValue = degreeAngle ? 360 - Math.abs(degreeAngle) : 0;

  const [visibilityAnchorEl, setVisibilityAnchorEl] =
    useState<HTMLElement | null>(null);
  const isVisibilityPanelOpen = Boolean(visibilityAnchorEl);

  const handleVisibilityToggle = (event: MouseEvent<HTMLElement>) => {
    if (isVisibilityPanelOpen) {
      setVisibilityAnchorEl(null);
    } else {
      setVisibilityAnchorEl(event.currentTarget);
    }
  };

  const handleVisibilityClose = () => {
    setVisibilityAnchorEl(null);
  };

  const isGridVisible = cameraLayers.includes(CameraLayers.Grid);
  const isFloorplanVisible = cameraLayers.includes(
    CameraLayers.FloorplaneImage
  );

  const handleToggleGrid = () => {
    const nextVisible = !isGridVisible;

    let nextLayers: CameraLayers[] = cameraLayers;
    if (nextVisible) {
      if (!nextLayers.includes(CameraLayers.Grid)) {
        nextLayers = [...nextLayers, CameraLayers.Grid];
      }
    } else {
      nextLayers = nextLayers.filter((layer) => layer !== CameraLayers.Grid);
    }

    dispatch(ChangeCameraLayersState(nextLayers, true));
  };

  const handleToggleFloorplan = () => {
    const nextVisible = !isFloorplanVisible;

    let nextLayers: CameraLayers[] = cameraLayers;
    if (nextVisible) {
      if (!nextLayers.includes(CameraLayers.FloorplaneImage)) {
        nextLayers = [...nextLayers, CameraLayers.FloorplaneImage];
      }
    } else {
      nextLayers = nextLayers.filter(
        (layer) => layer !== CameraLayers.FloorplaneImage
      );
    }

    dispatch(ChangeCameraLayersState(nextLayers, true));
  };

  return (
    <div
      className={
        fullScreen ? classnames(classes.root, classes.fullScreen) : classes.root
      }
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <LockToggle />
        {controlsType !== ControlsType.PointerLock &&
          (viewState === ViewState.Floorplan ||
            viewState === ViewState.TwoDView) && (
            <>
              <Tooltip title="Multi-Select">
                <ZoomIconButton
                  value={'multiSelect'}
                  onClick={() => {
                    dispatch(SetMultiSelect(!multiSelect));
                    if (window.location.pathname.match('floorplan')) {
                      dispatch(SetFloorPlanMode(FloorPlanModes.MOVE));
                    }
                  }}
                  style={{
                    color: multiSelect ? theme.palette.primary.main : undefined,
                  }}
                >
                  {multiSelect ? <RemoveDone /> : <DoneAll />}
                </ZoomIconButton>
              </Tooltip>

              {/* Visibility Panel toggle */}
              <Tooltip title="Visibility Options">
                <ZoomIconButton
                  onClick={handleVisibilityToggle}
                  style={{
                    color: isVisibilityPanelOpen
                      ? theme.palette.primary.main
                      : undefined,
                  }}
                >
                  <VisibilityOutlinedIcon />
                </ZoomIconButton>
              </Tooltip>

              <Popover
                open={isVisibilityPanelOpen}
                anchorEl={visibilityAnchorEl}
                onClose={handleVisibilityClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                disableRestoreFocus
              >
                <VisibilityPanel
                  isGridVisible={isGridVisible}
                  onToggleGrid={handleToggleGrid}
                  isFloorplanVisible={isFloorplanVisible}
                  onToggleFloorplan={handleToggleFloorplan}
                  dimensionCutoff={dimensionCutoff}
                  onDimensionCutoffChange={setDimensionCutoff}
                  dimensionLabelWidth={dimensionLabelWidth}
                  onDimensionLabelWidthChange={setDimensionLabelWidth}
                />
              </Popover>
            </>
          )}
        {copiedAssets !== undefined && (
          <Tooltip title="Clear Clipboard">
            <IconButton
              onClick={() => {
                dispatch(ChangeCopiedAssetsState(undefined));
              }}
              aria-label="Clear Clipboard"
              classes={{
                root: classes.button,
              }}
            >
              <ClearClipboardIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {viewState === ViewState.PhotosphereView ||
          (viewState === ViewState.PhotosphereEdit && (
            <Tooltip title="Auto-Rotate Camera">
              <ZoomIconButton
                value="autoRotateCamera"
                name="autoRotate"
                aria-label="label"
                onClick={() =>
                  dispatch(
                    AutoRotatePhotosphereCamera(!autoRotatePhotosphereCamera)
                  )
                }
                style={{
                  color: autoRotatePhotosphereCamera
                    ? theme.palette.primary.main
                    : undefined,
                }}
              >
                <ThreeDRotation />
              </ZoomIconButton>
            </Tooltip>
          ))}
        {viewState === ViewState.ThreeDView && (
          <Tooltip title="3D Rotate">
            <ZoomIconButton
              value={'3d-rotate'}
              onClick={(e) => dispatch(SetAutoRotate(!autoRotate))}
              style={{
                color: autoRotate ? theme.palette.primary.main : undefined,
              }}
            >
              <ThreeDRotation />
            </ZoomIconButton>
          </Tooltip>
        )}
        <SectionViewToggle />
        {(cameraLayers.includes(CameraLayers.Grid) ||
          viewState === ViewState.Floorplan) && (
          <Tooltip title="Grid Cell Size">
            <div
              style={{
                ...theme.PlacezLightBorderStyles,
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'end',
                margin: '4px',
                backgroundColor: theme.palette.background.paper,
                width: '90px',
                pointerEvents: 'none',
              }}
            >
              {Utils.unitsOutString(
                gridCellSize.cmSize,
                undefined,
                undefined,
                0
              )}
              {gridCellLocked && (
                <IconButton
                  style={{ pointerEvents: 'auto' }}
                  aria-label="Clone Scene"
                  onClick={() => setGridCellLocked(false)}
                >
                  <Lock fontSize="small" />
                </IconButton>
              )}
              {!gridCellLocked && (
                <IconButton
                  style={{ pointerEvents: 'auto' }}
                  aria-label="Clone Scene"
                  onClick={() => setGridCellLocked(true)}
                >
                  <LockOpen fontSize="small" />
                </IconButton>
              )}
            </div>
          </Tooltip>
        )}
        <Tooltip title="Zoom Out">
          <ZoomIconButton onClick={() => dispatch(ZoomIn())}>
            <Remove />
          </ZoomIconButton>
        </Tooltip>
        <Tooltip title="Zoom In">
          <ZoomIconButton onClick={() => dispatch(ZoomOut())}>
            <Add />
          </ZoomIconButton>
        </Tooltip>
        {(viewState === ViewState.TwoDView ||
          viewState === ViewState.Floorplan) && (
          <>
            <Tooltip title="Rotate Clockwise">
              <ZoomIconButton
                onClick={() => {
                  dispatch(RotateCamera(360 - rotateValue - 1));
                  if (allowUpdateLayout) dispatch(NeedSaveAction(true));
                }}
              >
                <RotateRight />
              </ZoomIconButton>
            </Tooltip>
            <Input
              disableUnderline
              style={{
                ...theme.PlacezLightBorderStyles,
                height: '32px',
                width: '60px',
                margin: '4px',
                backgroundColor: theme.palette.background.paper,
              }}
              id="standard-basic"
              onChange={(e) => {
                if (parseInt(e.target.value, 10) > 360) return;
                dispatch(RotateCamera(360 - parseInt(e.target.value, 10)));
                if (allowUpdateLayout) dispatch(NeedSaveAction(true));
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              inputProps={{
                style: { textAlign: 'center' },
                maxLength: 3,
              }}
              value={rotateValue}
            />
            <Tooltip title="Rotate Counterclockwise">
              <ZoomIconButton
                onClick={() => {
                  dispatch(RotateCamera(360 - rotateValue + 1));
                  if (allowUpdateLayout) dispatch(NeedSaveAction(true));
                }}
              >
                <RotateLeft />
              </ZoomIconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="Fit to View">
          <ZoomIconButton onClick={() => dispatch(FitToView())}>
            <AspectRatio />
          </ZoomIconButton>
        </Tooltip>
      </div>
    </div>
  );
};

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      margin: '4px',
      display: 'flex',
      flexDirection: 'row',
      pointerEvents: 'none',
      '& > *': {
        pointerEvents: 'auto',
      },
    },
    fullScreen: {
      right: 0,
    },
    button: {},
  })
);

export default DesignerBottomBar;
