import { Backdrop, Popover, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import panelStyles from '../../../Styles/panels.css';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../../reducers';
import { useRef, useState } from 'react';
import { CameraLayers, ProhibitedLayers } from '../../../../models/BlueState';
import { GlobalViewState, ViewState } from '../../../../models/GlobalState';
import { LocalStorageKey } from '../../../Hooks/useLocalStorageState';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import CameraLayerSetting from '../bars/ViewOptionsBar/CameraLayerSetting';
import { canEditLayout, LicenseType } from '../../../../reducers/globalState';
import { CameraType } from '../../models';

const CameraLayerPopover = () => {
  const theme: Theme = useTheme();
  const styles = makeStyles<Theme>(panelStyles);
  const classes = styles();
  const viewState = useSelector(
    (state: ReduxState) => state.globalstate.viewState
  );
  const globalViewState = useSelector(
    (state: ReduxState) => state.globalstate.globalViewState
  );
  const floorPlanMode =
    globalViewState === GlobalViewState.Fixtures &&
    viewState === ViewState.Floorplan;

  const layoutEditable = useSelector((state: ReduxState) =>
    canEditLayout(state)
  );

  const anchorRef = useRef<HTMLDivElement>(null);

  const prohibitedLayers = ProhibitedLayers[viewState]?.cameraLayers ?? [];

  const [open, setOpen] = useState(false);

  const togglePopover = (event) => {
    setOpen(!open);
  };

  const handlClose = () => {
    setOpen(false);
  };

  const currentFloorPlan = useSelector(
    (state: ReduxState) => state.designer.floorPlan
  );
  const license = useSelector(
    (state: ReduxState) => state.globalstate.licenseState
  );

  const cameraType = useSelector((state: ReduxState) => state.blue.cameraType);

  return (
    <>
      {/* <IconButton
      ref={anchorRef}
      aria-describedby={id}
      onClick={togglePopover}>
      <Visibility />
    </IconButton> */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          height: '32px',
        }}
        ref={anchorRef}
        onClick={togglePopover}
      >
        <Typography variant="body1" style={{ marginRight: '8px' }}>
          View Options
        </Typography>
        {open ? <ArrowDropUp /> : <ArrowDropDown />}
      </div>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handlClose}
      >
        <Popover
          open={open}
          onClose={handlClose}
          anchorEl={anchorRef.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          style={{
            marginTop: '22px',
            marginLeft: '-4px',
          }}
        >
          <div
            style={{
              width: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {viewState !== ViewState.PhotosphereView &&
              viewState !== ViewState.Floorplan && (
                <CameraLayerSetting
                  layers={[CameraLayers.TitleLabel]}
                  conflictLayers={[CameraLayers.NumberLabel]}
                  label={LocalStorageKey.ItemLabel}
                  scale
                />
              )}

            {viewState !== ViewState.PhotosphereView &&
              viewState !== ViewState.Floorplan && (
                <CameraLayerSetting
                  layers={[CameraLayers.NumberLabel]}
                  conflictLayers={[CameraLayers.TitleLabel]}
                  label={LocalStorageKey.NumberLabel}
                  scale
                />
              )}
            {/* {ViewState === ViewState.Floorplan &&
          globalViewState === GlobalViewState.Fixtures && (
            <DimensionCutoffToggle min={0} step={5} max={1525} />
          )} */}
            {globalViewState !== GlobalViewState.Fixtures &&
              viewState !== ViewState.Floorplan && (
                <CameraLayerSetting
                  layers={[CameraLayers.TableNumberLabel]}
                  label={LocalStorageKey.TableNumber}
                  scale
                />
              )}
            {viewState !== ViewState.PhotosphereView &&
              viewState !== ViewState.Floorplan && (
                <CameraLayerSetting
                  layers={[CameraLayers.ChairNumberLabel]}
                  label={LocalStorageKey.ChairNumber}
                  scale
                />
              )}
            {viewState !== ViewState.Floorplan && (
              <CameraLayerSetting
                layers={[CameraLayers.LayoutLabels]}
                label={LocalStorageKey.Notes}
                scale
                disabled={viewState === ViewState.LabelView}
              />
            )}
            {layoutEditable && viewState !== ViewState.Floorplan && (
              <CameraLayerSetting
                layers={[CameraLayers.Measurments]}
                label={LocalStorageKey.Dimensions}
                scale
                disabled={viewState === ViewState.ShapeView}
              />
            )}
            {!prohibitedLayers.includes(CameraLayers.Grid) && (
              <CameraLayerSetting
                layers={[CameraLayers.Grid]}
                label={LocalStorageKey.Grid}
              />
            )}
            {!prohibitedLayers.includes(CameraLayers.Mask) &&
              license === LicenseType.PlacezPro &&
              !floorPlanMode && (
                <CameraLayerSetting
                  layers={[CameraLayers.Mask]}
                  label={LocalStorageKey.MaskObjects}
                />
              )}
            {!prohibitedLayers.includes(CameraLayers.Walls) &&
              (license === LicenseType.PlacezPlus ||
                license === LicenseType.PlacezPro) &&
              !floorPlanMode && (
                <CameraLayerSetting
                  layers={[CameraLayers.Walls]}
                  label={LocalStorageKey.WallObjects}
                />
              )}
            {viewState !== ViewState.StreetView &&
              (cameraType === CameraType.FPVCamera ||
                viewState === ViewState.PhotosphereView ||
                viewState === ViewState.PhotosphereEdit) && (
                <CameraLayerSetting
                  layers={[CameraLayers.PhotosphereCameras]}
                  label={LocalStorageKey.PhotosphereCameras}
                />
              )}
            {!prohibitedLayers.includes(CameraLayers.FloorplaneImage) &&
              currentFloorPlan?.floorplanImageUrl && (
                <CameraLayerSetting
                  layers={[CameraLayers.FloorplaneImage]}
                  label={LocalStorageKey.FloorplanImage}
                  excludeLayers={[
                    CameraLayers.Floorplanes,
                    CameraLayers.BasePlanes,
                  ]}
                />
              )}
          </div>
        </Popover>
      </Backdrop>
    </>
  );
};
export default CameraLayerPopover;
